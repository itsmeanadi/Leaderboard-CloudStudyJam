"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";

import AdminPanel from "@/components/LeaderBoard/AdminPanel";
import LeaderboardCard from "@/components/LeaderBoard/LeaderboardCard";
import LeaderboardTable from "@/components/LeaderBoard/LeaderboardTable";
import LeaderboardStats from "@/components/LeaderBoard/LeaderboardStats";
import SearchBar from "@/components/LeaderBoard/SearchBar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import type { LeaderboardEntry, FrozenUser } from "@/lib/utils";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [frozenUsers, setFrozenUsers] = useState<Record<string, FrozenUser>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [dataSaving, setDataSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({
    key: 'rank',
    direction: 'asc'
  });

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

  const saveLeaderboardData = useCallback(async (entries: LeaderboardEntry[], frozen: Record<string, FrozenUser>) => {
    try {
      setDataSaving(true);
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entries, frozenUsers: frozen }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to save leaderboard data");
      }
      
      const data = await res.json();
      setLeaderboardData(data.entries);
      setFrozenUsers(data.frozenUsers);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save leaderboard data");
    } finally {
      setDataSaving(false);
    }
  }, []);

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedLeaderboardData = useMemo(() => {
    const sortableData = [...leaderboardData];
    
    sortableData.sort((a, b) => {
      // Handle different data types
      let aValue: string | number = a[sortConfig.key as keyof LeaderboardEntry] as string | number;
      let bValue: string | number = b[sortConfig.key as keyof LeaderboardEntry] as string | number;
      
      // Convert string numbers to actual numbers for proper sorting
      if (typeof aValue === 'string' && !isNaN(Number(aValue))) {
        aValue = Number(aValue);
      }
      if (typeof bValue === 'string' && !isNaN(Number(bValue))) {
        bValue = Number(bValue);
      }
      
      // Handle undefined/null values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      // Compare values
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sortableData;
  }, [leaderboardData, sortConfig]);

  const filteredLeaderboardData = useMemo(() => {
    return sortedLeaderboardData.filter(
      user =>
        user["User Name"].toLowerCase().includes(searchQuery.toLowerCase()) ||
        user["User Email"].toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedLeaderboardData, searchQuery]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span>🥇</span>;
    if (rank === 2) return <span>🥈</span>;
    if (rank === 3) return <span>🥉</span>;
    return rank;
  };

  const getSortIndicator = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
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
          <ThemeToggle />
          {isAdmin ? (
            <AdminPanel
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
              onCSVUpload={async (data) => {
                await saveLeaderboardData(data, frozenUsers);
              }}
              onLogout={() => console.log("Logged out")}
            />
          ) : (
            <AdminPanel
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
              onCSVUpload={async (data) => {
                await saveLeaderboardData(data, frozenUsers);
              }}
              onLogout={() => {}}
            />
          )}
        </div>
      </header>

      {/* Search Bar */}
      <SearchBar 
        value={searchQuery} 
        onChange={setSearchQuery} 
      />

      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleSort('rank')}
          className="flex items-center gap-1"
        >
          Rank{getSortIndicator('rank')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleSort('User Name')}
          className="flex items-center gap-1"
        >
          Name{getSortIndicator('User Name')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleSort('# of Skill Badges Completed')}
          className="flex items-center gap-1"
        >
          Skill Badges{getSortIndicator('# of Skill Badges Completed')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleSort('# of Arcade Games Completed')}
          className="flex items-center gap-1"
        >
          Arcade Games{getSortIndicator('# of Arcade Games Completed')}
        </Button>
      </div>

      {/* Statistics */}
      <LeaderboardStats data={leaderboardData} />

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
          isMobile={isMobile}
        />
      )}
      
      {dataSaving && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg">
          Saving data...
        </div>
      )}
    </div>
  );
}