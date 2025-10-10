"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateLeaderboardStats, getTopUsers } from "@/lib/leaderboard-utils";
import type { LeaderboardEntry } from "@/lib/utils";

interface LeaderboardStatsProps {
  data: LeaderboardEntry[];
}

const LeaderboardStats: React.FC<LeaderboardStatsProps> = ({ data }) => {
  // Get only the top 50 participants for statistics
  const top50Participants = getTopUsers(data, 50);
  const stats = calculateLeaderboardStats(top50Participants);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCard 
        title="Total Users" 
        value={stats.totalUsers.toString()} 
        description="Top 50 participants" 
      />
      <StatCard 
        title="Completed" 
        value={stats.completedUsers.toString()} 
        description="Fully completed" 
      />
      <StatCard 
        title="Avg. Skill Badges" 
        value={stats.averageSkillBadges.toFixed(1)} 
        description="Per top user" 
      />
      <StatCard 
        title="Avg. Arcade Games" 
        value={stats.averageArcadeGames.toFixed(1)} 
        description="Per top user" 
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => (
  <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-3 text-center h-full">
    <div className="text-xl font-bold">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{title}</div>
    <div className="mt-1 text-xs text-muted-foreground/80">{description}</div>
  </div>
);

export default LeaderboardStats;