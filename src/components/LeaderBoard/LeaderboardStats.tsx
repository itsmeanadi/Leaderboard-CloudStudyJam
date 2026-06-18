"use client";

import React from "react";
import { Users, CheckCircle, Gamepad2, Zap } from "lucide-react";
import { calculateLeaderboardStats, getTopUsers } from "@/lib/leaderboard-utils"; 
import type { LeaderboardEntry } from "@/lib/utils";

interface LeaderboardStatsProps {
    data: LeaderboardEntry[];
}

const LeaderboardStats: React.FC<LeaderboardStatsProps> = ({ data }) => {
    const top50Participants = getTopUsers(data, 50);
    const stats = calculateLeaderboardStats(top50Participants);

    return (
        <div className="grid grid-cols-2 gap-4">
            <StatCard 
                title="Total Participants" 
                value={stats.totalUsers.toString()} 
                description="Analyzed in Top 50" 
                icon={Users}
                color="primary"
            />
            <StatCard 
                title="Fully Completed" 
                value={stats.completedUsers.toString()} 
                description="All targets reached! 🎉" 
                icon={CheckCircle}
                color="green"
            />
            <StatCard 
                title="Avg. Skill Badges" 
                value={stats.averageSkillBadges.toFixed(1)} 
                description="Avg. per participant" 
                icon={Zap}
                color="yellow"
            />
            <StatCard 
                title="Avg. Arcade Games" 
                value={stats.averageArcadeGames.toFixed(1)} 
                description="Avg. per participant" 
                icon={Gamepad2}
                color="blue"
            />
        </div>
    );
};


const getColorClasses = (color: string) => {
    return {
        bg: "bg-transparent",
        text: "text-foreground",
        shadow: "",
    };
}

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
    color: 'primary' | 'green' | 'yellow' | 'blue';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon, color }) => {
    const classes = getColorClasses(color);

    return (
        <div className="p-3 border border-[#E0E0E0] dark:border-[#333333] font-mono">
            <div className="flex flex-col items-start justify-center">
                <Icon className={`h-5 w-5 mb-2 ${classes.text}`} />
                <div className={`text-xl font-bold ${classes.text}`}>{value}</div>
                
                <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">{title}</div>
                
                <div className="mt-1 text-[10px] text-muted-foreground">{description}</div>
            </div>
        </div>
    );
};

export default LeaderboardStats;