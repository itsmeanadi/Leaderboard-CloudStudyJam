"use client";

import React from "react";
import Image from "next/image";
import CatMascot from "@/components/CatMascot/CatMascot";
import AdminPanel from "@/components/LeaderBoard/AdminPanel";
import type { LeaderboardEntry } from "@/lib/utils";

interface BrandHeaderProps {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onCSVUpload: (data: LeaderboardEntry[]) => Promise<void>;
  totalCount: number;
}

export default function BrandHeader({
  isAdmin,
  setIsAdmin,
  onCSVUpload,
  totalCount,
}: BrandHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#171525] border-b border-[#2F2C45] px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#211F32] border border-[#2F2C45] p-1.5 shrink-0">
            <Image
              src="/IETDAVV_Logo.png"
              alt="GDGoC IET DAVV Logo"
              width={30}
              height={30}
              className="object-contain"
              priority
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                GDGoC IET DAVV
              </h1>
              {/* Subtle mascot touch (5% personality) */}
              <div className="opacity-80 hover:opacity-100 transition-opacity">
                <CatMascot variant="default" size={16} />
              </div>
            </div>
            <p className="text-[11px] text-[#888591] font-medium tracking-normal">
              Google Cloud Study Jam • Official Leaderboard
            </p>
          </div>
        </div>

        {/* Status indicator & Admin Action */}
        <div className="flex items-center gap-3">
          {totalCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#211F32] border border-[#2F2C45] text-xs text-[#DCD8EF]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>
                <strong className="text-white font-semibold">{totalCount}</strong> Participants
              </span>
            </div>
          )}

          <AdminPanel
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
            onCSVUpload={onCSVUpload}
            onLogout={() => setIsAdmin(false)}
          />
        </div>
      </div>
    </header>
  );
}
