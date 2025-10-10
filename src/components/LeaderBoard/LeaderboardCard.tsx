"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/utils";

interface Props {
  data: LeaderboardEntry[];
  getRankBadge: (rank: number) => React.ReactNode;
}

const LeaderboardCard: React.FC<Props> = ({ data, getRankBadge }) => {
  return (
    <div className="flex flex-col gap-4">
      {data.length > 0 ? (
        data.map((user, index) => {
          const safeKey = user["User Email"] || `${user["User Name"] || "unknown"}-${index}`;
          // Check if user has completed all badges and games
          const isCompleted = user["All Skill Badges & Games Completed"] === "Yes";
          const displayRank = user.rank;

          return (
            <Card key={safeKey} className={isCompleted ? "bg-green-100 dark:bg-green-900/30" : ""}>
              <CardHeader className="flex flex-row items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                  <div className="font-bold text-lg flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                    {getRankBadge(displayRank)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user["User Name"]}</div>
                    <div className="text-sm text-muted-foreground truncate">{user["User Email"]}</div>
                  </div>
                </div>
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
              </CardHeader>
              <CardContent className="px-4 pt-0 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Skill Badges</div>
                    <div className="font-semibold text-lg">{user["# of Skill Badges Completed"]}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Arcade Games</div>
                    <div className="font-semibold text-lg">{user["# of Arcade Games Completed"]}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="text-center py-8 text-muted-foreground">No data available. Please upload a CSV file.</div>
      )}
    </div>
  );
};

export default LeaderboardCard;