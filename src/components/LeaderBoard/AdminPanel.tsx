"use client";

import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Props {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onCSVUpload: (data: any[]) => void;
  onLogout: () => void;
}

const AdminPanel: React.FC<Props> = ({ isAdmin, setIsAdmin, onCSVUpload, onLogout }) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    const validUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (username === validUsername && password === validPassword) {
      setIsAdmin(true);
      setLoginOpen(false);
      setUsername("");
      setPassword("");
    } else {
      alert("Invalid username or password");
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      // CSV parsing can be done here (or via backend API)
      const text = await file.text();
      const rows = text.split("\n").map(row => row.split(","));
      // Convert CSV rows into objects with headers
      const headers = rows.shift() || [];
      const data = rows.map(row => Object.fromEntries(row.map((val, idx) => [headers[idx], val])));
      onCSVUpload(data);
      alert("CSV uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload CSV");
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  if (!isAdmin) {
    return (
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={() => setLoginOpen(true)}>
            Login
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button onClick={handleLogin}>Login</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Admin Controls</CardTitle>
          <CardDescription>Upload new leaderboard CSV data.</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="grid w-full items-center gap-1.5 flex-grow">
            <Label htmlFor="csv-upload" className="sr-only">Upload CSV</Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="hidden"
            />
            <Button asChild variant="default" size="sm" className="gap-1" disabled={isLoading}>
              <Label htmlFor="csv-upload" className="cursor-pointer w-full text-center">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span className="ml-1">{isLoading ? "Processing..." : "Upload CSV"}</span>
              </Label>
            </Button>
          </div>
          <Button variant="outline" size="sm" className="ml-2 flex items-center" onClick={() => { setIsAdmin(false); onLogout(); }}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

export default AdminPanel;
