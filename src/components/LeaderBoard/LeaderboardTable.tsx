"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/utils";

interface Props {
  data: LeaderboardEntry[];
  getRankBadge: (rank: number) => React.ReactNode;
  isMobile: boolean;
}

const LeaderboardTable: React.FC<Props> = ({ data, getRankBadge, isMobile }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] text-center align-middle">Rank</TableHead>
            <TableHead className="text-center align-middle">User</TableHead>
            <TableHead className="text-center align-middle">Skill Badges</TableHead>
            {!isMobile && <TableHead className="text-center align-middle hidden sm:table-cell">Arcade Games</TableHead>}
            <TableHead className="w-[80px] text-center align-middle">Profile</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((user, index) => {
              const safeKey = user["User Email"] || `${user["User Name"] || "unknown"}-${index}`;
              // Check if user has completed all badges and games
              const isCompleted = user["All Skill Badges & Games Completed"] === "Yes";
              const displayRank = user.rank;

              return (
                <TableRow key={safeKey} className={isCompleted ? "bg-green-100 dark:bg-green-900/30" : ""}>
                  <TableCell className="font-bold text-center align-middle text-lg">
                    <div className="flex items-center justify-center">
                      {getRankBadge(displayRank)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <div className="font-medium">{user["User Name"]}</div>
                    <div className="hidden text-sm text-muted-foreground sm:inline">{user["User Email"]}</div>
                  </TableCell>
                  <TableCell className="text-center align-middle font-mono text-base">
                    <div className="flex items-center justify-center">
                      {user["# of Skill Badges Completed"]}
                    </div>
                  </TableCell>
                  {!isMobile && (
                    <TableCell className="text-center align-middle font-mono text-base hidden sm:table-cell">
                      <div className="flex items-center justify-center">
                        {user["# of Arcade Games Completed"]}
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-center align-middle">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={user["Google Cloud Skills Boost Profile URL"]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center w-8 h-8 ${!user["Google Cloud Skills Boost Profile URL"] ? "pointer-events-none opacity-50" : ""}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View Google Cloud Skills Boost Profile</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={isMobile ? 4 : 5} className="h-24 text-center align-middle">
                {data.length === 0 ? "No data available. Please upload a CSV file." : ""}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaderboardTable;