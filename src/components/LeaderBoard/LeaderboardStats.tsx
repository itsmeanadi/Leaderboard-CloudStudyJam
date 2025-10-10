"use client";

import React from "react";
import { Users, CheckCircle, Gamepad2, Zap } from "lucide-react"; // Added icons for visual appeal
// Assuming these utilities are correct
import { calculateLeaderboardStats, getTopUsers } from "@/lib/leaderboard-utils"; 
import type { LeaderboardEntry } from "@/lib/utils";

interface LeaderboardStatsProps {
    data: LeaderboardEntry[];
}

const LeaderboardStats: React.FC<LeaderboardStatsProps> = ({ data }) => {
    // Note: Assuming getTopUsers and calculateLeaderboardStats are working correctly.
    const top50Participants = getTopUsers(data, 50);
    const stats = calculateLeaderboardStats(top50Participants);

    return (
        <div className="grid grid-cols-2 gap-4"> {/* Increased gap for better spacing */}
            <StatCard 
                title="Total Participants" 
                value={stats.totalUsers.toString()} 
                description="Analyzed in Top 50" 
                icon={Users}
                color="primary" // Custom color prop
            />
            <StatCard 
                title="Fully Completed" 
                value={stats.completedUsers.toString()} 
                description="All targets reached! 🎉" 
                icon={CheckCircle}
                color="green" // Highlight completed users with green
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

// Helper function to map color string to Tailwind classes
const getColorClasses = (color: string) => {
    switch (color) {
        case 'green':
            return {
                bg: "bg-green-500/15",
                text: "text-green-600 dark:text-green-400",
                shadow: "shadow-green-500/20",
            };
        case 'yellow':
            return {
                bg: "bg-yellow-500/15",
                text: "text-yellow-600 dark:text-yellow-400",
                shadow: "shadow-yellow-500/20",
            };
        case 'blue':
            return {
                bg: "bg-blue-500/15",
                text: "text-blue-600 dark:text-blue-400",
                shadow: "shadow-blue-500/20",
            };
        case 'primary':
        default:
            return {
                bg: "bg-primary/10",
                text: "text-primary",
                shadow: "shadow-primary/20",
            };
    }
}

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType; // Icon component from lucide-react
    color: 'primary' | 'green' | 'yellow' | 'blue';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon, color }) => {
    const classes = getColorClasses(color);

    return (
        // Added rounded-xl, subtle shadow, and dynamic background/hover effects
        <div 
            className={`rounded-xl p-4 text-center border ${classes.bg} border-transparent shadow-lg hover:shadow-xl hover:${classes.shadow} transition-all duration-300 transform hover:scale-[1.03]`}
        >
            <div className="flex flex-col items-center justify-center">
                
                {/* Icon (Color-coded) */}
                <Icon className={`h-6 w-6 mb-1 ${classes.text}`} />
                
                {/* Value (Big and Bold) */}
                <div className={`text-2xl font-extrabold ${classes.text}`}>{value}</div>
                
                {/* Title */}
                <div className="text-xs text-foreground mt-1 font-semibold">{title}</div>
                
                {/* Description (More subtle) */}
                <div className="mt-1 text-xs text-muted-foreground">{description}</div>
            </div>
        </div>
    );
};

export default LeaderboardStats;