"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";

import AdminPanel from "@/components/LeaderBoard/AdminPanel";
import LeaderboardCard from "@/components/LeaderBoard/LeaderboardCard";
import LeaderboardTable from "@/components/LeaderBoard/LeaderboardTable";
import LeaderboardStats from "@/components/LeaderBoard/LeaderboardStats";
import SearchBar from "@/components/LeaderBoard/SearchBar";

import { useIsMobile } from "@/hooks/use-mobile";
import type { LeaderboardEntry, FrozenUser } from "@/lib/utils";

import { Loader2, ChevronDown, Award } from "lucide-react";
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
    const [visibleCount, setVisibleCount] = useState(50);

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
                const errorData = await res.json().catch(() => ({}));
                console.error("Server error response:", errorData);
                throw new Error(`Failed to save leaderboard data: ${res.status} ${res.statusText}`);
            }
            
            const data = await res.json();
            setLeaderboardData(data.entries);
            setFrozenUsers(data.frozenUsers);
        } catch (error: any) {
            console.error("Save error:", error);
            alert(`Failed to save leaderboard data: ${error.message || error}`);
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
            if (sortConfig.key === 'rank') {
                const rankA = a.rank;
                const rankB = b.rank;
                
                if (sortConfig.direction === 'asc') {
                    return rankA - rankB;
                } else {
                    return rankB - rankA;
                }
            }
            
            let aValue: string | number = a[sortConfig.key as keyof LeaderboardEntry] as string | number;
            let bValue: string | number = b[sortConfig.key as keyof LeaderboardEntry] as string | number;
            
            if (typeof aValue === 'string' && !isNaN(Number(aValue))) {
                aValue = Number(aValue);
            }
            if (typeof bValue === 'string' && !isNaN(Number(bValue))) {
                bValue = Number(bValue);
            }
            
            if (aValue == null) aValue = '';
            if (bValue == null) bValue = '';
            
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
        if (rank === 1) return <span className="text-2xl">🥇</span>;
        if (rank === 2) return <span className="text-2xl">🥈</span>;
        if (rank === 3) return <span className="text-2xl">🥉</span>;
        return <span className="font-bold text-lg text-muted-foreground">{rank}</span>;
    };

    const getSortIndicator = (key: string) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
        }
        return '';
    };

    if (dataLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background fixed inset-0 z-[100]">
                <div className="flex flex-col items-center p-4 border border-[#E0E0E0] dark:border-[#333333]">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <span className="text-sm font-mono font-bold">Loading leaderboard...</span>
                    <span className="text-xs font-mono text-muted-foreground">GDGoC Is Analysing Your Scores</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-2 space-y-4 font-mono bg-background text-foreground">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-[#E0E0E0] dark:border-[#333333]">
                <div className="flex items-center gap-4">
                    <div className="border border-[#E0E0E0] dark:border-[#333333] p-1">
                        <Image src="/IETDAVV_Logo.png" alt="GDGoC IET Logo" width={48} height={48} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-widest">
                            GDGoC IET Study Jam
                        </h1>
                        <p className="text-xs mt-1 flex items-center gap-1 uppercase tracking-wider">
                            Official Leaderboard
                        </p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <AdminPanel 
                        isAdmin={isAdmin} 
                        setIsAdmin={setIsAdmin} 
                        onCSVUpload={async (data) => { await saveLeaderboardData(data, frozenUsers); }} 
                        onLogout={() => console.log("Logged out")}
                    />
                </div>
            </header>

            <div className="flex sm:hidden items-center justify-between p-2 border border-[#E0E0E0] dark:border-[#333333]">
                <div className="flex items-center gap-2">
                    <AdminPanel 
                        isAdmin={isAdmin} 
                        setIsAdmin={setIsAdmin} 
                        onCSVUpload={async (data) => { await saveLeaderboardData(data, frozenUsers); }} 
                        onLogout={() => console.log("Logged out")}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 space-y-4">
                    <div className="border border-[#E0E0E0] dark:border-[#333333] p-3">
                        <h2 className="text-sm font-bold uppercase mb-2">
                            Search Participants
                        </h2>
                        <SearchBar 
                            value={searchQuery} 
                            onChange={setSearchQuery} 
                        />
                    </div>

                    <div className="border border-[#E0E0E0] dark:border-[#333333] p-3">
                        <h2 className="text-sm font-bold uppercase mb-2">
                            Sort Options
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {['rank', 'User Name', '# of Skill Badges Completed', '# of Arcade Games Completed'].map(key => (
                                <Button 
                                    key={key}
                                    variant={sortConfig.key === key ? 'default' : 'outline'} 
                                    size="sm" 
                                    onClick={() => handleSort(key)}
                                    className={`rounded-none shadow-none flex items-center justify-center gap-1 h-8 font-mono text-xs ${sortConfig.key === key ? 'bg-foreground text-background border-foreground' : 'bg-transparent text-foreground border-[#E0E0E0] dark:border-[#333333] hover:bg-muted'}`}
                                >
                                    {key === 'rank' && 'Rank'}
                                    {key === 'User Name' && 'Name'}
                                    {key === '# of Skill Badges Completed' && 'Badges'}
                                    {key === '# of Arcade Games Completed' && 'Arcade'}
                                    {getSortIndicator(key)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="border border-[#E0E0E0] dark:border-[#333333] p-3">
                        <h2 className="text-sm font-bold uppercase mb-2">
                            Leaderboard Statistics
                        </h2>
                        <LeaderboardStats data={leaderboardData} />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="border border-[#E0E0E0] dark:border-[#333333] p-4 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b border-[#E0E0E0] dark:border-[#333333] pb-2">
                            <h2 className="text-lg font-bold uppercase">
                                Participant Rankings
                            </h2>
                            <div className="text-xs uppercase font-mono">
                                Showing {visibleLeaderboardData.length} of {filteredLeaderboardData.length}
                            </div>
                        </div>
                        
                        <div className="flex-grow overflow-hidden">
                            {isMobile ? (
                                <div className="space-y-2">
                                    <LeaderboardCard
                                        data={visibleLeaderboardData}
                                        getRankBadge={getRankBadge}
                                    />
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-[#E0E0E0] dark:border-[#333333]">
                                    <LeaderboardTable
                                        data={visibleLeaderboardData}
                                        getRankBadge={getRankBadge}
                                    />
                                </div>
                            )}
                        </div>
                        
                        {visibleCount < filteredLeaderboardData.length && (
                            <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t border-[#E0E0E0] dark:border-[#333333]">
                                <Button 
                                    variant="default"
                                    onClick={showMore}
                                    className="rounded-none shadow-none border border-[#E0E0E0] dark:border-[#333333] bg-foreground text-background hover:bg-foreground uppercase font-bold text-xs h-10 px-8"
                                >
                                    Load More
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    onClick={showAll}
                                    className="rounded-none shadow-none text-xs uppercase font-mono hover:bg-transparent"
                                >
                                    View All ({filteredLeaderboardData.length})
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {dataSaving && (
                <div className="fixed bottom-4 right-4 bg-foreground text-background px-4 py-2 text-xs font-mono font-bold uppercase border border-background z-50 flex items-center gap-2 shadow-none rounded-none">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                </div>
            )}
        </div>
    );
}