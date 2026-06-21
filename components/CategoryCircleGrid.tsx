"use client";

import { getAllGroups } from "@/lib/groups";
import Link from "next/link";
import marketplaceData from "@/data/marketplace_data.json";

interface MarketData {
  [groupName: string]: { sl: number; id: number; name_en: string }[];
}

export default function CategoryCircleGrid() {
  const groups = getAllGroups().filter(g => g.is_active !== false);
  const data = marketplaceData as MarketData;

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-mono uppercase tracking-wider">Exam Categories</h2>
          <p className="text-xs text-gray-500 mt-1">Browse exams by board / department</p>
        </div>
        <Link href="/exams" className="text-[11px] font-semibold text-gray-900 border-b border-gray-900 pb-0.5 hover:opacity-70 transition-opacity">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-6 md:gap-8">
        {groups.map((group) => {
          const groupName = group.name;
          const examCount = Object.values(data).flat().filter(
            (e: { sl: number; id: number; name_en: string }) => group.exam_ids?.includes(e.name_en.toLowerCase().replace(/\s+/g, '-'))
          ).length || Object.keys(data).filter(k => k.includes(groupName.replace('Exams', '').trim())).reduce((sum, k) => sum + data[k].length, 0);

          return (
            <Link
              key={group.id}
              href={`/category/${group.id}`}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-gray-300 transition-all shadow-sm group-hover:shadow-md bg-white flex items-center justify-center">
                {group.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={group.logo_url}
                    alt={group.name}
                    className="w-full h-full object-contain p-1.5"
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-400 font-mono">
                    {group.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold text-gray-800 font-mono uppercase tracking-wide leading-tight group-hover:text-black transition-colors">
                  {group.name.replace('Rajasthan ', '').replace(' Exams', '')}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{examCount || '—'} exams</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
