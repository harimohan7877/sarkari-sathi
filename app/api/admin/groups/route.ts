import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: groups, error } = await supabaseAdmin
      .from('marketplace_groups')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      // Fallback: return data from static marketplace_data.json
      const { default: marketplaceData } = await import('@/data/marketplace_data.json');
      const groupsList = Object.entries(marketplaceData).map(([name, exams]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        logo_url: null,
        exams: (exams as Array<{ sl: number; id: number; name_en: string }>).map(e => ({
          id: e.id,
          name_en: e.name_en,
          sl: e.sl,
        })),
      }));
      return NextResponse.json(groupsList);
    }

    return NextResponse.json(groups || []);
  } catch (error: unknown) {
    console.error('Admin groups query error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, name_hi, meta_title, meta_description, logo_url, exams } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'Group ID and Name required' }, { status: 400 });
    }

    const groupData: Record<string, unknown> = {
      id,
      name,
      logo_url: logo_url || null,
    };
    if (name_hi) groupData.name_hi = name_hi;
    if (meta_title) groupData.meta_title = meta_title;
    if (meta_description) groupData.meta_description = meta_description;
    if (exams) groupData.exams = exams;

    const { data, error } = await supabaseAdmin
      .from('marketplace_groups')
      .upsert(groupData)
      .select()
      .single();

    if (error) {
      // Fallback: just return success with the data
      return NextResponse.json({ id, name, name_hi, meta_title, meta_description, exams, _fallback: true });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Admin group create error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to save group: ' + message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { groupId } = await req.json();
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('marketplace_groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Admin group delete error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete group: ' + message }, { status: 500 });
  }
}
