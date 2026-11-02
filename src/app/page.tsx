"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";

import AdminPanel from "@/components/LeaderBoard/AdminPanel";
import LeaderboardTable from "@/components/LeaderBoard/LeaderboardTable";
import LeaderboardStats from "@/components/LeaderBoard/LeaderboardStats";
import SearchBar from "@/components/LeaderBoard/SearchBar";

import type { LeaderboardEntry, FrozenUser } from "@/lib/utils";

export default function Home() {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [frozenUsers, setFrozenUsers] = useState<Record<string, FrozenUser>>({});
    const [dataLoading, setDataLoading] = useState(true);
    const [dataSaving, setDataSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({
        key: 'rank', direction: 'asc'
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
            console.error("Failed to load leaderboard:", err);
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

    const saveLeaderboardData = useCallback(async (entries: LeaderboardEntry[], frozen: Record<string, FrozenUser>) => {
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
    }, []);

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedLeaderboardData = useMemo(() => {
        return [...leaderboardData].sort((a: any, b: any) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            // Resolve property aliases if key wasn't found directly
            if (valA === undefined) {
                if (sortConfig.key === 'User Name') valA = a.userName;
                else if (sortConfig.key === '# of Skill Badges Completed') valA = a.skillBadgesCompleted;
                else if (sortConfig.key === '# of Arcade Games Completed') valA = a.arcadeGamesCompleted;
            }
            if (valB === undefined) {
                if (sortConfig.key === 'User Name') valB = b.userName;
                else if (sortConfig.key === '# of Skill Badges Completed') valB = b.skillBadgesCompleted;
                else if (sortConfig.key === '# of Arcade Games Completed') valB = b.arcadeGamesCompleted;
            }

            // Normalize missing or non-comparable values
            const isNullOrUnavailable = (v: any) => v === null || v === undefined || v === "-" || v === "";
            const isANull = isNullOrUnavailable(valA);
            const isBNull = isNullOrUnavailable(valB);

            if (isANull && isBNull) return 0;
            if (isANull) return 1;
            if (isBNull) return -1;

            // Numeric comparison
            const numA = typeof valA === 'number' ? valA : Number(valA);
            const numB = typeof valB === 'number' ? valB : Number(valB);

            if (!isNaN(numA) && !isNaN(numB) && typeof valA !== 'string' || (sortConfig.key === 'rank' || sortConfig.key.includes('Completed'))) {
                if (!isNaN(numA) && !isNaN(numB)) {
                    return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
                }
            }

            // String comparison
            const strA = String(valA || "").toLowerCase();
            const strB = String(valB || "").toLowerCase();
            if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [leaderboardData, sortConfig]);

    const filteredLeaderboardData = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return sortedLeaderboardData;
        return sortedLeaderboardData.filter(user => {
            const name = (user["User Name"] || user.userName || "").toLowerCase();
            const email = (user["User Email"] || user.email || "").toLowerCase();
            return name.includes(query) || email.includes(query);
        });
    }, [sortedLeaderboardData, searchQuery]);

    const visibleLeaderboardData = useMemo(() => {
        return filteredLeaderboardData.slice(0, visibleCount);
    }, [filteredLeaderboardData, visibleCount]);

    if (dataLoading) {
        return <div className="min-h-screen flex items-center justify-center font-mono font-bold uppercase text-sm">Loading...</div>;
    }

    return (
        <div className="min-h-screen p-2 font-mono bg-background text-foreground">
            <header className="flex flex-wrap items-center justify-between gap-4 p-4 border border-[#E0E0E0] dark:border-[#333333] mb-4">
                <div className="flex items-center gap-4">
                    <div className="border border-[#E0E0E0] dark:border-[#333333] p-1">
                        <Image src="/IETDAVV_Logo.png" alt="Logo" width={48} height={48} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-widest">GDGoC IET Study Jam</h1>
                        <p className="text-xs mt-1 uppercase tracking-wider">Official Leaderboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <AdminPanel isAdmin={isAdmin} setIsAdmin={setIsAdmin} onCSVUpload={async (data) => { await saveLeaderboardData(data, frozenUsers); }} onLogout={() => {}} />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 space-y-4">
                    <div className="border border-[#E0E0E0] dark:border-[#333333] p-3">
                        <h2 className="text-sm font-bold uppercase mb-2">Search</h2>
                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    </div>

                    <div className="border border-[#E0E0E0] dark:border-[#333333] p-3">
                        <h2 className="text-sm font-bold uppercase mb-2">Sort</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {['rank', 'User Name', '# of Skill Badges Completed', '# of Arcade Games Completed'].map(key => (
                                <button 
                                    key={key}
                                    onClick={() => handleSort(key)}
                                    className={`border border-[#E0E0E0] dark:border-[#333333] px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${sortConfig.key === key ? 'bg-foreground text-background' : 'hover:bg-muted'}`}
                                >
                                    {key.split(' ')[0]} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border border-[#E0E0E0] dark:border-[#333333] p-3">
                        <h2 className="text-sm font-bold uppercase mb-2">Stats</h2>
                        <LeaderboardStats data={leaderboardData} />
                    </div>
                </div>

                <div className="lg:col-span-2 border border-[#E0E0E0] dark:border-[#333333] p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b border-[#E0E0E0] dark:border-[#333333] pb-2">
                        <h2 className="text-lg font-bold uppercase">Rankings</h2>
                        <div className="text-xs uppercase font-mono">Showing {visibleLeaderboardData.length} of {filteredLeaderboardData.length}</div>
                    </div>
                    
                    <div className="flex-grow overflow-x-auto border border-[#E0E0E0] dark:border-[#333333]">
                        <LeaderboardTable data={visibleLeaderboardData} />
                    </div>
                    
                    {visibleCount < filteredLeaderboardData.length && (
                        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-[#E0E0E0] dark:border-[#333333]">
                            <button onClick={() => setVisibleCount(v => v + 50)} className="border border-[#E0E0E0] dark:border-[#333333] px-6 py-2 text-xs font-bold uppercase hover:bg-foreground hover:text-background">Load More</button>
                            <button onClick={() => setVisibleCount(filteredLeaderboardData.length)} className="border border-[#E0E0E0] dark:border-[#333333] px-6 py-2 text-xs font-bold uppercase hover:bg-muted">View All</button>
                        </div>
                    )}
                </div>
            </div>
            
            {dataSaving && (
                <div className="fixed bottom-4 right-4 bg-foreground text-background px-4 py-2 text-xs font-bold uppercase border border-background z-50">Saving...</div>
            )}
        </div>
    );
}
