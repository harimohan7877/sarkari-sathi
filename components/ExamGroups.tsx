"use client";

import Link from "next/link";

export default function ExamGroups() {
  const groups = [
    { id: 1, name: "SSC Exams", icon: "🏛️", color: "bg-[hsl(24,100%,95%)]", text: "text-[hsl(24,100%,50%)]" },
    { id: 2, name: "Banking", icon: "🏦", color: "bg-[hsl(217,91%,95%)]", text: "text-[hsl(217,91%,60%)]" },
    { id: 3, name: "Railways", icon: "🚂", color: "bg-[hsl(142,70%,95%)]", text: "text-[hsl(142,70%,35%)]" },
    { id: 4, name: "Defence", icon: "🛡️", color: "bg-[hsl(348,83%,95%)]", text: "text-[hsl(348,83%,47%)]" },
    { id: 5, name: "Teaching", icon: "📚", color: "bg-[hsl(280,70%,95%)]", text: "text-[hsl(280,70%,50%)]" },
    { id: 6, name: "Police", icon: "👮", color: "bg-[hsl(210,40%,95%)]", text: "text-[hsl(222,47%,30%)]" },
    { id: 7, name: "State PSC", icon: "⚖️", color: "bg-[hsl(40,100%,95%)]", text: "text-[hsl(40,100%,40%)]" },
    { id: 8, name: "Medical", icon: "⚕️", color: "bg-[hsl(160,60%,95%)]", text: "text-[hsl(160,60%,40%)]" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-10 py-10 mt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-extrabold text-[hsl(222,47%,12%)] font-outfit">Top Exam Categories</h3>
          <p className="text-sm text-[hsl(215,16%,55%)] font-noto mt-1">Browse study material by your goal</p>
        </div>
        <button className="text-[hsl(348,83%,47%)] font-semibold text-sm hover:underline font-noto">
          View All Categories →
        </button>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {groups.map((group) => (
          <Link key={group.id} href={`/category/${group.name.toLowerCase().replace(" ", "-")}`}>
            <div className="flex flex-col items-center group cursor-pointer">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${group.color} flex items-center justify-center text-3xl md:text-4xl shadow-sm border border-transparent group-hover:border-[hsl(214,32%,91%)] group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300`}>
                <span className={`drop-shadow-sm ${group.text}`}>{group.icon}</span>
              </div>
              <p className="mt-3 text-xs md:text-sm font-semibold text-[hsl(222,47%,12%)] text-center group-hover:text-[hsl(348,83%,47%)] transition-colors font-noto">
                {group.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
