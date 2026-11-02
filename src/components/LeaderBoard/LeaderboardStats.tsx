"use client";

import React from "react";
import { calculateLeaderboardStats } from "@/lib/leaderboard-utils";
import type { LeaderboardEntry } from "@/lib/utils";

interface LeaderboardStatsProps {
  data: LeaderboardEntry[];
}

export default function LeaderboardStats({ data }: LeaderboardStatsProps) {
  // Compute stats across the entire dataset
  const stats = calculateLeaderboardStats(data);

  const avgBadgesFormatted =
    typeof stats.averageSkillBadges === "number" && !isNaN(stats.averageSkillBadges)
      ? stats.averageSkillBadges.toFixed(1)
      : "-";

  const avgGamesFormatted =
    typeof stats.averageArcadeGames === "number" && !isNaN(stats.averageArcadeGames)
      ? stats.averageArcadeGames.toFixed(1)
      : (stats.averageArcadeGames || "-");

  const statCards = [
    {
      label: "Total Participants",
      value: stats.totalUsers,
      subtext: "Enrolled contenders",
    },
    {
      label: "Completed All Targets",
      value: stats.completedUsers,
      subtext: stats.completedUsers === "-" ? "Still searching for the leaders..." : "Full program completion",
    },
    {
      label: "Avg Skill Badges",
      value: avgBadgesFormatted,
      subtext: "Per participant",
    },
    {
      label: "Avg Arcade Games",
      value: avgGamesFormatted,
      subtext: avgGamesFormatted === "-" ? "Still searching for the leaders..." : "Per participant",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-5">
      {statCards.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-[#E8E5DD] p-4 flex flex-col justify-between shadow-2xs hover:border-[#DCD8EF] transition-colors"
        >
          <div className="text-[11px] font-bold uppercase text-[#888591] tracking-wider">
            {card.label}
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-[#171525] my-1.5 tracking-tight">
            {card.value}
          </div>

          <div className="text-xs text-[#888591] font-medium">
            {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
}
