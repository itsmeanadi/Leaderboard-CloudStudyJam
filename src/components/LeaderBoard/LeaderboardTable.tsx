"use client";

import React from "react";
import type { LeaderboardEntry } from "@/lib/utils";

export default function LeaderboardTable({ data }: { data: LeaderboardEntry[] }) {
    return (
        <table className="w-full text-left font-mono text-sm border-collapse">
            <thead className="bg-background border-b border-[#E0E0E0] dark:border-[#333333]">
                <tr>
                    <th className="p-3 text-center w-[80px]">Rank</th>
                    <th className="p-3">User Details</th>
                    <th className="p-3 text-center">Badges</th>
                    <th className="p-3 text-center">Arcade</th>
                    <th className="p-3 text-center w-[80px]">Profile</th>
                </tr>
            </thead>
            <tbody>
                {data.length > 0 ? (
                    data.map((user, i) => {
                        const safeKey = user["User Email"] || `${user["User Name"]}-${i}`;
                        const isCompleted = user["All Skill Badges & Games Completed"] === "Yes";
                        
                        return (
                            <tr key={safeKey} className={`border-b border-[#E0E0E0] dark:border-[#333333] ${isCompleted ? "border-l-4 border-l-green-500" : ""}`}>
                                <td className="p-3 text-center font-bold">{user.rank}</td>
                                <td className="p-3">
                                    <div className="font-bold uppercase text-foreground">{user["User Name"]}</div>
                                    <div className="text-xs text-muted-foreground">{user["User Email"]}</div>
                                    {isCompleted && <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1 block">Completed</span>}
                                </td>
                                <td className="p-3 text-center font-bold">{user["# of Skill Badges Completed"]}</td>
                                <td className="p-3 text-center font-bold">{user["# of Arcade Games Completed"]}</td>
                                <td className="p-3 text-center">
                                    {user["Google Cloud Skills Boost Profile URL"] ? (
                                        <a href={user["Google Cloud Skills Boost Profile URL"]} target="_blank" rel="noopener noreferrer" className="border border-[#E0E0E0] dark:border-[#333333] px-2 py-1 text-xs hover:bg-foreground hover:text-background transition-colors block">
                                            Link
                                        </a>
                                    ) : (
                                        <span className="opacity-30">-</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan={5} className="p-6 text-center text-sm font-bold uppercase text-foreground">No participants found!</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}