"use client";

import { useState, useEffect, startTransition } from "react";

interface ProductData {
  id: string;
  title: string;
  exam_name: string;
  group_id: string | null;
  group: { name: string } | null;
  type: string;
  price: number;
  sale_price: number;
  pages: number | null;
  language: string;
  file_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface ProductFormData {
  id: string;
  title: string;
  exam_name: string;
  group_id: string;
  type: string;
  price: string;
  sale_price: string;
  pages: string;
  language: string;
  file_url: string;
  is_active: boolean;
}

export default function ProductsTab({ getAuthHeaders }: { getAuthHeaders: () => Record<string, string> }) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState<ProductFormData>({
    id: '', title: '', exam_name: '', group_id: '', type: 'Notes',
    price: '', sale_price: '', pages: '', language: 'Hindi', file_url: '', is_active: true,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, groupRes] = await Promise.all([
        fetch('/api/admin/products', { headers: getAuthHeaders() }),
        fetch('/api/admin/groups', { headers: getAuthHeaders() }),
      ]);
      if (prodRes.ok) setProducts(await prodRes.json());
      if (groupRes.ok) setGroups(await groupRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { startTransition(() => { fetchProducts(); }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.title) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price) || 0,
          sale_price: parseFloat(form.sale_price) || 0,
          pages: form.pages ? parseInt(form.pages) : null,
        }),
      });
      if (res.ok) {
        showMsg('success', 'Product saved!');
        setShowForm(false);
        setForm({ id: '', title: '', exam_name: '', group_id: '', type: 'Notes', price: '', sale_price: '', pages: '', language: 'Hindi', file_url: '', is_active: true });
        fetchProducts();
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

  const handleDelete = async (productId: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        showMsg('success', 'Product deleted!');
        fetchProducts();
      }
    } catch {
      showMsg('error', 'Delete failed');
    }
  };

  const handleEdit = (p: ProductData) => {
    setForm({
      id: p.id,
      title: p.title,
      exam_name: p.exam_name,
      group_id: p.group_id || '',
      type: p.type,
      price: String(p.price),
      sale_price: String(p.sale_price),
      pages: p.pages ? String(p.pages) : '',
      language: p.language,
      file_url: p.file_url || '',
      is_active: p.is_active,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">📦 Study Materials (Products)</h2>
          <p className="text-gray-400 text-sm">Manage Notes, MCQs, and Mock Test products.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setForm({ id: '', title: '', exam_name: '', group_id: '', type: 'Notes', price: '', sale_price: '', pages: '', language: 'Hindi', file_url: '', is_active: true }); }}
          className="bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all">
          + New Product
        </button>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl text-sm border ${
          message.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' : 'bg-red-950/40 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6 space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-white">Add / Edit Product</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Product ID (slug)</label>
              <input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })}
                placeholder="rsmssb-patwari-notes" required
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Group</label>
              <select value={form.group_id} onChange={e => setForm({ ...form, group_id: e.target.value })}
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]">
                <option value="">Select group...</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="RSMSSB Patwari" required
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Exam Name</label>
              <input value={form.exam_name} onChange={e => setForm({ ...form, exam_name: e.target.value })}
                placeholder="RSMSSB Patwari"
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]">
                <option value="Notes">📝 Notes</option>
                <option value="MCQ">📋 MCQ</option>
                <option value="Mock Test">🎯 Mock Test</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Language</label>
              <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]">
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Bilingual">Bilingual</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Price (₹)</label>
              <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="399" type="number" step="0.01" required
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Sale Price (₹)</label>
              <input value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })}
                placeholder="149" type="number" step="0.01" required
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Pages</label>
              <input value={form.pages} onChange={e => setForm({ ...form, pages: e.target.value })}
                placeholder="420" type="number"
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase mb-1">Active?</label>
              <select value={form.is_active ? 'true' : 'false'} onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })}
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]">
                <option value="true">Active</option>
                <option value="false">Inactive (Hidden)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-gray-400 uppercase mb-1">
                Google Drive Link <span className="text-gray-600">(file_url — paste link after upload)</span>
              </label>
              <input value={form.file_url} onChange={e => setForm({ ...form, file_url: e.target.value })}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#10b981]" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50">
              {saving ? 'Saving...' : '💾 Save Product'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-[#2a2d3a] text-gray-400 rounded-xl text-sm hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8 text-center text-gray-500">
          No products found. Create your first product!
        </div>
      ) : (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#12151f] text-gray-400 text-xs border-b border-[#2a2d3a]">
                <th className="p-4">Product / Exam</th>
                <th className="p-4">Type</th>
                <th className="p-4">Group</th>
                <th className="p-4 text-center">Price</th>
                <th className="p-4 text-center">Sale</th>
                <th className="p-4">Language</th>
                <th className="p-4">Drive Link</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3a]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#1f2330]">
                  <td className="p-4">
                    <p className="font-bold text-white">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.exam_name}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-gray-400">{p.type}</span>
                  </td>
                  <td className="p-4 text-xs text-gray-400">{p.group?.name || '—'}</td>
                  <td className="p-4 text-center text-gray-400 text-xs">₹{Number(p.price).toFixed(2)}</td>
                  <td className="p-4 text-center font-bold text-emerald-400">₹{Number(p.sale_price).toFixed(2)}</td>
                  <td className="p-4 text-xs text-gray-400">{p.language}</td>
                  <td className="p-4">
                    {p.file_url ? (
                      <a href={p.file_url} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-blue-400 hover:text-blue-300 underline truncate block max-w-[120px]">
                        📎 Drive
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-500">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      p.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={() => handleEdit(p)}
                        className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 px-2 py-1 rounded-lg">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(p.id)}
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
    </div>
  );
}
