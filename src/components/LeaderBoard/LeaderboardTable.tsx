"use client";

import React from "react";
import CatMascot from "@/components/CatMascot/CatMascot";
import type { LeaderboardEntry } from "@/lib/utils";
import { ExternalLink, Award } from "lucide-react";

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  searchQuery?: string;
  onClearSearch?: () => void;
}

export default function LeaderboardTable({
  data,
  searchQuery = "",
  onClearSearch,
}: LeaderboardTableProps) {
  if (data.length === 0) {
    return (
      <div className="py-14 px-4 text-center flex flex-col items-center justify-center">
        {/* The designated 5% playful empty-search illustration */}
        <div className="mb-3 opacity-95">
          <CatMascot variant="empty" size={80} interactive={true} />
        </div>
        <h3 className="text-base font-bold text-[#171525]">
          No participants found
        </h3>
        <p className="mt-1 text-xs text-[#888591] max-w-sm">
          {searchQuery ? (
            <>
              No results found for <span className="font-semibold text-[#171525]">"{searchQuery}"</span>. Check the spelling or search by email.
            </>
          ) : (
            "The leaderboard has no participants loaded yet."
          )}
        </p>
        {searchQuery && onClearSearch && (
          <button
            onClick={onClearSearch}
            className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[#171525] text-white hover:bg-[#211F32] text-xs font-semibold transition-colors"
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E8E5DD] text-[11px] font-bold text-[#888591] uppercase tracking-wider bg-[#F8F7F2]/60">
            <th className="py-3 px-4 text-center w-16">Rank</th>
            <th className="py-3 px-4">Participant</th>
            <th className="py-3 px-4 text-center w-32">Skill Badges</th>
            <th className="py-3 px-4 text-center w-28">Arcade Games</th>
            <th className="py-3 px-4 text-center w-28">Profile</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0ECE1]">
          {data.map((user, i) => {
            const email = (user.email || user["User Email"] || "").toLowerCase();
            const name = user.userName || user["User Name"] || "";
            const safeKey = email || `${name}-${i}`;
            const rank = user.rank;

            const isTop1 = rank === 1;
            const isTop2 = rank === 2;
            const isTop3 = rank === 3;

            const badgesCount =
              user.skillBadgesCompleted !== undefined && user.skillBadgesCompleted !== null
                ? user.skillBadgesCompleted
                : (user["# of Skill Badges Completed"] ?? 0);

            const arcadeCount =
              user.arcadeGamesCompleted !== null && user.arcadeGamesCompleted !== undefined
                ? user.arcadeGamesCompleted
                : (user["# of Arcade Games Completed"] ?? "-");

            const profileUrl = user.skillsProfileUrl || user["Google Cloud Skills Boost Profile URL"];
            const isLegacyCompleted =
              user["All Skill Badges & Games Completed"] === "Yes" || user.allCompleted === "Yes";
            const milestone = user.milestoneCompleted;

            return (
              <tr
                key={safeKey}
                className={`transition-colors hover:bg-[#F8F7F2] ${
                  isTop1
                    ? "bg-[#FFB586]/8"
                    : isTop2
                    ? "bg-[#DCD8EF]/10"
                    : isTop3
                    ? "bg-[#F8F7F2]/50"
                    : "bg-white"
                }`}
              >
                {/* RANK */}
                <td className="py-3.5 px-4 text-center font-mono">
                  <div className="inline-flex items-center justify-center">
                    {isTop1 ? (
                      <span className="w-7 h-7 rounded-lg bg-[#FFB586] text-[#171525] font-black text-xs flex items-center justify-center shadow-xs">
                        1
                      </span>
                    ) : isTop2 ? (
                      <span className="w-7 h-7 rounded-lg bg-[#DCD8EF] text-[#171525] font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                    ) : isTop3 ? (
                      <span className="w-7 h-7 rounded-lg bg-[#E8E5DD] text-[#171525] font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[#888591]">
                        {rank}
                      </span>
                    )}
                  </div>
                </td>

                {/* PARTICIPANT */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#151515]">
                      {name}
                    </span>

                    {/* Subtle mascot accent ONLY on Rank 1 (selective fun) */}
                    {isTop1 && (
                      <span className="inline-flex items-center opacity-85" title="Rank 1 Leader">
                        <CatMascot variant="trophy" size={16} />
                      </span>
                    )}

                    {milestone && milestone !== "No Milestone" && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {milestone}
                      </span>
                    )}

                    {isLegacyCompleted && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#888591] font-mono mt-0.5">
                    {email}
                  </div>
                </td>

                {/* SKILL BADGES */}
                <td className="py-3.5 px-4 text-center">
                  <span className="font-extrabold text-sm text-[#171525]">
                    {badgesCount}
                  </span>
                </td>

                {/* ARCADE GAMES */}
                <td className="py-3.5 px-4 text-center">
                  <span className={`text-xs font-medium ${arcadeCount === "-" ? "text-[#888591]" : "text-[#171525]"}`}>
                    {arcadeCount}
                  </span>
                </td>

                {/* PROFILE LINK */}
                <td className="py-3.5 px-4 text-center">
                  {profileUrl ? (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8F7F2] hover:bg-[#171525] hover:text-white text-xs font-semibold text-[#171525] border border-[#E8E5DD] hover:border-[#171525] transition-all"
                      title="Google Cloud Skills Boost Profile"
                    >
                      <span>Profile</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  ) : (
                    <span className="text-xs text-[#888591] opacity-40">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
