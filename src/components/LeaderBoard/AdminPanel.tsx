"use client";

import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, LogOut, AlertCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import type { LeaderboardEntry } from "@/lib/utils";

interface CSVRow {
  [key: string]: string;
}

interface Props {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onCSVUpload: (data: LeaderboardEntry[]) => void;
  onLogout: () => void;
}

const AdminPanel: React.FC<Props> = ({ isAdmin, setIsAdmin, onCSVUpload, onLogout }) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleLogin = () => {
    const validUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (username === validUsername && password === validPassword) {
      setIsAdmin(true);
      setLoginOpen(false);
      setUsername("");
      setPassword("");
      setError(null);
    } else {
      setError("Invalid username or password");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const sortLeaderboardData = (data: LeaderboardEntry[]): LeaderboardEntry[] => {
    return [...data].sort((a, b) => {
      const skillBadgesA = typeof a["# of Skill Badges Completed"] === 'string' 
        ? parseInt(a["# of Skill Badges Completed"]) 
        : a["# of Skill Badges Completed"];
      const skillBadgesB = typeof b["# of Skill Badges Completed"] === 'string' 
        ? parseInt(b["# of Skill Badges Completed"]) 
        : b["# of Skill Badges Completed"];
        
      if (skillBadgesB !== skillBadgesA) {
        return skillBadgesB - skillBadgesA;
      }
      
      const arcadeGamesA = typeof a["# of Arcade Games Completed"] === 'string' 
        ? parseInt(a["# of Arcade Games Completed"]) 
        : a["# of Arcade Games Completed"];
      const arcadeGamesB = typeof b["# of Arcade Games Completed"] === 'string' 
        ? parseInt(b["# of Arcade Games Completed"]) 
        : b["# of Arcade Games Completed"];
        
      return arcadeGamesB - arcadeGamesA;
    });
  };

  const cleanCSVValue = (value: string): string => {
    let cleanValue = value.trim();
    if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
      cleanValue = cleanValue.substring(1, cleanValue.length - 1);
    }
    return cleanValue;
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadStatus({message: "Please upload a valid CSV file", type: 'error'});
      setTimeout(() => setUploadStatus(null), 3000);
      e.target.value = "";
      return;
    }

    setIsLoading(true);
    setUploadStatus(null);

    try {
      const text = await file.text();
      const rows = text.split("\n").map(row => row.split(","));
      
      if (rows.length < 2) {
        throw new Error("CSV file is empty or invalid");
      }
      
      const headers = rows.shift() || [];
      
      const requiredHeaders = ['User Name', 'User Email'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }
      
      const data: CSVRow[] = rows
        .filter(row => row.some(cell => cell.trim() !== ""))
        .map((row) => {
          const obj: CSVRow = {};
          row.forEach((val, idx) => {
            if (headers[idx]) {
              obj[headers[idx].trim()] = cleanCSVValue(val);
            }
          });
          return obj;
        });
      
      let leaderboardData: LeaderboardEntry[] = data.map((row, index) => ({
        rank: parseInt(row['rank']) || index + 1,
        "User Name": row['User Name'] || '',
        "User Email": row['User Email'] || '',
        "# of Skill Badges Completed": parseInt(row['# of Skill Badges Completed']) || 0,
        "# of Arcade Games Completed": parseInt(row['# of Arcade Games Completed']) || 0,
        "All Skill Badges & Games Completed": row['All Skill Badges & Games Completed'] as "Yes" | "No" | undefined,
        "Google Cloud Skills Boost Profile URL": row['Google Cloud Skills Boost Profile URL']
      }));
      
      leaderboardData = sortLeaderboardData(leaderboardData);
      
      leaderboardData = leaderboardData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      
      await onCSVUpload(leaderboardData);
      setUploadStatus({message: "CSV uploaded and sorted successfully!", type: 'success'});
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload CSV";
      setUploadStatus({message: errorMessage, type: 'error'});
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadStatus(null), 3000);
      e.target.value = "";
    }
  };


  if (!isAdmin) {
    return (
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-none border border-[#E0E0E0] dark:border-[#333333] shadow-none bg-transparent hover:bg-transparent text-foreground">
            Admin Login
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] rounded-none border border-[#E0E0E0] dark:border-[#333333] shadow-none bg-background">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Admin Portal Access</DialogTitle>
            <DialogDescription>
              Enter your credentials to access the admin dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="border border-red-500 bg-transparent p-2 text-sm text-red-500 font-mono">
                <div className="flex items-center gap-2">
                  <span>{error}</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <div className="col-span-3">
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full rounded-none border-[#E0E0E0] dark:border-[#333333] shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <div className="col-span-3">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full rounded-none border-[#E0E0E0] dark:border-[#333333] shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLoginOpen(false)} className="rounded-none border border-[#E0E0E0] dark:border-[#333333] shadow-none hover:bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleLogin} disabled={isLoading} className="rounded-none shadow-none bg-foreground text-background hover:bg-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="w-full max-w-2xl border border-[#E0E0E0] dark:border-[#333333] bg-background">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E0E0E0] dark:border-[#333333] p-4">
        <div>
          <h2 className="text-lg font-bold">
            <span className="font-mono bg-foreground text-background px-1 mr-2">Admin</span>
            Dashboard
          </h2>
          <p className="text-sm font-mono mt-1 text-muted-foreground">Manage leaderboard data and settings</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-none border border-[#E0E0E0] dark:border-[#333333] shadow-none bg-transparent hover:bg-transparent flex items-center gap-2" onClick={() => { setIsAdmin(false); onLogout(); }}>
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          <div className="border border-[#E0E0E0] dark:border-[#333333] p-3">
            <div className="flex items-center gap-2 mb-2 border-b border-[#E0E0E0] dark:border-[#333333] pb-2">
              <Upload className="h-5 w-5" />
              <div>
                <h3 className="font-bold text-sm">Update Leaderboard Data</h3>
                <p className="text-xs font-mono text-muted-foreground">
                  Upload a CSV file with participant data to update the leaderboard (automatically sorted by completion)
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
              <Button asChild variant="default" size="sm" disabled={isLoading} className="w-full sm:w-auto rounded-none shadow-none bg-foreground text-background hover:bg-foreground">
                <Label 
                  htmlFor="csv-upload" 
                  className="cursor-pointer flex items-center gap-2 justify-center font-mono text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload CSV
                    </>
                  )}
                </Label>
              </Button>
            </div>
          </div>


          {uploadStatus && (
            <div className={`p-2 font-mono text-xs border ${
              uploadStatus.type === 'success' 
                ? 'border-green-500 text-green-500' 
                : 'border-red-500 text-red-500'
            }`}>
              {uploadStatus.message}
            </div>
          )}

          <div className="border border-[#E0E0E0] dark:border-[#333333] p-3">
            <div className="flex items-center gap-2 mb-2 border-b border-[#E0E0E0] dark:border-[#333333] pb-2">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-bold text-sm">Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-xs mb-1">Sorting Information</h4>
                <p className="text-xs font-mono mb-1">
                  Data is automatically sorted by completion metrics in descending order:
                </p>
                <ul className="text-xs font-mono list-disc pl-4 space-y-1">
                  <li>Primary: # of Skill Badges Completed (highest first)</li>
                  <li>Secondary: # of Arcade Games Completed (highest first)</li>
                  <li>Ranks are automatically updated based on this sorting</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-xs mb-1">CSV Format Requirements</h4>
                <ul className="text-xs font-mono list-disc pl-4 space-y-1">
                  <li>Must include columns: &quot;User Name&quot;, &quot;User Email&quot;</li>
                  <li>Optional columns: &quot;rank&quot;, &quot;# of Skill Badges Completed&quot;, &quot;# of Arcade Games Completed&quot;</li>
                  <li>&quot;All Skill Badges &amp; Games Completed&quot;, &quot;Google Cloud Skills Boost Profile URL&quot;</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;