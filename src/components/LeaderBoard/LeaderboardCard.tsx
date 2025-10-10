"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock, ExternalLink } from "lucide-react";
import type { LeaderboardEntry, FrozenUser } from "@/lib/utils";

interface Props {
  data: LeaderboardEntry[];
  frozenUsers: Record<string, FrozenUser>;
  getRankBadge: (rank: number) => React.ReactNode;
}

const LeaderboardCard: React.FC<Props> = ({ data, frozenUsers, getRankBadge }) => {
  return (
    <div className="flex flex-col gap-2">
      {data.length > 0 ? (
        data.map((user, index) => {
          const safeKey = user["User Email"] || `${user["User Name"] || "unknown"}-${index}`;
          const isFrozen =
            frozenUsers[user["User Email"]] || user["All Skill Badges & Games Completed"] === "Yes";
          const displayRank =
            isFrozen && frozenUsers[user["User Email"]]
              ? frozenUsers[user["User Email"]].rank
              : user.rank;

          return (
            <Card key={safeKey} className={isFrozen ? "bg-green-100 dark:bg-green-900/30" : ""}>
              <CardHeader className="flex flex-row items-center gap-2">
                <div className="font-bold text-lg flex items-center gap-2">
                  {getRankBadge(displayRank)}
                  {isFrozen && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Lock className="h-4 w-4 text-green-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This user's rank is locked at {displayRank}.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{user["User Name"]}</div>
                  <div className="text-sm text-muted-foreground">{user["User Email"]}</div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={user["Google Cloud Skills Boost Profile URL"]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex p-1 ${!user["Google Cloud Skills Boost Profile URL"] ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Google Cloud Skills Boost Profile</p>
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent className="flex flex-row gap-4 text-sm">
                <div>
                  <span className="font-semibold">Skill Badges:</span> {user["# of Skill Badges Completed"]}
                </div>
                <div>
                  <span className="font-semibold">Arcade Games:</span> {user["# of Arcade Games Completed"]}
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="text-center py-8">No data available. Please upload a CSV file.</div>
      )}
    </div>
  );
};

export default LeaderboardCard;
