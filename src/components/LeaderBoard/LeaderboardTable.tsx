"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/utils";

interface Props {
    data: LeaderboardEntry[];
    getRankBadge: (rank: number) => React.ReactNode;
}

const LeaderboardTable: React.FC<Props> = ({ data, getRankBadge }) => {
    
    const getRankRowStyles = (rank: number) => {
        return "border-b border-[#E0E0E0] dark:border-[#333333] hover:bg-transparent";
    };

    return (
        <div className="overflow-x-auto border-none font-mono">
            <Table className="w-full">
                <TableHeader className="border-b border-[#E0E0E0] dark:border-[#333333] bg-background">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[80px] text-center align-middle font-bold text-foreground">Rank</TableHead>
                        <TableHead className="text-left align-middle font-bold text-foreground">User Details</TableHead>
                        <TableHead className="text-center align-middle font-bold text-foreground">Skill Badges</TableHead>
                        <TableHead className="text-center align-middle font-bold text-foreground">Arcade Games</TableHead>
                        <TableHead className="w-[80px] text-center align-middle font-bold text-foreground">Profile</TableHead>
                    </TableRow>
                </TableHeader>
                
                <TableBody>
                    {data.length > 0 ? (
                        data.map((user, index) => {
                            const safeKey = user["User Email"] || `${user["User Name"] || "unknown"}-${index}`;
                            const isCompleted = user["All Skill Badges & Games Completed"] === "Yes";
                            const displayRank = user.rank;

                            let rowClasses = getRankRowStyles(displayRank);
                            if (isCompleted) {
                                rowClasses += " border-l-4 border-l-green-500";
                            }
                            
                            return (
                                <TableRow 
                                    key={safeKey} 
                                    className={rowClasses}
                                >
                                    <TableCell className="font-bold text-center align-middle text-base text-foreground">
                                        <div className="flex items-center justify-center">
                                            {getRankBadge(displayRank)}
                                        </div>
                                    </TableCell>
                                    
                                    <TableCell className="text-left align-middle font-medium">
                                        <div className="font-bold text-foreground text-sm uppercase">{user["User Name"]}</div>
                                        <div className="text-xs text-muted-foreground">{user["User Email"]}</div>
                                        {isCompleted && (
                                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1 inline-block">
                                                Completed
                                            </span>
                                        )}
                                    </TableCell>
                                    
                                    <TableCell className="text-center align-middle font-bold text-sm text-foreground">
                                        {user["# of Skill Badges Completed"]}
                                    </TableCell>
                                    
                                    <TableCell className="text-center align-middle font-bold text-sm text-foreground">
                                        {user["# of Arcade Games Completed"]}
                                    </TableCell>
                                    
                                    <TableCell className="text-center align-middle">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <a
                                                    href={user["Google Cloud Skills Boost Profile URL"]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center justify-center w-8 h-8 border border-[#E0E0E0] dark:border-[#333333] ${!user["Google Cloud Skills Boost Profile URL"] ? "pointer-events-none opacity-50 bg-transparent" : "bg-foreground text-background hover:bg-transparent hover:text-foreground"}`}
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent className="rounded-none border-[#E0E0E0] shadow-none font-mono">
                                                <p>Profile</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center align-middle text-sm font-bold uppercase text-foreground">
                                No participants found! Please upload data.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default LeaderboardTable;