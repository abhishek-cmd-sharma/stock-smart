import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded Admin ID and Password as requested by the user
    if (adminId === 'admin' && password === 'admin123') {
      toast.success('Admin access granted');
      // Save to localStorage so they don't have to log in on every refresh
      localStorage.setItem('admin_auth', 'true');
      onLoginSuccess();
    } else {
      toast.error('Invalid Admin ID or Password');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background/60 backdrop-blur-xl border-emerald-900/30 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-emerald-600 bg-clip-text text-transparent">
            Admin Portal
          </CardTitle>
          <CardDescription>
            Enter the master ID and password to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-100/70">Admin ID</label>
              <Input 
                type="text" 
                placeholder="Enter ID..." 
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="bg-black/40 border-white/10"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-100/70">Password</label>
              <Input 
                type="password" 
                placeholder="Enter Password..." 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/40 border-white/10"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white mt-4">
              Access Admin Panel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
