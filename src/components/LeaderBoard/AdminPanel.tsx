"use client";

import React, { useState, useRef } from "react";
import { uploadCSV } from "@/lib/csv-parser";

interface AdminPanelProps {
    isAdmin: boolean;
    setIsAdmin: (value: boolean) => void;
    onCSVUpload: (data: any) => Promise<void>;
    onLogout: () => void;
}

export default function AdminPanel({ isAdmin, setIsAdmin, onCSVUpload, onLogout }: AdminPanelProps) {
    const [loginOpen, setLoginOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch('/api/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', password })
            });
            if (res.ok) {
                setIsAdmin(true);
                setLoginOpen(false);
                setPassword("");
            } else {
                setError("Invalid credentials");
            }
        } catch {
            setError("Login failed");
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const data = await uploadCSV(file);
            await onCSVUpload(data);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload failed. Check console.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (isAdmin) {
        return (
            <div className="flex flex-wrap items-center gap-2">
                <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                    ref={fileInputRef}
                    disabled={uploading}
                    className="border border-[#E0E0E0] dark:border-[#333333] text-xs font-mono file:bg-transparent file:border-0 file:text-xs file:font-bold file:uppercase cursor-pointer p-1 w-48"
                />
                <button 
                    onClick={() => { setIsAdmin(false); onLogout(); }} 
                    className="border border-[#E0E0E0] dark:border-[#333333] text-xs font-mono font-bold uppercase px-3 py-1 hover:bg-foreground hover:text-background"
                >
                    Logout
                </button>
                {uploading && <span className="text-xs font-mono uppercase font-bold animate-pulse">Syncing...</span>}
            </div>
        );
    }

    if (loginOpen) {
        return (
            <form onSubmit={handleLogin} className="flex flex-wrap items-center gap-2">
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password..." 
                    className="border border-[#E0E0E0] dark:border-[#333333] bg-background text-foreground text-xs font-mono px-2 py-1 w-32 focus:outline-none"
                    autoFocus
                />
                <button type="submit" className="border border-[#E0E0E0] dark:border-[#333333] text-xs font-mono font-bold uppercase px-3 py-1 hover:bg-foreground hover:text-background">Login</button>
                <button type="button" onClick={() => setLoginOpen(false)} className="border border-[#E0E0E0] dark:border-[#333333] text-xs font-mono px-2 py-1 hover:bg-muted">X</button>
                {error && <span className="text-[10px] text-red-500 font-mono">{error}</span>}
            </form>
        );
    }

    return (
        <button 
            onClick={() => setLoginOpen(true)} 
            className="border border-[#E0E0E0] dark:border-[#333333] text-xs font-mono font-bold uppercase px-3 py-1 hover:bg-foreground hover:text-background"
        >
            Admin
        </button>
    );
}