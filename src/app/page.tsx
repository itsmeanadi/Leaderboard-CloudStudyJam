"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import BrandHeader from "@/components/LeaderBoard/BrandHeader";
import LeaderboardHero from "@/components/LeaderBoard/LeaderboardHero";
import PodiumShowcase from "@/components/LeaderBoard/PodiumShowcase";
import LeaderboardStats from "@/components/LeaderBoard/LeaderboardStats";
import LeaderboardTable from "@/components/LeaderBoard/LeaderboardTable";
import SearchBar from "@/components/LeaderBoard/SearchBar";
import CatMascot from "@/components/CatMascot/CatMascot";

import type { LeaderboardEntry, FrozenUser } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, Loader2 } from "lucide-react";

export default function Home() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [frozenUsers, setFrozenUsers] = useState<Record<string, FrozenUser>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [dataSaving, setDataSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "rank",
    direction: "asc",
  });
  const [visibleCount, setVisibleCount] = useState(50);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setDataLoading(true);
      const [lbRes, authRes] = await Promise.all([
        fetch("/api/leaderboard"),
        fetch("/api/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify" }),
        }).catch(() => null),
      ]);

      if (lbRes.ok) {
        const data = await lbRes.json();
        setLeaderboardData(data.entries || []);
        setFrozenUsers(data.frozenUsers || {});
      }

      if (authRes && authRes.ok) {
        const authData = await authRes.json();
        if (authData?.isAdmin) {
          setIsAdmin(true);
        }
      }
    } catch (err) {
      console.error("Failed to load leaderboard data:", err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const saveLeaderboardData = useCallback(
    async (entries: LeaderboardEntry[], frozen: Record<string, FrozenUser>) => {
      try {
        setDataSaving(true);
        const res = await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries, frozenUsers: frozen }),
        });
        if (res.ok) {
          const data = await res.json();
          setLeaderboardData(data.entries);
          setFrozenUsers(data.frozenUsers || {});
        } else {
          const errData = await res.json().catch(() => null);
          alert(`Save failed: ${errData?.error || "Unknown server error"}`);
        }
      } catch (err: any) {
        alert(`Save failed: ${err?.message || "Network error"}`);
      } finally {
        setDataSaving(false);
      }
    },
    []
  );

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedLeaderboardData = useMemo(() => {
    return [...leaderboardData].sort((a: any, b: any) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      // Resolve aliases
      if (valA === undefined) {
        if (sortConfig.key === "User Name") valA = a.userName;
        else if (sortConfig.key === "# of Skill Badges Completed")
          valA = a.skillBadgesCompleted;
        else if (sortConfig.key === "# of Arcade Games Completed")
          valA = a.arcadeGamesCompleted;
      }
      if (valB === undefined) {
        if (sortConfig.key === "User Name") valB = b.userName;
        else if (sortConfig.key === "# of Skill Badges Completed")
          valB = b.skillBadgesCompleted;
        else if (sortConfig.key === "# of Arcade Games Completed")
          valB = b.arcadeGamesCompleted;
      }

      // Null handling
      const isNull = (v: any) =>
        v === null || v === undefined || v === "-" || v === "";
      if (isNull(valA) && isNull(valB)) return 0;
      if (isNull(valA)) return 1;
      if (isNull(valB)) return -1;

      // Numeric comparison
      const numA = typeof valA === "number" ? valA : Number(valA);
      const numB = typeof valB === "number" ? valB : Number(valB);
      if (
        !isNaN(numA) &&
        !isNaN(numB) &&
        (typeof valA !== "string" ||
          sortConfig.key === "rank" ||
          sortConfig.key.includes("Completed"))
      ) {
        return sortConfig.direction === "asc" ? numA - numB : numB - numA;
      }

      // String comparison
      const strA = String(valA || "").toLowerCase();
      const strB = String(valB || "").toLowerCase();
      if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
      if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [leaderboardData, sortConfig]);

  const filteredLeaderboardData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedLeaderboardData;
    return sortedLeaderboardData.filter((user) => {
      const name = (user["User Name"] || user.userName || "").toLowerCase();
      const email = (user["User Email"] || user.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [sortedLeaderboardData, searchQuery]);

  const visibleLeaderboardData = useMemo(() => {
    return filteredLeaderboardData.slice(0, visibleCount);
  }, [filteredLeaderboardData, visibleCount]);

  // Loading Screen
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E5DD] flex items-center justify-center shadow-xs mb-3">
          <CatMascot variant="default" size={24} />
        </div>
        <h2 className="text-sm font-bold text-[#171525]">
          Loading Leaderboard...
        </h2>
        <p className="text-xs text-[#888591] mt-0.5">
          Fetching participant progress for GDGoC IET DAVV
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#151515] flex flex-col selection:bg-[#FFB586] selection:text-[#171525]">
      {/* 1. BRAND HEADER */}
      <BrandHeader
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onCSVUpload={async (data) => {
          await saveLeaderboardData(data, frozenUsers);
        }}
        totalCount={leaderboardData.length}
      />

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex-1">
        {/* 2. COMPACT HERO SECTION */}
        <LeaderboardHero totalParticipants={leaderboardData.length} />

        {/* 3. PODIUM (TOP 3 CONTENDERS) */}
        {!searchQuery && leaderboardData.length > 0 && (
          <PodiumShowcase topEntries={leaderboardData.slice(0, 3)} />
        )}

        {/* 4. STATISTICS CARDS (CLEAN & MINIMAL) */}
        <LeaderboardStats data={leaderboardData} />

        {/* 5. LEADERBOARD TABLE (THE MAIN FOCUS) */}
        <div className="mt-6 rounded-2xl bg-white border border-[#E8E5DD] shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-[#E8E5DD] bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              {/* Title & Counter */}
              <div>
                <h3 className="text-base font-extrabold text-[#171525] flex items-center gap-2">
                  <span>Official Rankings</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F8F7F2] text-[#888591] border border-[#E8E5DD]">
                    {filteredLeaderboardData.length} Contenders
                  </span>
                </h3>
                <p className="text-xs text-[#888591] mt-0.5">
                  Showing {visibleLeaderboardData.length} of {filteredLeaderboardData.length} participants
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full sm:w-72">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search name or email..."
                />
              </div>
            </div>

            {/* Sort Controls */}
            <div className="mt-3.5 pt-3 border-t border-[#F0ECE1] flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#888591] flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5" />
                Sort:
              </span>

              {[
                { label: "Rank", key: "rank" },
                { label: "Name", key: "User Name" },
                { label: "Skill Badges", key: "# of Skill Badges Completed" },
                { label: "Arcade Games", key: "# of Arcade Games Completed" },
              ].map(({ label, key }) => {
                const isActive = sortConfig.key === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-[#171525] text-white"
                        : "bg-[#F8F7F2] hover:bg-[#E8E5DD] text-[#171525] border border-[#E8E5DD]"
                    }`}
                  >
                    <span>{label}</span>
                    {isActive ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-[#FFB586]" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-[#FFB586]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[#888591]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TABLE CONTENT */}
          <LeaderboardTable
            data={visibleLeaderboardData}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery("")}
          />

          {/* PAGINATION */}
          {visibleCount < filteredLeaderboardData.length && (
            <div className="p-4 bg-[#F8F7F2]/50 border-t border-[#E8E5DD] flex items-center justify-center gap-2.5">
              <button
                onClick={() => setVisibleCount((v) => v + 50)}
                className="px-4 py-2 rounded-xl bg-[#171525] hover:bg-[#211F32] text-xs font-semibold text-white transition-colors"
              >
                Load More (+50)
              </button>

              <button
                onClick={() => setVisibleCount(filteredLeaderboardData.length)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#F8F7F2] text-xs font-semibold text-[#171525] border border-[#E8E5DD] transition-colors"
              >
                View All ({filteredLeaderboardData.length})
              </button>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-[#E8E5DD] bg-white py-5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#888591]">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="font-semibold text-[#171525]">GDGoC IET DAVV</span>
            <span>• Google Cloud Study Jam Leaderboard</span>
          </div>

          <div className="text-xs text-[#888591] flex items-center gap-1.5 flex-wrap justify-center sm:justify-end">
            <span>Built by</span>
            <a
              href="https://www.linkedin.com/in/anadisharmaa/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#171525] hover:text-[#FFB586] hover:underline transition-colors"
            >
              Anadi Sharma
            </a>
            <span>•</span>
            <span>Maintained by</span>
            <a
              href="https://www.linkedin.com/company/gdgoc-iet-davv/posts/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#171525] hover:text-[#FFB586] hover:underline transition-colors"
            >
              GDGoC IET DAVV
            </a>
          </div>
        </div>
      </footer>

      {/* SAVING FLOATING INDICATOR */}
      {dataSaving && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#171525] text-white border border-[#2F2C45] shadow-lg">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFB586]" />
          <span className="text-xs font-medium text-[#FFB586]">
            Saving updates...
          </span>
        </div>
      )}
    </div>
  );
}
