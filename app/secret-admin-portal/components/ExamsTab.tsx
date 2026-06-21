"use client";

import { useState, useEffect, startTransition } from "react";

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
}

interface GroupData {
  id: string;
  name: string;
}

interface ExamFormData {
  id: string;
  group: string;
  name: string;
  short_name: string;
  board: string;
  status: string;
  last_date: string;
  form_start: string;
  expected_vacancies: string;
  official_url: string;
  fee_general: string;
  fee_obc: string;
  fee_sc_st: string;
  eligibility_education: string;
  eligibility_min_age: string;
  eligibility_max_age: string;
  disclaimer: string;
}

export default function ExamsTab({ getAuthHeaders }: { getAuthHeaders: () => Record<string, string> }) {
  const [exams, setExams] = useState<ExamData[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterGroup, setFilterGroup] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState<ExamFormData>({
    id: '', group: '', name: '', short_name: '', board: '', status: 'expected',
    last_date: '', form_start: '', expected_vacancies: '', official_url: '',
    fee_general: '', fee_obc: '', fee_sc_st: '', eligibility_education: '',
    eligibility_min_age: '', eligibility_max_age: '', disclaimer: '',
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const url = filterGroup ? `/api/admin/exams?group=${filterGroup}` : '/api/admin/exams';
      const [examRes, groupRes] = await Promise.all([
        fetch(url, { headers: getAuthHeaders() }),
        fetch('/api/admin/groups', { headers: getAuthHeaders() }),
      ]);
      if (examRes.ok) {
        const data = await examRes.json();
        setExams(data.exams || []);
      }
      if (groupRes.ok) setGroups(await groupRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { startTransition(() => { fetchExams(); }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterGroup]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const openDrawer = (exam?: ExamData) => {
    if (exam) {
      setForm({
        id: exam.id,
        group: exam.group || '',
        name: exam.name,
        short_name: exam.short_name || '',
        board: exam.board,
        status: exam.status,
        last_date: exam.last_date || '',
        form_start: exam.form_start || '',
        expected_vacancies: exam.expected_vacancies || '',
        official_url: exam.official_url,
        fee_general: String(exam.fee?.general_OBC_creamy ?? exam.fee?.general_ews ?? exam.fee?.general ?? ''),
        fee_obc: String(exam.fee?.obc_sbc ?? exam.fee?.SC_ST_OBC_non_creamy_EWS_PwD ?? ''),
        fee_sc_st: String(exam.fee?.sc_st ?? ''),
        eligibility_education: typeof exam.eligibility?.education === 'string' ? exam.eligibility.education : '',
        eligibility_min_age: String(exam.eligibility?.min_age ?? ''),
        eligibility_max_age: String(exam.eligibility?.max_age ?? ''),
        disclaimer: exam.disclaimer || '',
      });
    } else {
      setForm({
        id: '', group: filterGroup, name: '', short_name: '', board: '', status: 'expected',
        last_date: '', form_start: '', expected_vacancies: '', official_url: '',
        fee_general: '', fee_obc: '', fee_sc_st: '', eligibility_education: '',
        eligibility_min_age: '', eligibility_max_age: '', disclaimer: '',
      });
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.name) return;
    setSaving(true);
    try {
      const payload = {
        id: form.id,
        group: form.group,
        name: form.name,
        short_name: form.short_name,
        board: form.board,
        status: form.status,
        last_date: form.last_date || null,
        form_start: form.form_start || null,
        expected_vacancies: form.expected_vacancies,
        official_url: form.official_url,
        fee: {} as Record<string, number>,
        eligibility: {
          education: form.eligibility_education,
          min_age: parseInt(form.eligibility_min_age) || 0,
          max_age: parseInt(form.eligibility_max_age) || 0,
        },
        disclaimer: form.disclaimer,
      };
      if (form.fee_general) (payload.fee as Record<string, number>).general_OBC_creamy = parseFloat(form.fee_general);
      if (form.fee_obc) (payload.fee as Record<string, number>).SC_ST_OBC_non_creamy_EWS_PwD = parseFloat(form.fee_obc);
      if (form.fee_sc_st) (payload.fee as Record<string, number>).sc_st = parseFloat(form.fee_sc_st);

      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showMsg('success', 'Exam saved!');
        closeDrawer();
        fetchExams();
      } else {
        const err = await res.json();
        showMsg('error', 'Error: ' + (err.error || 'Unknown'));
      }
    } catch {
      showMsg('error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (examId: string) => {
    if (!confirm('Delete this exam?')) return;
    try {
      const res = await fetch('/api/admin/exams', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ examId }),
      });
      if (res.ok) {
        showMsg('success', 'Exam deleted!');
        fetchExams();
      }
    } catch {
      showMsg('error', 'Delete failed');
    }
  };

  const getGroupName = (groupId?: string) => groups.find(g => g.id === groupId)?.name || groupId || '—';

  const statusColors: Record<string, string> = {
    open: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    upcoming: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    expected: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    closed: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const filteredExams = exams.filter(e =>
    !searchTerm || e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.short_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">📋 Exams Setup</h2>
          <p className="text-gray-400 text-sm">Manage individual exams, dates, fees, and eligibility.</p>
        </div>
        <button onClick={() => openDrawer()}
          className="bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all">
          + New Exam
        </button>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl text-sm border ${
          message.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' : 'bg-red-950/40 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
          className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-[#10b981]">
          <option value="">All Groups</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search exams..."
          className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-[#10b981] flex-1 max-w-xs" />
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading exams...</div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8 text-center text-gray-500">
          No exams found. {filterGroup ? 'Try a different group filter.' : 'Add your first exam!'}
        </div>
      ) : (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#12151f] text-gray-400 text-xs border-b border-[#2a2d3a]">
                <th className="p-3 w-8">SL</th>
                <th className="p-3">Exam Name</th>
                <th className="p-3">Group</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Dates</th>
                <th className="p-3 text-center">Fee (Gen)</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3a]">
              {filteredExams.map((exam, i) => (
                <tr key={exam.id} className="hover:bg-[#1f2330]">
                  <td className="p-3 text-gray-500 text-xs font-mono">{i + 1}</td>
                  <td className="p-3">
                    <p className="font-bold text-white text-sm">{exam.name}</p>
                    {exam.short_name && <p className="text-[10px] text-gray-500">{exam.short_name}</p>}
                  </td>
                  <td className="p-3 text-xs text-gray-400">{getGroupName(exam.group)}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[exam.status] || 'text-gray-400 bg-gray-800'}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="p-3 text-[10px] text-gray-400">
                    {exam.form_start ? `Start: ${exam.form_start}` : '—'}
                    {exam.last_date ? <br /> : ''}
                    {exam.last_date ? `End: ${exam.last_date}` : ''}
                  </td>
                  <td className="p-3 text-center text-xs text-gray-300 font-mono">
                    {exam.fee?.general_OBC_creamy ? `₹${exam.fee.general_OBC_creamy}` : exam.fee?.general_ews ? `₹${exam.fee.general_ews}` : '—'}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => openDrawer(exam)}
                        className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 px-2 py-1 rounded-lg">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(exam.id)}
                        className="text-[10px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-2 py-1 rounded-lg">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Right Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={closeDrawer} />
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#1a1d27] border-l border-[#2a2d3a] shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-[#1a1d27] border-b border-[#2a2d3a] p-4 flex justify-between items-center z-10">
              <h3 className="text-sm font-bold text-white">
                {form.id && exams.find(e => e.id === form.id) ? 'Edit Exam' : 'Add New Exam'}
              </h3>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-white text-lg leading-none p-1">&times;</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Exam ID (slug) <span className="text-red-400">*</span></label>
                  <input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })}
                    placeholder="rsmssb-patwari-2026" required
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]">
                    <option value="open">Open</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="expected">Expected</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Exam Name <span className="text-red-400">*</span></label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="RSMSSB Patwari Recruitment 2026" required
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Short Name</label>
                  <input value={form.short_name} onChange={e => setForm({ ...form, short_name: e.target.value })}
                    placeholder="Patwari"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Board</label>
                  <input value={form.board} onChange={e => setForm({ ...form, board: e.target.value })}
                    placeholder="RSMSSB"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Group</label>
                  <select value={form.group} onChange={e => setForm({ ...form, group: e.target.value })}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]">
                    <option value="">Select group...</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Form Start Date</label>
                  <input value={form.form_start} onChange={e => setForm({ ...form, form_start: e.target.value })}
                    placeholder="2026-06-01" type="date"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Last Date</label>
                  <input value={form.last_date} onChange={e => setForm({ ...form, last_date: e.target.value })}
                    placeholder="2026-07-15" type="date"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Expected Vacancies</label>
                  <input value={form.expected_vacancies} onChange={e => setForm({ ...form, expected_vacancies: e.target.value })}
                    placeholder="500+"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Official URL</label>
                  <input value={form.official_url} onChange={e => setForm({ ...form, official_url: e.target.value })}
                    placeholder="https://rsmssb.rajasthan.gov.in"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>

                {/* Fee Section */}
                <div className="col-span-2 border-t border-[#2a2d3a] pt-4">
                  <h4 className="text-xs font-semibold text-gray-300 mb-3">Fee Structure (₹)</h4>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">General/OBC Creamy</label>
                  <input value={form.fee_general} onChange={e => setForm({ ...form, fee_general: e.target.value })}
                    placeholder="600" type="number"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">OBC Non-Creamy/EWS/SC/ST</label>
                  <input value={form.fee_obc} onChange={e => setForm({ ...form, fee_obc: e.target.value })}
                    placeholder="400" type="number"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>

                {/* Eligibility Section */}
                <div className="col-span-2 border-t border-[#2a2d3a] pt-4">
                  <h4 className="text-xs font-semibold text-gray-300 mb-3">Eligibility</h4>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Education Required</label>
                  <input value={form.eligibility_education} onChange={e => setForm({ ...form, eligibility_education: e.target.value })}
                    placeholder="Graduation (any stream)"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Min Age</label>
                  <input value={form.eligibility_min_age} onChange={e => setForm({ ...form, eligibility_min_age: e.target.value })}
                    placeholder="21" type="number"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Max Age</label>
                  <input value={form.eligibility_max_age} onChange={e => setForm({ ...form, eligibility_max_age: e.target.value })}
                    placeholder="40" type="number"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>

                {/* Disclaimer */}
                <div className="col-span-2 border-t border-[#2a2d3a] pt-4">
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Disclaimer</label>
                  <textarea value={form.disclaimer} onChange={e => setForm({ ...form, disclaimer: e.target.value })}
                    placeholder="Official notification ka wait karo." rows={2}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#2a2d3a]">
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : '💾 Save Exam'}
                </button>
                <button type="button" onClick={closeDrawer}
                  className="px-5 py-2 bg-[#2a2d3a] text-gray-400 rounded-xl text-sm hover:text-white transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
