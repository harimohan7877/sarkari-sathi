"use client";

import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { getAllGroups } from "@/lib/groups";
import type { Group } from "@/lib/groups";
import marketplaceData from "@/data/marketplace_data.json";

interface MarketData {
  [groupName: string]: { sl: number; id: number; name_en: string }[];
}

export default function ExamsPage() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    startTransition(() => {
      setGroups(getAllGroups().filter(g => g.is_active !== false));
    });
  }, []);

  const data = marketplaceData as MarketData;

  return (
    <main className="min-h-screen bg-[#fbfbf5]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        <div className="mb-8">
          <Link href="/" className="text-xs text-gray-500 hover:text-black transition-colors font-mono uppercase tracking-wider">← Back to Home</Link>
          <h1 className="text-2xl font-bold text-gray-900 font-mono uppercase tracking-wider mt-2">All Exam Categories</h1>
          <p className="text-xs text-gray-500 mt-1">Browse all Rajasthan government exam categories and boards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const groupName = group.name;
            const examCount = Object.keys(data).filter(k => k.includes(groupName.replace('Exams', '').trim()))
              .reduce((sum, k) => sum + data[k].length, 0);

            return (
              <Link
                key={group.id}
                href={`/category/${group.id}`}
                className="bg-white border border-gray-100 rounded-sm p-6 hover:shadow-halo transition-all group flex items-center gap-5"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 bg-white flex items-center justify-center flex-shrink-0">
                  {group.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={group.logo_url} alt={group.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-lg font-bold text-gray-400 font-mono">
                      {group.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-gray-900 font-mono uppercase tracking-wide group-hover:opacity-70 transition-opacity">
                    {group.name.replace('Rajasthan ', '').replace('Exams', '').trim() || group.name}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">{group.name_hi || ''}</p>
                  <p className="text-[11px] text-gray-500 mt-1 font-mono">{examCount} exams →</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
