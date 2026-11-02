"use client";

import React from "react";
import CatMascot from "@/components/CatMascot/CatMascot";
import type { LeaderboardEntry } from "@/lib/utils";
import { ExternalLink, Trophy } from "lucide-react";

interface PodiumShowcaseProps {
  topEntries: LeaderboardEntry[];
}

export default function PodiumShowcase({ topEntries }: PodiumShowcaseProps) {
  if (!topEntries || topEntries.length === 0) return null;

  const first = topEntries[0];
  const second = topEntries[1];
  const third = topEntries[2];

  if (!first) return null;

  return (
    <div className="w-full my-5">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#FFB586]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#171525]">
            Top Contenders
          </h3>
        </div>
        <span className="text-xs text-[#888591] font-medium">Rankings 1 – 3</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
        {/* ================= SECOND PLACE (Rank 2) ================= */}
        {second ? (
          <div className="order-2 md:order-1 rounded-2xl bg-white border border-[#E8E5DD] p-4 flex flex-col justify-between shadow-xs hover:border-[#DCD8EF] transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#DCD8EF] text-[#171525] text-xs font-bold">
                  <span>2nd Place</span>
                </span>
                <span className="text-xs font-bold text-[#171525]">
                  {second.skillBadgesCompleted ?? second["# of Skill Badges Completed"] ?? 0} Badges
                </span>
              </div>

              <h4 className="font-bold text-[#151515] text-sm truncate">
                {second.userName || second["User Name"]}
              </h4>
              <p className="text-xs text-[#888591] truncate font-mono mt-0.5">
                {second.email || second["User Email"]}
              </p>

              {second.milestoneCompleted && second.milestoneCompleted !== "No Milestone" && (
                <div className="mt-2">
                  <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {second.milestoneCompleted}
                  </span>
                </div>
              )}
            </div>

            {(second.skillsProfileUrl || second["Google Cloud Skills Boost Profile URL"]) && (
              <a
                href={second.skillsProfileUrl || second["Google Cloud Skills Boost Profile URL"] || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3.5 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-[#F8F7F2] hover:bg-[#DCD8EF] text-xs font-semibold text-[#171525] transition-colors"
              >
                <span>Skills Profile</span>
                <ExternalLink className="w-3 h-3 text-[#888591]" />
              </a>
            )}
          </div>
        ) : (
          <div className="order-2 md:order-1" />
        )}

        {/* ================= FIRST PLACE (Rank 1) ================= */}
        <div className="order-1 md:order-2 rounded-2xl bg-[#171525] border-2 border-[#FFB586] p-4 sm:p-5 flex flex-col justify-between shadow-md relative">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FFB586] text-[#171525] text-xs font-extrabold shadow-xs">
                <span>1st Place</span>
                {/* 5% fun: tiny celebratory cat mascot reaction */}
                <CatMascot variant="trophy" size={16} />
              </span>
              <span className="text-xs font-extrabold text-[#FFB586]">
                ★ {first.skillBadgesCompleted ?? first["# of Skill Badges Completed"] ?? 0} Badges
              </span>
            </div>

            <h4 className="font-extrabold text-white text-base truncate">
              {first.userName || first["User Name"]}
            </h4>
            <p className="text-xs text-[#888591] truncate font-mono mt-0.5">
              {first.email || first["User Email"]}
            </p>

            {first.milestoneCompleted && first.milestoneCompleted !== "No Milestone" && (
              <div className="mt-2">
                <span className="inline-block text-[10px] font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded">
                  {first.milestoneCompleted}
                </span>
              </div>
            )}
          </div>

          {(first.skillsProfileUrl || first["Google Cloud Skills Boost Profile URL"]) && (
            <a
              href={first.skillsProfileUrl || first["Google Cloud Skills Boost Profile URL"] || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#FFB586] hover:bg-[#FFA26B] text-xs font-bold text-[#171525] transition-colors shadow-xs"
            >
              <span>Skills Profile</span>
              <ExternalLink className="w-3 h-3 text-[#171525]" />
            </a>
          )}
        </div>

        {/* ================= THIRD PLACE (Rank 3) ================= */}
        {third ? (
          <div className="order-3 rounded-2xl bg-white border border-[#E8E5DD] p-4 flex flex-col justify-between shadow-xs hover:border-[#E8E5DD] transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F8F7F2] text-[#888591] text-xs font-bold border border-[#E8E5DD]">
                  <span>3rd Place</span>
                </span>
                <span className="text-xs font-bold text-[#171525]">
                  {third.skillBadgesCompleted ?? third["# of Skill Badges Completed"] ?? 0} Badges
                </span>
              </div>

              <h4 className="font-bold text-[#151515] text-sm truncate">
                {third.userName || third["User Name"]}
              </h4>
              <p className="text-xs text-[#888591] truncate font-mono mt-0.5">
                {third.email || third["User Email"]}
              </p>

              {third.milestoneCompleted && third.milestoneCompleted !== "No Milestone" && (
                <div className="mt-2">
                  <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {third.milestoneCompleted}
                  </span>
                </div>
              )}
            </div>

            {(third.skillsProfileUrl || third["Google Cloud Skills Boost Profile URL"]) && (
              <a
                href={third.skillsProfileUrl || third["Google Cloud Skills Boost Profile URL"] || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3.5 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-[#F8F7F2] hover:bg-[#E8E5DD] text-xs font-semibold text-[#171525] transition-colors"
              >
                <span>Skills Profile</span>
                <ExternalLink className="w-3 h-3 text-[#888591]" />
              </a>
            )}
          </div>
        ) : (
          <div className="order-3" />
        )}
      </div>
    </div>
  );
}
