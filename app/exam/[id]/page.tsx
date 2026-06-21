"use client";

import { use, useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getExamById, type Exam } from "@/lib/eligibility";
import { getGroupByExamId, getGroupInitials } from "@/lib/groups";
import productsMock from "@/data/products_mock.json";
import type { Product } from "@/components/ProductCard";

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => { startTransition(() => {
    const e = getExamById(id);
    setExam(e || null);

    if (e) {
      const related = (productsMock as Product[]).filter(p =>
        p.examName.toLowerCase().includes(e.short_name?.toLowerCase() ?? '') ||
        e.name.toLowerCase().includes(p.examName.toLowerCase().split(' ').slice(0, 2).join(' ')) ||
        p.examName.toLowerCase().includes(e.name.toLowerCase().replace(/recruitment\s*\d{4}/, '').trim())
      );
      setProducts(related);
    }

    const stored = localStorage.getItem("sarkari_saathi_cart");
    if (stored) {
      try { setCart(JSON.parse(stored)); } catch {}
    }
  }); }, [id]);

  if (!exam) {
    return (
      <main className="min-h-screen bg-[#fbfbf5] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-5xl mb-4">📋</p>
          <h2 className="text-lg font-bold text-gray-900 font-mono uppercase tracking-wide mb-2">Exam not found</h2>
          <Link href="/" className="text-xs text-gray-500 hover:text-black font-mono uppercase tracking-wider transition-colors">← Back to Home</Link>
        </div>
      </main>
    );
  }

  const group = getGroupByExamId(exam.id);
  const initials = group ? getGroupInitials(group.name) : 'EX';
  const logoUrl = exam.logo_url || group?.logo_url || null;
  const today = new Date();
  const lastDate = exam.last_date ? new Date(exam.last_date) : null;
  const daysLeft = lastDate ? Math.ceil((lastDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  const addToCart = (product: Product) => {
    if (cart.some(item => item.id === product.id)) return;
    const updated = [...cart, product];
    setCart(updated);
    localStorage.setItem("sarkari_saathi_cart", JSON.stringify(updated));
    router.push("/");
  };

  const getFeeDisplay = () => {
    const f = exam.fee;
    if (!f || Object.keys(f).length === 0) return null;
    const gen = f.general_OBC_creamy || f.general_ews || f.general;
    const obc = f.obc_sbc || f.SC_ST_OBC_non_creamy_EWS_PwD;
    const scst = f.sc_st;
    return { gen, obc, scst };
  };

  const fee = getFeeDisplay();

  return (
    <main className="min-h-screen bg-[#fbfbf5]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">
        {/* Back link */}
        <div className="mb-6">
          <Link href={group ? `/category/${group.id}` : '/'} className="text-xs text-gray-500 hover:text-black transition-colors font-mono uppercase tracking-wider">← Back</Link>
        </div>

        {/* Exam Header */}
        <div className="bg-white border border-gray-100 rounded-sm p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-5">
            {/* Logo */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-gray-100 bg-white flex items-center justify-center flex-shrink-0">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-gray-800">{initials}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-mono uppercase tracking-wide">{exam.name}</h1>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                  exam.status === 'open' ? 'bg-green-100 text-green-700' :
                  exam.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                  exam.status === 'expected' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {exam.status === 'open' ? 'Open' : exam.status === 'upcoming' ? 'Upcoming' : exam.status === 'expected' ? 'Expected' : exam.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{exam.name_hindi}</p>
              <p className="text-[11px] text-gray-400 font-mono">{exam.board}</p>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            {lastDate && (
              <div>
                <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider mb-0.5">Last Date</p>
                <p className="text-sm font-bold text-gray-900">{exam.last_date}</p>
                {daysLeft !== null && (
                  <p className={`text-[10px] font-semibold ${daysLeft < 0 ? 'text-red-500' : daysLeft < 15 ? 'text-amber-600' : 'text-green-600'}`}>
                    {daysLeft < 0 ? 'Closed' : `${daysLeft} days left`}
                  </p>
                )}
              </div>
            )}
            {exam.form_start && (
              <div>
                <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider mb-0.5">Form Start</p>
                <p className="text-sm font-bold text-gray-900">{exam.form_start}</p>
              </div>
            )}
            {exam.expected_vacancies && (
              <div>
                <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider mb-0.5">Vacancies</p>
                <p className="text-sm font-bold text-gray-900">{exam.expected_vacancies}</p>
              </div>
            )}
            {exam.total_posts && (
              <div>
                <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider mb-0.5">Total Posts</p>
                <p className="text-sm font-bold text-gray-900">{exam.total_posts}</p>
              </div>
            )}
          </div>

          {/* Fee */}
          {fee && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider mb-2">Application Fee</p>
              <div className="flex flex-wrap gap-4">
                {fee.gen && <div className="bg-gray-50 px-3 py-1.5 rounded-sm"><span className="text-[10px] text-gray-500">General/OBC Creamy: </span><span className="text-sm font-bold text-gray-900">₹{fee.gen}</span></div>}
                {fee.obc && <div className="bg-gray-50 px-3 py-1.5 rounded-sm"><span className="text-[10px] text-gray-500">OBC Non-Creamy/EWS/SC/ST: </span><span className="text-sm font-bold text-gray-900">₹{fee.obc}</span></div>}
                {fee.scst && <div className="bg-gray-50 px-3 py-1.5 rounded-sm"><span className="text-[10px] text-gray-500">SC/ST: </span><span className="text-sm font-bold text-gray-900">₹{fee.scst}</span></div>}
              </div>
            </div>
          )}

          {/* Eligibility */}
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider mb-0.5">Education</p>
              <p className="text-xs font-medium text-gray-800">{exam.eligibility?.education || '—'}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider mb-0.5">Age Limit</p>
              <p className="text-xs font-medium text-gray-800">{exam.eligibility?.min_age || '?'} – {exam.eligibility?.max_age || '?'} years</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider mb-0.5">Official Link</p>
              <a href={exam.official_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:underline">{exam.official_url}</a>
            </div>
          </div>
        </div>

        {/* Study Materials Heading */}
        {products.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 font-mono uppercase tracking-wider">Study Materials for {exam.short_name || exam.name}</h2>
            <p className="text-xs text-gray-500 mt-1">Prepare with our premium notes, MCQs, and mock tests</p>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.length === 0 ? (
            <div className="col-span-full bg-white border border-gray-100 rounded-sm p-10 text-center">
              <p className="text-4xl mb-3">📚</p>
              <h3 className="text-sm font-bold text-gray-900 font-mono uppercase tracking-wider mb-1">No study materials yet</h3>
              <p className="text-xs text-gray-500">Materials will appear here once added for this exam.</p>
              <div className="mt-6">
                <a href={exam.official_url} target="_blank" rel="noopener noreferrer" className="button-outline-on-light text-xs px-5 py-2">View Official Notification →</a>
              </div>
            </div>
          ) : products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-100 rounded-sm overflow-hidden shadow-sm hover:shadow-halo transition-all flex flex-col group">
              {/* Cover */}
              <div className="h-44 bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center p-5 relative">
                <span className="absolute top-3 left-3 bg-white/10 text-white/60 text-[8px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">{product.type}</span>
                <div className="text-center">
                  <span className="text-white/10 text-5xl font-bold block leading-none">{product.type === 'Notes' ? '📝' : product.type === 'MCQ' ? '📋' : '🎯'}</span>
                  <p className="text-white text-xs font-bold font-mono uppercase tracking-wide mt-2">{product.language}</p>
                  {product.pages && <p className="text-white/50 text-[9px] font-mono mt-0.5">{product.pages} Pages</p>}
                </div>
              </div>
              {/* Details */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-bold text-gray-900 font-mono uppercase tracking-wide mb-2">{product.title}</h3>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-3">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">{product.language}</span>
                  {product.pages && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{product.pages} Pages</span>}
                </div>
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-[11px] text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                    <span className="text-sm font-extrabold text-black ml-1.5">₹{product.salePrice.toFixed(2)}</span>
                  </div>
                  <button onClick={() => addToCart(product)} className="button-primary-pill text-[11px] px-4 py-1.5 uppercase tracking-wider font-semibold active:scale-95 transition-transform">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notification link */}
        <div className="mt-8 text-center">
          <a href={`https://wa.me/919950252138?text=Need%20help%20with%20${encodeURIComponent(exam.name)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            💬 Need help? Contact on WhatsApp
          </a>
        </div>
      </div>

      {/* WhatsApp Float */}
      <a href="https://wa.me/919950252138" target="_blank" rel="noopener noreferrer" className="whatsapp-float shadow-lg hover:scale-105 transition-transform" title="Contact Support">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.116-2.887-6.98C16.584 1.895 14.1 1.867 12.01 1.867c-5.437 0-9.86 4.42-9.863 9.864 0 1.741.484 3.44 1.402 4.903L2.556 21.46l4.091-1.306zM17.65 14.28c-.309-.155-1.83-.903-2.115-1.006-.285-.103-.493-.155-.7.156-.207.31-.8.981-.98 1.187-.18.207-.361.233-.67.078-.309-.155-1.305-.48-2.486-1.534-.919-.819-1.54-1.83-1.72-2.139-.18-.309-.02-.477.135-.63.14-.139.31-.361.464-.542.155-.18.206-.31.309-.516.103-.207.052-.387-.026-.542-.078-.155-.7-1.688-.96-2.307-.253-.608-.51-.527-.7-.527-.18 0-.387-.008-.594-.008s-.542.078-.826.387c-.284.31-1.084 1.058-1.084 2.58 0 1.523 1.109 2.99 1.264 3.196.155.206 2.182 3.332 5.286 4.67 1.218.525 2.13.84 2.861 1.07.734.23 1.401.182 1.93.102.589-.088 1.83-.748 2.088-1.47.258-.723.258-1.343.18-1.471-.077-.129-.284-.207-.593-.362z"/>
        </svg>
      </a>
    </main>
  );
}
