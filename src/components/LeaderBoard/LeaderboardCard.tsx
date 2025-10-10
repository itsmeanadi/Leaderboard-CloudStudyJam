"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink, Award } from "lucide-react"; // Added Award icon for flair
import type { LeaderboardEntry } from "@/lib/utils";

interface Props {
    data: LeaderboardEntry[];
    getRankBadge: (rank: number) => React.ReactNode;
}

const LeaderboardCard: React.FC<Props> = ({ data, getRankBadge }) => {
    
    // Function to determine the rank-specific styling
    const getRankStyles = (rank: number) => {
        switch (rank) {
            case 1:
                // Gold effect with a subtle blue gradient border
                return "shadow-xl border-4 border-yellow-400/80 bg-gradient-to-r from-yellow-500/10 to-primary/10 transition-all duration-300 hover:shadow-yellow-500/50";
            case 2:
                // Silver effect
                return "shadow-lg border-2 border-gray-400/80 bg-secondary/30 transition-all duration-300 hover:shadow-gray-400/50";
            case 3:
                // Bronze effect
                return "shadow-md border-2 border-amber-600/80 bg-secondary/20 transition-all duration-300 hover:shadow-amber-600/50";
            default:
                // Standard card with primary theme hover
                return "shadow-md border-border bg-card transition-all duration-300 hover:shadow-primary/20";
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
            {data.length > 0 ? (
                data.map((user, index) => {
                    const safeKey = user["User Email"] || `${user["User Name"] || "unknown"}-${index}`;
                    const isCompleted = user["All Skill Badges & Games Completed"] === "Yes";
                    const displayRank = user.rank;
                    const rankStyles = getRankStyles(displayRank);
                    
                    // Style for Full Completion (overrides background, keeps rank border/shadow)
                    const completionStyles = isCompleted 
                        ? "bg-green-500/10 dark:bg-green-900/40 border-green-500/50" 
                        : "";

                    return (
                        // Apply both rank and completion styles
                        <Card 
                            key={safeKey} 
                            className={`rounded-2xl ${rankStyles} ${completionStyles} hover:scale-[1.01] transform`}
                        >
                            <CardHeader className="flex flex-row items-center gap-4 p-4">
                                {/* Rank Badge (Made bigger and more centered) */}
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className={`font-bold text-lg flex items-center justify-center w-12 h-12 rounded-full ${displayRank <= 3 ? "bg-transparent" : "bg-muted border border-border"}`}>
                                        {getRankBadge(displayRank)}
                                    </div>
                                </div>
                                
                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className={`font-extrabold truncate text-lg ${displayRank <= 3 ? 'text-primary' : 'text-foreground'}`}>{user["User Name"]}</div>
                                    <div className="text-sm text-muted-foreground truncate">{user["User Email"]}</div>
                                    
                                    {/* Completion Status (Vibrant Badge) */}
                                    {isCompleted && (
                                        <div className="inline-flex items-center mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white dark:bg-green-600 shadow-md">
                                            <Award className="h-3 w-3 mr-1" />
                                            Completed!
                                        </div>
                                    )}
                                </div>
                                
                                {/* Profile Link (Primary color pop) */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a
                                            href={user["Google Cloud Skills Boost Profile URL"]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`inline-flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${!user["Google Cloud Skills Boost Profile URL"] ? "pointer-events-none opacity-50 bg-secondary" : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"}`}
                                        >
                                            <ExternalLink className="h-5 w-5" />
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View Skills Boost Profile</p>
                                    </TooltipContent>
                                </Tooltip>
                            </CardHeader>
                            
                            <CardContent className="px-4 pt-0 pb-4">
                                <div className="grid grid-cols-2 gap-3 border-t pt-3 border-border/50">
                                    <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-3 text-center transition-colors">
                                        <div className="text-xs text-primary/80 font-medium">Skill Badges</div>
                                        <div className="font-extrabold text-xl text-primary">{user["# of Skill Badges Completed"]}</div>
                                    </div>
                                    <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-3 text-center transition-colors">
                                        <div className="text-xs text-primary/80 font-medium">Arcade Games</div>
                                        <div className="font-extrabold text-xl text-primary">{user["# of Arcade Games Completed"]}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
            ) : (
                <div className="text-center py-10 text-muted-foreground bg-card rounded-2xl shadow-xl border-4 border-dashed border-border/50">
                    <div className="text-xl font-semibold mb-2 text-primary">No participants found 🙁</div>
                    <p className="text-sm">Abhi toh party shuru bhi nahi hui! Please check search filters or upload the data.</p>
                </div>
            )}
        </div>
    );
};

export default LeaderboardCard;