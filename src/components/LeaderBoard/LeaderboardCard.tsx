"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink, Award } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/utils";

interface Props {
    data: LeaderboardEntry[];
    getRankBadge: (rank: number) => React.ReactNode;
}

const LeaderboardCard: React.FC<Props> = ({ data, getRankBadge }) => {
    
    const getRankStyles = (rank: number) => {
        return "border border-[#E0E0E0] dark:border-[#333333] bg-background text-foreground";
    };

    return (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
            {data.length > 0 ? (
                data.map((user, index) => {
                    const safeKey = user["User Email"] || `${user["User Name"] || "unknown"}-${index}`;
                    const isCompleted = user["All Skill Badges & Games Completed"] === "Yes";
                    const displayRank = user.rank;
                    const rankStyles = getRankStyles(displayRank);
                    
                    const completionStyles = isCompleted 
                        ? "border-l-4 border-l-green-500" 
                        : "";

                    return (
                        <div 
                            key={safeKey} 
                            className={`p-4 ${rankStyles} ${completionStyles} flex flex-col gap-2 font-mono`}
                        >
                            <div className="flex flex-row items-start gap-4">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="font-bold text-lg flex items-center justify-center w-8 h-8">
                                        {getRankBadge(displayRank)}
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate text-base">{user["User Name"]}</div>
                                    <div className="text-xs text-muted-foreground truncate mb-1">{user["User Email"]}</div>
                                    
                                    {isCompleted && (
                                        <div className="inline-flex items-center text-[10px] font-bold text-green-500 uppercase tracking-widest">
                                            Completed
                                        </div>
                                    )}
                                </div>
                                
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a
                                            href={user["Google Cloud Skills Boost Profile URL"]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`inline-flex items-center justify-center w-8 h-8 border border-[#E0E0E0] dark:border-[#333333] flex-shrink-0 ${!user["Google Cloud Skills Boost Profile URL"] ? "pointer-events-none opacity-50 bg-transparent" : "bg-foreground text-background hover:bg-transparent hover:text-foreground"}`}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent className="rounded-none border-[#E0E0E0] shadow-none font-mono">
                                        <p>Profile</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 border-t border-[#E0E0E0] dark:border-[#333333] pt-2 mt-2">
                                <div className="p-2 flex justify-between items-center border border-[#E0E0E0] dark:border-[#333333]">
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Skill Badges</div>
                                    <div className="font-bold text-sm">{user["# of Skill Badges Completed"]}</div>
                                </div>
                                <div className="p-2 flex justify-between items-center border border-[#E0E0E0] dark:border-[#333333]">
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Arcade Games</div>
                                    <div className="font-bold text-sm">{user["# of Arcade Games Completed"]}</div>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="p-4 border border-[#E0E0E0] dark:border-[#333333] font-mono text-sm uppercase">
                    <div className="font-bold mb-1">No participants found</div>
                    <p className="text-xs text-muted-foreground">Please check search filters or upload data.</p>
                </div>
            )}
        </div>
    );
};

export default LeaderboardCard;