import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import fs from 'fs';
import path from 'path';

interface ExamData {
  id: string;
  group?: string;
  name: string;
  short_name?: string;
  board: string;
  status: string;
  last_date?: string | null;
  form_start?: string | null;
  expected_vacancies?: string;
  official_url: string;
  fee?: Record<string, number>;
  eligibility?: Record<string, string | number | string[]>;
  selection_process?: string[];
  subjects?: string[];
  last_verified: string;
  disclaimer: string;
  [key: string]: unknown;
}

interface ExamsFile {
  last_updated: string;
  updated_by: string;
  disclaimer: string;
  category_relaxations: Record<string, unknown>;
  documents_required_always: string[];
  computer_qualifications_accepted: string[];
  sso_id_steps: Record<string, unknown>;
  exams: ExamData[];
}

function getExamsPath() {
  return path.join(process.cwd(), 'data', 'exams.json');
}

function readExamsFile(): ExamsFile {
  try {
    const raw = fs.readFileSync(getExamsPath(), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      last_updated: new Date().toISOString().split('T')[0],
      updated_by: 'admin',
      disclaimer: '',
      category_relaxations: {},
      documents_required_always: [],
      computer_qualifications_accepted: [],
      sso_id_steps: {},
      exams: [],
    };
  }
}

function writeExamsFile(data: ExamsFile) {
  fs.writeFileSync(getExamsPath(), JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = readExamsFile();
    const { searchParams } = new URL(req.url);
    const group = searchParams.get('group');

    let exams = data.exams;
    if (group) {
      exams = exams.filter(e => e.group === group);
    }

    return NextResponse.json({ exams, meta: { last_updated: data.last_updated, total: data.exams.length } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to read exams: ' + message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, group, name, short_name, board, status, last_date, form_start, expected_vacancies, official_url, fee, eligibility, selection_process, subjects, disclaimer } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'Exam ID and Name required' }, { status: 400 });
    }

    const data = readExamsFile();
    const idx = data.exams.findIndex(e => e.id === id);

    const exam: ExamData = {
      id,
      group: group || '',
      name,
      short_name: short_name || '',
      board: board || '',
      status: status || 'expected',
      last_date: last_date || null,
      form_start: form_start || null,
      expected_vacancies: expected_vacancies || '',
      official_url: official_url || '',
      fee: fee || {},
      eligibility: eligibility || { education: '' },
      selection_process: selection_process || [],
      subjects: subjects || [],
      last_verified: new Date().toISOString().split('T')[0],
      disclaimer: disclaimer || '',
    };

    if (idx >= 0) {
      data.exams[idx] = { ...data.exams[idx], ...exam, last_verified: new Date().toISOString().split('T')[0] };
    } else {
      data.exams.push(exam);
    }

    data.last_updated = new Date().toISOString().split('T')[0];
    writeExamsFile(data);

    return NextResponse.json(exam);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to save exam: ' + message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { examId } = await req.json();
    if (!examId) {
      return NextResponse.json({ error: 'Exam ID required' }, { status: 400 });
    }

    const data = readExamsFile();
    data.exams = data.exams.filter(e => e.id !== examId);
    data.last_updated = new Date().toISOString().split('T')[0];
    writeExamsFile(data);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete exam: ' + message }, { status: 500 });
  }
}
