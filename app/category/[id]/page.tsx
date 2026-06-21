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
    <main className="min-h-screen bg-[hsl(210,40%,98%)] pb-8 font-noto">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(24,100%,50%)] via-white to-[hsl(142,70%,29%)] z-[60]" />

      <header className="bg-[hsl(222,47%,12%)] h-16 px-4 lg:px-10 flex items-center fixed top-1 left-0 right-0 z-50 shadow-lg">
        <div className="flex items-center gap-3 flex-1 max-w-7xl mx-auto w-full">
          <Link href="/" className="text-white/90 hover:text-white font-semibold text-sm font-noto flex items-center gap-1">← वापस</Link>
          <h1 className="flex-1 text-center text-white text-lg font-bold font-noto">{group.name_hi}</h1>
        </div>
      </header>

      <div className="pt-24 px-4 lg:px-10 max-w-7xl mx-auto">
        {/* Group Header */}
        <div
          className="rounded-3xl p-6 lg:p-8 mb-6 text-white shadow-elevated relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${group.color}, #1a1a2e)` }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-5">
            <div
              className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-xl lg:text-2xl font-bold shadow-lg flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              {group.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={group.logo_url} alt={group.name} className="w-full h-full object-contain rounded-2xl" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold">{group.name}</h2>
              <p className="text-white/80 text-sm mt-1">{group.name_hi}</p>
              <p className="text-white/60 text-xs mt-1">{exams.length} परीक्षाएं</p>
            </div>
          </div>
        </div>

        {/* Exams List */}
        <div className="space-y-3">
          {exams.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-premium border border-[hsl(214,32%,91%)]">
              <p className="text-4xl mb-3">📋</p>
              <h3 className="text-lg font-bold text-[hsl(222,47%,12%)] font-noto">कोई परीक्षा नहीं मिली</h3>
              <p className="text-sm text-[hsl(215,16%,55%)] mt-1 font-noto">इस श्रेणी में अभी कोई परीक्षा उपलब्ध नहीं है।</p>
            </div>
          ) : (
            exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/exam/${exam.id}`}
                className="block bg-white rounded-2xl p-5 shadow-premium border border-[hsl(214,32%,91%)] hover:shadow-elevated transition-all"
                style={{ borderLeftWidth: '4px', borderLeftColor: group.color }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: `${group.color}15`, color: group.color }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-[hsl(222,47%,12%)] font-noto truncate">
                      {exam.name_hindi || exam.short_name || exam.name}
                    </h3>
                    <p className="text-xs text-[hsl(215,16%,55%)] mt-0.5 font-noto">{exam.board}</p>
                  </div>
                  <span className="text-[hsl(215,16%,55%)] text-lg">→</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
