"use client";

import React, { useState, useRef } from "react";
import { uploadCSV } from "@/lib/csv-parser";
import { Lock, LogOut, Upload, Loader2, X } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/utils";

interface AdminPanelProps {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  onCSVUpload: (data: LeaderboardEntry[]) => Promise<void>;
  onLogout: () => void;
}

export default function AdminPanel({
  isAdmin,
  setIsAdmin,
  onCSVUpload,
  onLogout,
}: AdminPanelProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password }),
      });
      if (res.ok) {
        setIsAdmin(true);
        setLoginOpen(false);
        setPassword("");
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Invalid administrator credentials");
      }
    } catch {
      setError("Login network error");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch (err) {
      console.error("Logout request error:", err);
    }
    setIsAdmin(false);
    onLogout();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await uploadCSV(file);
      await onCSVUpload(data);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err?.message || "Check format and console"}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 1. LOGGED IN STATE
  if (isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <label
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#211F32] hover:bg-[#2F2C45] text-xs font-semibold text-[#FFB586] border border-[#FFB586]/40 cursor-pointer transition-all shadow-xs ${
            uploading ? "opacity-70 pointer-events-none" : ""
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFB586]" />
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
            </>
          )}
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#211F32] hover:bg-rose-950/50 text-xs font-medium text-[#888591] hover:text-rose-300 border border-[#2F2C45] transition-colors"
          title="Sign out of Admin Session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    );
  }

  // 2. LOGIN POPOVER STATE
  if (loginOpen) {
    return (
      <div className="relative">
        <form
          onSubmit={handleLogin}
          className="flex items-center gap-1.5 bg-[#211F32] border border-[#2F2C45] p-1.5 rounded-xl shadow-lg"
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password..."
            className="w-32 sm:w-40 h-7 pl-2.5 pr-2 text-xs font-medium bg-[#171525] text-white placeholder:text-[#888591] border border-[#2F2C45] rounded-md focus:outline-none focus:border-[#FFB586]"
            autoFocus
            disabled={loggingIn}
          />

          <button
            type="submit"
            disabled={loggingIn || !password}
            className="h-7 px-2.5 rounded-md bg-[#FFB586] hover:bg-[#FFA26B] disabled:opacity-50 text-xs font-bold text-[#171525] transition-colors flex items-center justify-center shrink-0"
          >
            {loggingIn ? <Loader2 className="w-3 h-3 animate-spin" /> : "Login"}
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginOpen(false);
              setError("");
            }}
            className="w-7 h-7 rounded-md bg-[#171525] text-[#888591] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </form>

        {error && (
          <div className="absolute right-0 top-full mt-1.5 px-2.5 py-1 rounded-md bg-rose-950 border border-rose-800 text-[11px] font-semibold text-rose-200 shadow-md z-50 whitespace-nowrap">
            {error}
          </div>
        )}
      </div>
    );
  }

  // 3. DEFAULT TRIGGER
  return (
    <button
      onClick={() => setLoginOpen(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#211F32] hover:bg-[#2F2C45] border border-[#2F2C45] text-xs font-semibold text-[#DCD8EF] hover:text-white transition-all shadow-xs"
    >
      <Lock className="w-3 h-3 text-[#FFB586]" />
      <span>Admin</span>
    </button>
  );
}
