"use client";

import React from "react";
import CatMascot from "@/components/CatMascot/CatMascot";
import { Cloud, Users } from "lucide-react";

interface LeaderboardHeroProps {
  totalParticipants: number;
}

export default function LeaderboardHero({ totalParticipants }: LeaderboardHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#171525] border border-[#2F2C45] px-6 py-5 sm:py-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Editorial Copy */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FFB586] mb-1.5">
            <Cloud className="w-3.5 h-3.5" />
            <span>Google Cloud Skills Boost</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Google Cloud Study Jam Leaderboard
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-[#888591] leading-relaxed">
            Live rankings, skill badges, and milestone completion for participants of GDGoC IET DAVV.
          </p>
        </div>

        {/* Right Subtle Pill & Small Mascot Accent */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#211F32] border border-[#2F2C45] text-xs font-medium text-[#DCD8EF]">
            <Users className="w-3.5 h-3.5 text-[#FFB586]" />
            <span>
              <strong className="text-white font-bold">{totalParticipants}</strong> Enrolled Contenders
            </span>
          </div>

          {/* Selective 5% fun: Small mascot sitting quietly */}
          <div className="hidden lg:block opacity-90 hover:opacity-100 transition-opacity">
            <CatMascot variant="trophy" size={44} interactive={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
