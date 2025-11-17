"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";

// Assuming these components handle the new styling internally or accept props for it
import AdminPanel from "@/components/LeaderBoard/AdminPanel";
import LeaderboardCard from "@/components/LeaderBoard/LeaderboardCard";
import LeaderboardTable from "@/components/LeaderBoard/LeaderboardTable";
import LeaderboardStats from "@/components/LeaderBoard/LeaderboardStats";
import SearchBar from "@/components/LeaderBoard/SearchBar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import type { LeaderboardEntry, FrozenUser } from "@/lib/utils";

import { Loader2, ChevronDown, Award } from "lucide-react"; // Added Award icon
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
        // ... (fetchLeaderboard logic remains the same)
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
        // ... (sorting logic remains the same)
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
        // ... (filtering logic remains the same)
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
            <div className="flex min-h-screen items-center justify-center bg-background/90 backdrop-blur-sm fixed inset-0 z-[100]">
                <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-2xl border-t-4 border-primary animate-pulse">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <span className="mt-3 text-lg font-semibold text-primary">Loading leaderboard...</span>
                    <span className="text-sm text-muted-foreground">GDGoC Is Analysing Your Scores</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 space-y-8">
            
            {/* 1. Header Section (Vibrant & Animated) */}
            <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-card rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-primary/50 border-t-4 border-primary animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-4">
                    {/* Logo with a cool border */}
                    <Image src="/IETDAVV_Logo.png" alt="GDGoC IET Logo" width={64} height={64} className="rounded-xl border-2 border-primary/50 p-1" />
                    <div>
                        {/* Title in bright blue, bold and engaging */}
                        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
                            GDGoC IET Study Jam samosa
                        </h1>
                        <p className="text-base text-muted-foreground mt-1 flex items-center gap-1">
                            <Award className="h-4 w-4 text-yellow-500" />
                            Official Leaderboard
                        </p>
                    </div>
                </div>
                {/* Controls (Hidden on Mobile/Shown on Mobile Top Bar - using the logic below) */}
                <div className="hidden sm:flex items-center gap-2">
                    <ThemeToggle />
                    <AdminPanel 
                        isAdmin={isAdmin} 
                        setIsAdmin={setIsAdmin} 
                        onCSVUpload={async (data) => { await saveLeaderboardData(data, frozenUsers); }} 
                        onLogout={() => console.log("Logged out")}
                    />
                </div>
            </header>

            {/* Top Bar for Mobile - Admin and Theme Controls (Made more distinct) */}
            <div className="flex sm:hidden items-center justify-between p-3 bg-card rounded-xl shadow-lg border-b border-primary/30">
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <AdminPanel 
                        isAdmin={isAdmin} 
                        setIsAdmin={setIsAdmin} 
                        onCSVUpload={async (data) => { await saveLeaderboardData(data, frozenUsers); }} 
                        onLogout={() => console.log("Logged out")}
                    />
                </div>
                <div className="text-xs text-muted-foreground">Tap to manage</div>
            </div>

            {/* 2. Dashboard Content (Grid Layout with Elevated Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-1000">
                {/* Left Column - Search, Sort, Stats */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Search Bar Card */}
                    <div className="bg-card rounded-3xl shadow-xl p-5 border border-border/50 hover:shadow-blue-500/20 transition-shadow">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                            🔍 Search Participants
                        </h2>
                        <SearchBar 
                            value={searchQuery} 
                            onChange={setSearchQuery} 
                        />
                    </div>

                    {/* Sort Controls Card (Using primary variant for active state) */}
                    <div className="bg-card rounded-3xl shadow-xl p-5 border border-border/50 hover:shadow-blue-500/20 transition-shadow">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                            ⬇️ Sort Options
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {['rank', 'User Name', '# of Skill Badges Completed', '# of Arcade Games Completed'].map(key => (
                                <Button 
                                    key={key}
                                    variant={sortConfig.key === key ? 'default' : 'outline'} 
                                    size="sm" 
                                    onClick={() => handleSort(key)}
                                    className="flex items-center justify-center gap-1 h-10 font-semibold"
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

                    {/* Statistics Card */}
                    <div className="bg-card rounded-3xl shadow-xl p-5 border border-border/50 hover:shadow-blue-500/20 transition-shadow">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                            📊 Leaderboard Statistics
                        </h2>
                        <LeaderboardStats data={leaderboardData} />
                    </div>
                </div>

                {/* Right Column - Main Leaderboard View */}
                <div className="lg:col-span-2">
                    {/* Main Leaderboard Container with a strong visual presence */}
                    <div className="bg-card rounded-3xl shadow-2xl p-6 h-full flex flex-col border-4 border-primary/20">
                        <div className="flex justify-between items-center mb-6 border-b pb-3 border-border/50">
                            <h2 className="text-2xl font-bold text-primary">
                                🏅 Participant Rankings
                            </h2>
                            <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full font-medium">
                                Showing **{visibleLeaderboardData.length}** of **{filteredLeaderboardData.length}** participants
                            </div>
                        </div>
                        
                        {/* Leaderboard Data */}
                        <div className="flex-grow overflow-hidden">
                            {isMobile ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <LeaderboardCard
                                        data={visibleLeaderboardData}
                                        getRankBadge={getRankBadge}
                                    />
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-border">
                                    <LeaderboardTable
                                        data={visibleLeaderboardData}
                                        getRankBadge={getRankBadge}
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* Load More Button (Vibrant & Engaging) */}
                        {visibleCount < filteredLeaderboardData.length && (
                            <div className="flex flex-col items-center gap-2 mt-8 pt-4 border-t border-border/50">
                                <Button 
                                    variant="default" // Use the bright blue primary variant
                                    onClick={showMore}
                                    className="flex items-center gap-2 w-full sm:w-1/2 text-lg font-semibold h-12 rounded-full transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-primary/50"
                                >
                                    View More Participants <ChevronDown className="h-5 w-5" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    onClick={showAll}
                                    className="text-xs text-muted-foreground hover:text-primary"
                                >
                                    View All ({filteredLeaderboardData.length} total)
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* 3. Data Saving Feedback (Animated and Fun) */}
            {dataSaving && (
                <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-pulse transition-all duration-300">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    **Data Saving...** Dont go anywhere!
                </div>
            )}
        </div>
    );
}