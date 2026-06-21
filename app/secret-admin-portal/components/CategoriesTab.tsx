"use client";

import { useState, useEffect, startTransition } from "react";

interface Exam {
  id: number;
  sl: number;
  name_en: string;
  name_hi?: string;
  meta_title?: string;
  meta_description?: string;
}

interface Group {
  id: string;
  name: string;
  logo_url: string | null;
  name_hi?: string;
  meta_title?: string;
  meta_description?: string;
  exams?: Exam[];
}

interface GroupFormData {
  id: string;
  name: string;
  name_hi: string;
  meta_title: string;
  meta_description: string;
  logo_url: string;
}

export default function CategoriesTab({ getAuthHeaders }: { getAuthHeaders: () => Record<string, string> }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [groupForm, setGroupForm] = useState<GroupFormData>({
    id: '', name: '', name_hi: '', meta_title: '', meta_description: '', logo_url: '',
  });

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/groups', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { startTransition(() => { fetchGroups(); }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.id || !groupForm.name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(groupForm),
      });
      if (res.ok) {
        showMsg('success', 'Group saved successfully!');
        setShowGroupForm(false);
        setGroupForm({ id: '', name: '', name_hi: '', meta_title: '', meta_description: '', logo_url: '' });
        fetchGroups();
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

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Delete this group and all its exams?')) return;
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ groupId }),
      });
      if (res.ok) {
        showMsg('success', 'Group deleted!');
        fetchGroups();
      }
    } catch {
      showMsg('error', 'Delete failed');
    }
  };

  const handleEditGroup = (group: Group) => {
    setGroupForm({
      id: group.id,
      name: group.name,
      name_hi: group.name_hi || '',
      meta_title: group.meta_title || '',
      meta_description: group.meta_description || '',
      logo_url: group.logo_url || '',
    });
    setShowGroupForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">📂 Exam Categories (Groups)</h2>
          <p className="text-gray-400 text-sm">Manage exam groups, their exams, and SEO metadata.</p>
        </div>
        <button
          onClick={() => { setShowGroupForm(!showGroupForm); setGroupForm({ id: '', name: '', name_hi: '', meta_title: '', meta_description: '', logo_url: '' }); }}
          className="bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
        >
          + New Group
        </button>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl text-sm border ${
          message.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' : 'bg-red-950/40 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {showGroupForm && (
        <form onSubmit={handleSaveGroup} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6 space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-white">Add / Edit Group</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Group ID (slug)</label>
              <input value={groupForm.id} onChange={e => setGroupForm({ ...groupForm, id: e.target.value })}
                placeholder="rajasthan-rsmssb-exams" required
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Group Name (English)</label>
              <input value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                placeholder="Rajasthan RSMSSB Exams" required
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Hindi Name</label>
              <input value={groupForm.name_hi} onChange={e => setGroupForm({ ...groupForm, name_hi: e.target.value })}
                placeholder="राजस्थान RSMSSB परीक्षाएं"
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Logo URL</label>
              <input value={groupForm.logo_url} onChange={e => setGroupForm({ ...groupForm, logo_url: e.target.value })}
                placeholder="/logos/group-name.jpg"
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Meta Title (SEO)</label>
              <input value={groupForm.meta_title} onChange={e => setGroupForm({ ...groupForm, meta_title: e.target.value })}
                placeholder="RSMSSB Exams 2026 | Rajasthan RSMSSB Bharti"
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Meta Description</label>
              <textarea value={groupForm.meta_description} onChange={e => setGroupForm({ ...groupForm, meta_description: e.target.value })}
                placeholder="RSMSSB VDO, Patwari, LDC, JE... ki taiyari karein." rows={2}
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50">
              {saving ? 'Saving...' : '💾 Save Group'}
            </button>
            <button type="button" onClick={() => setShowGroupForm(false)}
              className="px-5 py-2 bg-[#2a2d3a] text-gray-400 rounded-xl text-sm hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8 text-center text-gray-500">
          No groups found. Create your first group!
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const isExpanded = !!expandedGroups[group.id];
            const examList: Exam[] = ((group as Group).exams) || [];
            return (
              <div key={group.id} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 hover:bg-[#1f2330] transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => setExpandedGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                      className="text-gray-400 hover:text-white transition-colors">
                      <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div>
                      <p className="font-bold text-white">{group.name}</p>
                      <p className="text-xs text-gray-500">{group.name_hi || ''} • {examList.length} exams</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditGroup(group)}
                      className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg transition-all">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDeleteGroup(group.id)}
                      className="text-[10px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg transition-all">
                      🗑️
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#2a2d3a] bg-[#151821]">
                    {examList.length === 0 ? (
                      <p className="text-xs text-gray-500 p-4">No exams in this group.</p>
                    ) : (
                      <div className="divide-y divide-[#2a2d3a]/50">
                        {examList.map((exam: Exam, i: number) => (
                          <div key={exam.id || i} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#1f2330]">
                            <div>
                              <p className="text-sm text-gray-200">{exam.name_en}</p>
                              <p className="text-xs text-gray-500">{exam.name_hi || ''}</p>
                            </div>
                            <span className="text-[10px] text-gray-500">ID: {exam.id}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
