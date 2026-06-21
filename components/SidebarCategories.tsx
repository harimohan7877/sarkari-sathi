"use client";

import Link from "next/link";
import { useState } from "react";
import marketplaceData from "@/data/marketplace_data.json";

// Typed data structure based on marketplace_data.json
interface Exam {
  sl: number;
  id: number;
  name_en: string;
}

interface GroupedData {
  [groupName: string]: Exam[];
}

export default function SidebarCategories() {
  const data = marketplaceData as GroupedData;
  const groups = Object.keys(data);

  // Keep track of which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Rajasthan RSMSSB Exams": true, // Default expand the first one
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <aside className="w-full lg:w-[300px] shrink-0 bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden h-fit">
      {/* Sidebar Title */}
      <div className="bg-[#e00000] text-white px-5 py-3.5 flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
        <span>Rajasthan Exams Categories</span>
      </div>

      {/* Categories List */}
      <div className="divide-y divide-gray-100">
        {groups.map((group) => {
          const isExpanded = !!expandedGroups[group];
          const exams = data[group];

          return (
            <div key={group} className="flex flex-col">
              {/* Group Header Button */}
              <button
                onClick={() => toggleGroup(group)}
                className="w-full px-5 py-4 flex items-center justify-between text-left font-medium text-[13px] md:text-sm text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📁</span>
                  <span className="font-semibold tracking-tight">{group.replace("Exams", "")}</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isExpanded ? "transform rotate-180 text-[#e00000]" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Collapsible Exams List */}
              {isExpanded && (
                <div className="bg-gray-50/50 pb-2 border-t border-gray-50 pl-9 pr-4 divide-y divide-gray-50 max-h-[250px] overflow-y-auto scrollbar-thin">
                  {exams.map((exam) => (
                    <Link
                      key={exam.id}
                      href={`/exam/${exam.id}`}
                      className="block py-2.5 text-[12px] text-gray-600 hover:text-[#e00000] font-medium hover:pl-1 transition-all duration-150 border-b border-gray-100/50"
                    >
                      📝 {exam.name_en}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
