"use client";

import { use, useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { getAllGroups, getExamsByGroup, getGroupInitials, type Group } from "@/lib/groups";
import type { Exam } from "@/lib/eligibility";

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [group, setGroup] = useState<Group | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => { startTransition(() => {
    const g = getAllGroups().find((g) => g.id === id);
    if (g) {
      setGroup(g);
      setExams(getExamsByGroup(g.id));
    }
  }); }, [id]);

  if (!group) return null;

  const initials = getGroupInitials(group.name);

  return (
    <main className="min-h-screen bg-[#fbfbf5]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-xs text-gray-500 hover:text-black transition-colors font-mono uppercase tracking-wider">← Back to Home</Link>
        </div>

        {/* Group Header Card */}
        <div className="bg-white border border-gray-100 rounded-sm p-6 md:p-8 mb-8 flex items-center gap-5 shadow-sm">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-gray-100 bg-white flex items-center justify-center flex-shrink-0">
            {group.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={group.logo_url} alt={group.name} className="w-full h-full object-contain p-1" />
            ) : (
              <span
                className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: group.color || '#333' }}
              >
                {initials}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-mono uppercase tracking-wide">{group.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{group.name_hi}</p>
            <p className="text-xs text-gray-400 mt-1 font-mono">{exams.length} exams in this category</p>
          </div>
        </div>

        {/* Exams Grid — Book Style Cards */}
        {exams.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-sm p-12 text-center">
            <p className="text-4xl mb-3">📋</p>
            <h3 className="text-sm font-bold text-gray-900 font-mono uppercase tracking-wider mb-1">No exams found</h3>
            <p className="text-xs text-gray-500">Exams will appear here once added to this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/exam/${exam.id}`}
                className="bg-white border border-gray-100 rounded-sm overflow-hidden hover:shadow-halo transition-all group flex flex-col"
              >
                {/* Book Cover Visual */}
                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100 flex items-center justify-center p-6 relative overflow-hidden">
                  {(() => {
                    const logoUrl = exam.logo_url || group.logo_url;
                    return logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity"
                      />
                    ) : (
                      <span
                        className="absolute text-6xl font-bold opacity-5 group-hover:opacity-10 transition-opacity"
                        style={{ color: group.color || '#333' }}
                      >
                        {initials}
                      </span>
                    );
                  })()}
                  <div className="relative flex flex-col items-center gap-3">
                    {/* Group logo badge */}
                    {(() => {
                      const logoUrl = exam.logo_url || group.logo_url;
                      return logoUrl ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" />
                        </div>
                      ) : (
                        <span
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm group-hover:scale-105 transition-transform"
                          style={{ background: group.color || '#333' }}
                        >
                          {initials}
                        </span>
                      );
                    })()}
                    <div className="w-16 h-22 bg-white rounded-r-sm shadow-md border border-gray-200 flex items-center justify-center p-2">
                      <span className="text-[8px] font-bold text-gray-800 text-center font-mono uppercase leading-tight">
                        {exam.short_name || exam.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mb-1">{exam.board}</span>
                  <h3 className="text-sm font-bold text-gray-900 font-mono uppercase leading-snug mb-2 group-hover:opacity-70 transition-opacity">
                    {exam.name_hindi || exam.short_name || exam.name}
                  </h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      exam.status === 'open' ? 'bg-green-100 text-green-700' :
                      exam.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                      exam.status === 'expected' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {exam.status === 'open' ? 'Open' : exam.status === 'upcoming' ? 'Upcoming' : exam.status === 'expected' ? 'Expected' : exam.status}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
