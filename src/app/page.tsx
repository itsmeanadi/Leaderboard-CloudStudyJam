"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";

import AdminPanel from "@/components/Leaderboard/AdminPanel";
import LeaderboardCard from "@/components/Leaderboard/LeaderboardCard";
import LeaderboardTable from "@/components/Leaderboard/LeaderboardTable";
import { useIsMobile } from "@/hooks/use-mobile";
import type { LeaderboardEntry, FrozenUser } from "@/lib/utils";

import { Loader2, Sun, Moon } from "lucide-react";

export default function Home() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [frozenUsers, setFrozenUsers] = useState<Record<string, FrozenUser>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const isMobile = useIsMobile();

  const fetchLeaderboard = useCallback(async () => {
    try {
      setDataLoading(true);
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const { entries, frozenUsers: frozen } = await res.json();
        setLeaderboardData(entries || []);
        setFrozenUsers(frozen || {});
      } else {
        console.error("API Error:", await res.text());
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  const filteredLeaderboardData = useMemo(() => {
    return leaderboardData.filter(
      user =>
        user["User Name"].toLowerCase().includes(searchQuery.toLowerCase()) ||
        user["User Email"].toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaderboardData, searchQuery]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span>🥇</span>;
    if (rank === 2) return <span>🥈</span>;
    if (rank === 3) return <span>🥉</span>;
    return rank;
  };

  if (dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading leaderboard...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-4">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Image src="/IETDAVV_Logo.png" alt="IET DAVV Logo" width={64} height={64} />
          <h1 className="text-3xl font-bold">IET DAVV Study Jam Leaderboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme}>{theme === "dark" ? "🌙" : "☀️"}</button>
          {isAdmin ? (
            <AdminPanel
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
              onCSVUpload={data => setLeaderboardData(data)}
              onLogout={() => console.log("Logged out")}
            />
          ) : (
            <AdminPanel
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
              onCSVUpload={data => setLeaderboardData(data)}
              onLogout={() => {}}
            />
          )}
        </div>
      </header>

      {isMobile ? (
        <LeaderboardCard
          data={filteredLeaderboardData}
          frozenUsers={frozenUsers}
          getRankBadge={getRankBadge}
        />
      ) : (
        <LeaderboardTable
          data={filteredLeaderboardData}
          frozenUsers={frozenUsers}
          getRankBadge={getRankBadge}
        />
      )}
    </div>
  );
}
