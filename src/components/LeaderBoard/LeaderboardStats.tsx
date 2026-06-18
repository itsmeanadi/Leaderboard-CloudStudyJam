"use client";

import React from "react";
import { calculateLeaderboardStats, getTopUsers } from "@/lib/leaderboard-utils"; 
import type { LeaderboardEntry } from "@/lib/utils";

export default function LeaderboardStats({ data }: { data: LeaderboardEntry[] }) {
    const stats = calculateLeaderboardStats(getTopUsers(data, 50));

    return (
        <div className="grid grid-cols-2 gap-4">
            {[
                { t: "Participants", v: stats.totalUsers, d: "Top 50" },
                { t: "Completed", v: stats.completedUsers, d: "All targets" },
                { t: "Avg Badges", v: stats.averageSkillBadges.toFixed(1), d: "Per user" },
                { t: "Avg Games", v: stats.averageArcadeGames.toFixed(1), d: "Per user" },
            ].map((s, i) => (
                <div key={i} className="p-3 border border-[#E0E0E0] dark:border-[#333333] font-mono">
                    <div className="text-xl font-bold text-foreground">{s.v}</div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">{s.t}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{s.d}</div>
                </div>
            ))}
        </div>
    );
}