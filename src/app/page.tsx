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

import { Loader2, ChevronDown } from "lucide-react";
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
  const [visibleCount, setVisibleCount] = useState(50); // Initially show top 50

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
      // Special handling for rank sorting to ensure 1st place shows first
      if (sortConfig.key === 'rank') {
        const rankA = a.rank;
        const rankB = b.rank;
        
        if (sortConfig.direction === 'asc') {
          return rankA - rankB; // 1, 2, 3, ... (1st place first)
        } else {
          return rankB - rankA; // ..., 3, 2, 1 (last place first)
        }
      }
      
      // Handle different data types for other columns
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

  const visibleLeaderboardData = useMemo(() => {
    return filteredLeaderboardData.slice(0, visibleCount);
  }, [filteredLeaderboardData, visibleCount]);

  const showMore = () => {
    setVisibleCount(prev => prev + 50);
  };

  const showAll = () => {
    setVisibleCount(filteredLeaderboardData.length);
  };

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
      {/* Top Bar for Mobile - Admin and Theme Controls */}
      <div className="flex sm:hidden items-center justify-between mb-4 p-2 bg-card rounded-lg shadow">
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
      </div>

      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 bg-card rounded-lg shadow">
        <div className="flex items-center gap-4">
          <Image src="/IETDAVV_Logo.png" alt="GDGoC IET Logo" width={64} height={64} />
          <div>
            <h1 className="text-2xl font-bold">GDGoC IET Study Jam Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Track participant progress and achievements</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
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

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Search and Sort */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search Bar */}
          <div className="bg-card rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Search Participants</h2>
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery} 
            />
          </div>

          {/* Sort Controls */}
          <div className="bg-card rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Sort Options</h2>
            <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Statistics */}
          <div className="bg-card rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Leaderboard Statistics</h2>
            <LeaderboardStats data={leaderboardData} />
          </div>
        </div>

        {/* Right Column - Leaderboard */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Participant Rankings</h2>
              <div className="text-sm text-muted-foreground">
                Showing {visibleLeaderboardData.length} of {filteredLeaderboardData.length} participants
              </div>
            </div>
            
            <div className="flex-grow">
              {isMobile ? (
                <div className="space-y-4">
                  <LeaderboardCard
                    data={visibleLeaderboardData}
                    getRankBadge={getRankBadge}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <LeaderboardTable
                    data={visibleLeaderboardData}
                    getRankBadge={getRankBadge}
                    isMobile={isMobile}
                  />
                </div>
              )}
            </div>
            
            {/* Load More Button */}
            {visibleCount < filteredLeaderboardData.length && (
              <div className="flex flex-col items-center gap-2 mt-6 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={showMore}
                  className="flex items-center gap-2"
                >
                  View More <ChevronDown className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={showAll}
                  className="text-xs text-muted-foreground"
                >
                  View All ({filteredLeaderboardData.length} total)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {dataSaving && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg z-50">
          Saving data...
        </div>
      )}
    </div>
  );

}