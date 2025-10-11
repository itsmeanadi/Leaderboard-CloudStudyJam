"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/utils";

interface Props {
    data: LeaderboardEntry[];
    getRankBadge: (rank: number) => React.ReactNode;
    // isMobile: boolean; // Note: isMobile is usually false for the table view
}

const LeaderboardTable: React.FC<Props> = ({ data, getRankBadge }) => {
    
    // Function to determine the rank-specific styling for the row
    const getRankRowStyles = (rank: number) => {
        switch (rank) {
            case 1:
                // Vibrant primary highlight for 1st place
                return "bg-primary/5 border-l-4 border-primary shadow-lg hover:bg-primary/10 transition-all duration-200";
            case 2:
                // Lighter primary highlight
                return "bg-primary/5 hover:bg-primary/10 transition-colors duration-200";
            case 3:
                // Subtle highlight
                return "bg-secondary/5 hover:bg-secondary/10 transition-colors duration-200";
            default:
                // Standard row with a nice hover effect
                return "hover:bg-muted/50 transition-colors duration-150";
        }
    };

    return (
        // Added primary blue border and rounded corners to the table wrapper
        <div className="overflow-x-auto rounded-xl border border-primary/20 shadow-xl animate-in fade-in slide-in-from-top-2">
            <Table>
                {/* Enhanced Header with Primary Text */}
                <TableHeader className="bg-muted/50 border-b border-primary/20 sticky top-0 z-10">
                    <TableRow className="hover:bg-muted/50">
                        <TableHead className="w-[80px] text-center align-middle font-bold text-primary/80">Rank</TableHead>
                        <TableHead className="text-left align-middle font-bold text-primary/80">User Details</TableHead>
                        <TableHead className="text-center align-middle font-bold text-primary/80">Skill Badges</TableHead>
                        {/* Always show Arcade Games on desktop (where this component is primarily used) */}
                        <TableHead className="text-center align-middle font-bold text-primary/80">Arcade Games</TableHead>
                        <TableHead className="w-[80px] text-center align-middle font-bold text-primary/80">Profile</TableHead>
                    </TableRow>
                </TableHeader>
                
                <TableBody>
                    {data.length > 0 ? (
                        data.map((user, index) => {
                            const safeKey = user["User Email"] || `${user["User Name"] || "unknown"}-${index}`;
                            const isCompleted = user["All Skill Badges & Games Completed"] === "Yes";
                            const displayRank = user.rank;

                            // Combine rank styles with completion styles (completion overrides specific background only)
                            let rowClasses = getRankRowStyles(displayRank);
                            if (isCompleted && displayRank > 3) {
                                // Subtle green highlight for completed users outside the top 3
                                rowClasses = "bg-green-500/5 hover:bg-green-500/10 transition-colors duration-200";
                            }
                            
                            return (
                                <TableRow 
                                    key={safeKey} 
                                    className={rowClasses}
                                >
                                    {/* Rank Cell: Highlighted for Top 3 */}
                                    <TableCell className={`font-extrabold text-center align-middle text-lg ${displayRank <= 3 ? 'text-primary' : ''}`}>
                                        <div className="flex items-center justify-center">
                                            {getRankBadge(displayRank)}
                                        </div>
                                    </TableCell>
                                    
                                    {/* User Details Cell */}
                                    <TableCell className="text-left align-middle font-medium">
                                        <div className="font-semibold text-foreground">{user["User Name"]}</div>
                                        <div className="text-sm text-muted-foreground">{user["User Email"]}</div>
                                        {/* Added completion badge here for better visibility */}
                                        {isCompleted && (
                                            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                Completed
                                            </span>
                                        )}
                                    </TableCell>
                                    
                                    {/* Skill Badges Cell: Primary color for emphasis */}
                                    <TableCell className="text-center align-middle font-extrabold text-base text-primary">
                                        {user["# of Skill Badges Completed"]}
                                    </TableCell>
                                    
                                    {/* Arcade Games Cell: Primary color for emphasis */}
                                    <TableCell className="text-center align-middle font-extrabold text-base text-primary/80">
                                        {user["# of Arcade Games Completed"]}
                                    </TableCell>
                                    
                                    {/* Profile Link Cell: Primary button link */}
                                    <TableCell className="text-center align-middle">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <a
                                                    href={user["Google Cloud Skills Boost Profile URL"]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    // Primary background color for the link button
                                                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${!user["Google Cloud Skills Boost Profile URL"] ? "pointer-events-none opacity-50 bg-secondary" : "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"}`}
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>View Skills Boost Profile</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center align-middle text-xl font-semibold text-primary/80">
                                No participants found! Time to upload some data. 🚀
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default LeaderboardTable;