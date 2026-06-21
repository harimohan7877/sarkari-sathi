"use client";

import { useState, useEffect, startTransition } from "react";

function generateGroupLogo(name: string): string {
  const cleanName = name.replace(/Exams?|Test|Exam/gi, '').trim();
  const initials = cleanName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'G';
  const hue = Math.floor(Math.random() * 360);
  const color1 = `hsl(${hue}, 60%, 45%)`;
  const color2 = `hsl(${hue}, 60%, 35%)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${color1}"/><stop offset="100%" stop-color="${color2}"/></linearGradient></defs><rect width="100" height="100" rx="20" fill="url(#g)"/><text x="50" y="62" text-anchor="middle" fill="white" font-size="${initials.length > 1 ? 28 : 36}" font-weight="bold" font-family="Arial">${initials}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

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
  priority?: number;
  is_active?: boolean;
  exams?: Exam[];
}

interface GroupFormData {
  id: string;
  name: string;
  name_hi: string;
  meta_title: string;
  meta_description: string;
  logo_url: string;
  priority: number;
  is_active: boolean;
}

export default function CategoriesTab({ getAuthHeaders }: { getAuthHeaders: () => Record<string, string> }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [groupForm, setGroupForm] = useState<GroupFormData>({
    id: '', name: '', name_hi: '', meta_title: '', meta_description: '', logo_url: '', priority: 0, is_active: true,
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

  const openDrawer = (group?: Group) => {
    if (group) {
      setGroupForm({
        id: group.id,
        name: group.name,
        name_hi: group.name_hi || '',
        meta_title: group.meta_title || '',
        meta_description: group.meta_description || '',
        logo_url: group.logo_url || '',
        priority: group.priority ?? 0,
        is_active: group.is_active !== undefined ? group.is_active : true,
      });
    } else {
      setGroupForm({ id: '', name: '', name_hi: '', meta_title: '', meta_description: '', logo_url: '', priority: 0, is_active: true });
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.id || !groupForm.name) return;
    setSaving(true);
    const payload = { ...groupForm };
    if (!payload.logo_url) {
      payload.logo_url = generateGroupLogo(payload.name);
    }
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showMsg('success', 'Group saved successfully!');
        closeDrawer();
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

  const handleToggleActive = async (group: Group) => {
    const newActive = !group.is_active;
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...group, is_active: newActive }),
      });
      if (res.ok) {
        fetchGroups();
      }
    } catch {
      showMsg('error', 'Toggle failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">📂 Exam Categories (Groups)</h2>
          <p className="text-gray-400 text-sm">Manage exam groups, their exams, and SEO metadata.</p>
        </div>
        <button
          onClick={() => openDrawer()}
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

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8 text-center text-gray-500">
          No groups found. Create your first group!
        </div>
      ) : (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#12151f] text-gray-400 text-xs border-b border-[#2a2d3a]">
                <th className="p-4 w-10">SL</th>
                <th className="p-4">Category Name</th>
                <th className="p-4 text-center">Priority</th>
                <th className="p-4 text-center">Home Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3a]">
              {groups.map((group, i) => (
                <tr key={group.id} className="hover:bg-[#1f2330]">
                  <td className="p-4 text-gray-500 text-xs font-mono">{i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {(group.logo_url || group.name) && (
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#0f1117]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={group.logo_url || generateGroupLogo(group.name)}
                            alt={group.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white">{group.name}</p>
                        <p className="text-xs text-gray-500">{group.name_hi || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs text-gray-400 font-mono">{group.priority ?? 0}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleActive(group)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                        group.is_active !== false
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gray-800 text-gray-500 border border-gray-700'
                      }`}
                    >
                      {group.is_active !== false ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={() => openDrawer(group)}
                        className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg transition-all">
                        ✏️
                      </button>
                      <button onClick={() => handleDeleteGroup(group.id)}
                        className="text-[10px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg transition-all">
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

      {/* Right-side Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={closeDrawer} />
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#1a1d27] border-l border-[#2a2d3a] shadow-2xl z-50 overflow-y-auto transition-transform">
            <div className="sticky top-0 bg-[#1a1d27] border-b border-[#2a2d3a] p-4 flex justify-between items-center z-10">
              <h3 className="text-sm font-bold text-white">
                {groupForm.id && groups.find(g => g.id === groupForm.id) ? 'Edit Group' : 'Add New Group'}
              </h3>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-white text-lg leading-none p-1">&times;</button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-6 space-y-5">
              {/* Logo preview */}
              {groupForm.logo_url && (
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#2a2d3a]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={groupForm.logo_url} alt="logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Group ID */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Group ID (slug)</label>
                  <input value={groupForm.id} onChange={e => setGroupForm({ ...groupForm, id: e.target.value })}
                    placeholder="rajasthan-rsmssb-exams" required
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                {/* Priority */}
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Priority</label>
                  <select value={groupForm.priority} onChange={e => setGroupForm({ ...groupForm, priority: parseInt(e.target.value) })}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]">
                    {Array.from({ length: 11 }, (_, i) => (
                      <option key={i} value={i}>{i} — {i === 0 ? 'Lowest' : i === 10 ? 'Highest' : ''}</option>
                    ))}
                  </select>
                </div>
                {/* Name EN */}
                <div className="col-span-2">
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Name (English) <span className="text-red-400">*</span></label>
                  <input value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                    placeholder="Rajasthan RSMSSB Exams" required
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                {/* Name HI */}
                <div className="col-span-2">
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Name (Hindi)</label>
                  <input value={groupForm.name_hi} onChange={e => setGroupForm({ ...groupForm, name_hi: e.target.value })}
                    placeholder="राजस्थान RSMSSB परीक्षाएं"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                {/* Logo Upload / URL */}
                <div className="col-span-2">
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Logo Image</label>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#2a2d3a] bg-[#0f1117] flex items-center justify-center flex-shrink-0">
                      {groupForm.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={groupForm.logo_url} alt="logo preview" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs text-gray-600">No img</span>
                      )}
                    </div>
                    <label className="cursor-pointer bg-[#2a2d3a] hover:bg-[#3a3d4d] text-gray-300 text-xs px-3 py-2 rounded-xl transition-colors">
                      Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const dataUrl = ev.target?.result as string;
                          setGroupForm({ ...groupForm, logo_url: dataUrl });
                        };
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  </div>
                  <input value={groupForm.logo_url} onChange={e => setGroupForm({ ...groupForm, logo_url: e.target.value })}
                    placeholder="Ya URL daalein: /logos/group-name.jpg"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                {/* Meta Title */}
                <div className="col-span-2">
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Meta Title (SEO)</label>
                  <input value={groupForm.meta_title} onChange={e => setGroupForm({ ...groupForm, meta_title: e.target.value })}
                    placeholder="RSMSSB Exams 2026 | Rajasthan RSMSSB Bharti"
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                {/* Meta Description */}
                <div className="col-span-2">
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Meta Description</label>
                  <textarea value={groupForm.meta_description} onChange={e => setGroupForm({ ...groupForm, meta_description: e.target.value })}
                    placeholder="RSMSSB VDO, Patwari, LDC, JE... ki taiyari karein." rows={2}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
                </div>
                {/* Active Status */}
                <div className="col-span-2 flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={groupForm.is_active}
                      onChange={e => setGroupForm({ ...groupForm, is_active: e.target.checked })}
                      className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#2a2d3a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10b981]" />
                  </label>
                  <span className="text-sm text-gray-300">
                    {groupForm.is_active ? 'Active (visible on site)' : 'Inactive (hidden)'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#2a2d3a]">
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : '💾 Save Group'}
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
