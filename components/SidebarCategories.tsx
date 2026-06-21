"use client";

import { useState } from "react";
import marketplaceData from "@/data/marketplace_data.json";
import Link from "next/link";
import { getGroupIdByMarketplaceName, findExamByMarketplaceName, getGroupInitials, getGroupById } from "@/lib/groups";

interface MarketExam {
  sl: number;
  id: number;
  name_en: string;
}

interface GroupedData {
  [groupName: string]: MarketExam[];
}

export default function SidebarCategories() {
  const data = marketplaceData as GroupedData;
  const groups = Object.keys(data);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Rajasthan RSMSSB Exams": true,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <aside className="w-full lg:w-[280px] shrink-0 bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden h-fit">
      <div className="bg-black text-white px-5 py-4 flex items-center gap-2.5 font-semibold text-xs uppercase tracking-[0.1em] font-mono">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <span>Exams Categories</span>
      </div>

      <div className="divide-y divide-gray-100">
        {groups.map((group) => {
          const isExpanded = !!expandedGroups[group];
          const marketExams = data[group];
          const groupId = getGroupIdByMarketplaceName(group);
          const groupData = groupId ? getGroupById(groupId) : null;
          const cleanGroupName = group.replace("Rajasthan", "").replace("Exams", "").trim();

          return (
            <div key={group} className="flex flex-col">
              <div className="flex items-center">
                {groupId ? (
                  <Link
                    href={`/category/${groupId}`}
                    className="flex-1 px-5 py-3.5 text-left text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors uppercase tracking-wider font-mono"
                    style={{ textDecoration: 'none' }}
                  >
                    <span className="flex items-center gap-2">
                      {groupData && (
                        <span
                          className="w-5 h-5 rounded-lg flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                          style={{ background: groupData.color }}
                        >
                          {getGroupInitials(groupData.name)}
                        </span>
                      )}
                      {cleanGroupName}
                    </span>
                  </Link>
                ) : (
                  <button
                    onClick={() => toggleGroup(group)}
                    className="flex-1 px-5 py-3.5 text-left text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors uppercase tracking-wider font-mono"
                  >
                    <span className={isExpanded ? "text-black" : "text-gray-600"}>{cleanGroupName}</span>
                  </button>
                )}
                <button
                  onClick={() => toggleGroup(group)}
                  className="px-3 py-3.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isExpanded ? "transform rotate-180 text-black" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {isExpanded && (
                <div className="bg-gray-50/50 pb-2 border-t border-gray-50 pl-5 pr-3 divide-y divide-gray-50/50 max-h-[220px] overflow-y-auto scrollbar-thin">
                  {marketExams.map((exam) => {
                    const matchedId = findExamByMarketplaceName(exam.name_en);
                    const href = matchedId ? `/exam/${matchedId}` : (groupId ? `/category/${groupId}` : '#');
                    return (
                      <Link
                        key={exam.id}
                        href={href}
                        className="block py-2 text-[11px] text-gray-500 hover:text-black font-medium transition-colors border-b border-gray-100/30"
                        style={matchedId ? {} : { opacity: 0.6, cursor: matchedId ? 'pointer' : 'default' }}
                      >
                        • {exam.name_en}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
