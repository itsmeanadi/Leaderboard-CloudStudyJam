"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateLeaderboardStats } from "@/lib/leaderboard-utils";
import type { LeaderboardEntry } from "@/lib/utils";

interface LeaderboardStatsProps {
  data: LeaderboardEntry[];
}

const LeaderboardStats: React.FC<LeaderboardStatsProps> = ({ data }) => {
  const stats = calculateLeaderboardStats(data);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Leaderboard Statistics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toString()} 
          description="Registered participants" 
        />
        <StatCard 
          title="Completed" 
          value={stats.completedUsers.toString()} 
          description="Fully completed" 
        />
        <StatCard 
          title="Avg. Skill Badges" 
          value={stats.averageSkillBadges.toFixed(1)} 
          description="Per user" 
        />
        <StatCard 
          title="Avg. Arcade Games" 
          value={stats.averageArcadeGames.toFixed(1)} 
          description="Per user" 
        />
      </CardContent>
    </Card>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => (
  <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-4 text-center">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="mt-1 text-xs text-muted-foreground/80">{description}</div>
  </div>
);

export default LeaderboardStats;