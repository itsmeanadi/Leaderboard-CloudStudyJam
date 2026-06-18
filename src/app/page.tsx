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
            const res = await fetch("/api/leaderboard");
            if (res.ok) {
                const { entries, frozenUsers: frozen } = await res.json();
                setLeaderboardData(entries || []);
                setFrozenUsers(frozen || {});
            }
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
                setFrozenUsers(data.frozenUsers);
            } else {
                alert("Save failed");
            }
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
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [leaderboardData, sortConfig]);

    const filteredLeaderboardData = useMemo(() => {
        return sortedLeaderboardData.filter(user =>
            user["User Name"].toLowerCase().includes(searchQuery.toLowerCase()) ||
            user["User Email"].toLowerCase().includes(searchQuery.toLowerCase())
        );
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