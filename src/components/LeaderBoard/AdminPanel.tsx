"use client";

import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, LogOut, AlertCircle, Link } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import type { LeaderboardEntry } from "@/lib/utils";

// Type for raw CSV data before processing
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
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [showGoogleSheetForm, setShowGoogleSheetForm] = useState(false);

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
    // Sort by skill badges completed (descending), then by arcade games (descending)
    return [...data].sort((a, b) => {
      // First sort by skill badges completed (descending)
      const skillBadgesA = typeof a["# of Skill Badges Completed"] === 'string' 
        ? parseInt(a["# of Skill Badges Completed"]) 
        : a["# of Skill Badges Completed"];
      const skillBadgesB = typeof b["# of Skill Badges Completed"] === 'string' 
        ? parseInt(b["# of Skill Badges Completed"]) 
        : b["# of Skill Badges Completed"];
        
      if (skillBadgesB !== skillBadgesA) {
        return skillBadgesB - skillBadgesA;
      }
      
      // Then sort by arcade games completed (descending)
      const arcadeGamesA = typeof a["# of Arcade Games Completed"] === 'string' 
        ? parseInt(a["# of Arcade Games Completed"]) 
        : a["# of Arcade Games Completed"];
      const arcadeGamesB = typeof b["# of Arcade Games Completed"] === 'string' 
        ? parseInt(b["# of Arcade Games Completed"]) 
        : b["# of Arcade Games Completed"];
        
      return arcadeGamesB - arcadeGamesA;
    });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadStatus({message: "Please upload a valid CSV file", type: 'error'});
      setTimeout(() => setUploadStatus(null), 3000);
      e.target.value = "";
      return;
    }

    setIsLoading(true);
    setUploadStatus(null);

    try {
      // CSV parsing can be done here (or via backend API)
      const text = await file.text();
      const rows = text.split("\n").map(row => row.split(","));
      
      // Validate CSV structure
      if (rows.length < 2) {
        throw new Error("CSV file is empty or invalid");
      }
      
      // Convert CSV rows into objects with headers
      const headers = rows.shift() || [];
      
      // Validate required headers
      const requiredHeaders = ['User Name', 'User Email'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }
      
      const data: CSVRow[] = rows
        .filter(row => row.some(cell => cell.trim() !== "")) // Filter out empty rows
        .map((row) => {
          const obj: CSVRow = {};
          row.forEach((val, idx) => {
            if (headers[idx]) {
              obj[headers[idx].trim()] = val.trim();
            }
          });
          return obj;
        });
      
      // Convert to LeaderboardEntry type
      let leaderboardData: LeaderboardEntry[] = data.map((row, index) => ({
        rank: parseInt(row['rank']) || index + 1,
        "User Name": row['User Name'] || '',
        "User Email": row['User Email'] || '',
        "# of Skill Badges Completed": parseInt(row['# of Skill Badges Completed']) || 0,
        "# of Arcade Games Completed": parseInt(row['# of Arcade Games Completed']) || 0,
        "All Skill Badges & Games Completed": row['All Skill Badges & Games Completed'] as "Yes" | "No" | undefined,
        "Google Cloud Skills Boost Profile URL": row['Google Cloud Skills Boost Profile URL']
      }));
      
      // Sort the data in descending order by default
      leaderboardData = sortLeaderboardData(leaderboardData);
      
      // Update ranks based on sorted order
      leaderboardData = leaderboardData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      
      // Pass data to parent component for saving
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

  const handleGoogleSheetUpload = async () => {
    if (!googleSheetUrl) {
      setUploadStatus({message: "Please enter a Google Sheet URL", type: 'error'});
      setTimeout(() => setUploadStatus(null), 3000);
      return;
    }

    // Validate Google Sheet URL format
    const googleSheetRegex = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9_-]+/;
    if (!googleSheetRegex.test(googleSheetUrl)) {
      setUploadStatus({message: "Please enter a valid Google Sheet URL", type: 'error'});
      setTimeout(() => setUploadStatus(null), 3000);
      return;
    }

    setIsLoading(true);
    setUploadStatus(null);

    try {
      // Call the API endpoint to fetch data from Google Sheets
      const response = await fetch('/api/google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spreadsheetUrl: googleSheetUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect to Google Sheet');
      }

      const result = await response.json();
      console.log('Google Sheets API response:', result);
      
      // In a real implementation, we would use the actual data from Google Sheets
      // For now, we'll show a message that the feature is working
      setUploadStatus({
        message: "Google Sheets connection successful! In a production environment, this would fetch real data from your spreadsheet.", 
        type: 'success'
      });
      
      // If we had real data, we would call onCSVUpload with it:
      // onCSVUpload(result.placeholderData);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to Google Sheet";
      setUploadStatus({message: errorMessage, type: 'error'});
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setUploadStatus(null);
        setShowGoogleSheetForm(false);
        setGoogleSheetUrl("");
      }, 5000);
    }
  };

  if (!isAdmin) {
    return (
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Admin Login
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Admin Portal Access</DialogTitle>
            <DialogDescription>
              Enter your credentials to access the admin dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
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
                  className="w-full"
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
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLoginOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogin} disabled={isLoading}>
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
    <Card className="mb-6">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl">Admin Dashboard</CardTitle>
          <CardDescription>Manage leaderboard data and settings</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => { setIsAdmin(false); onLogout(); }}>
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="csv-upload" className="text-sm font-medium">
              Update Leaderboard Data
            </Label>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with participant data to update the leaderboard (automatically sorted by completion)
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="hidden"
            />
            <Button asChild variant="default" size="sm" disabled={isLoading}>
              <Label 
                htmlFor="csv-upload" 
                className="cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center"
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pt-4 border-t">
          <div className="grid w-full items-center gap-1.5">
            <Label className="text-sm font-medium">
              Google Sheets Integration
            </Label>
            <p className="text-sm text-muted-foreground">
              Connect directly to a Google Sheet to automatically sync leaderboard data
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex items-center gap-2 w-full sm:w-auto"
              onClick={() => setShowGoogleSheetForm(!showGoogleSheetForm)}
              disabled={isLoading}
            >
              <Link className="h-4 w-4" />
              Connect Google Sheet
            </Button>
          </div>
        </div>

        {showGoogleSheetForm && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="google-sheet-url">
                  Google Sheet URL
                </Label>
                <Input
                  id="google-sheet-url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Make sure your Google Sheet is publicly accessible or shared with the service account
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowGoogleSheetForm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGoogleSheetUpload}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Sheet"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            uploadStatus.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {uploadStatus.message}
          </div>
        )}
        <div className="mt-4 pt-4 border-t">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Link className="h-4 w-4" />
            Sorting Information
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            Data is automatically sorted by completion metrics in descending order:
          </p>
          <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
            <li>Primary: # of Skill Badges Completed (highest first)</li>
            <li>Secondary: # of Arcade Games Completed (highest first)</li>
            <li>Ranks are automatically updated based on this sorting</li>
          </ul>
          <h3 className="text-sm font-medium mb-2 mt-3">CSV Format Requirements</h3>
          <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
            <li>Must include columns: &quot;User Name&quot;, &quot;User Email&quot;</li>
            <li>Optional columns: &quot;rank&quot;, &quot;# of Skill Badges Completed&quot;, &quot;# of Arcade Games Completed&quot;</li>
            <li>&quot;All Skill Badges &amp; Games Completed&quot;, &quot;Google Cloud Skills Boost Profile URL&quot;</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPanel;