import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Package, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { useAllProfiles, useAllProducts } from "@/hooks/useData";

export default function AdminOverview() {
  const { data: profiles, isLoading: loadingProfiles } = useAllProfiles();
  const { data: products, isLoading: loadingProducts } = useAllProducts();

  const totalUsers = profiles?.length || 0;
  const activeUsers = profiles?.filter(p => p.is_active)?.length || 0;
  const totalProducts = products?.length || 0;
  const expiredProducts = products?.filter(p => new Date(p.expiry_date) < new Date())?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
          Platform Overview
        </h1>
        <p className="text-muted-foreground text-lg">
          Monitor your platform's high-level health and activity metrics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric Cards with Glassmorphism */}
        <Card className="relative overflow-hidden bg-background/60 backdrop-blur-md border-amber-900/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_40px_rgba(232,160,69,0.15)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={80} /></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-200/80">Total Users</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {loadingProfiles ? "..." : totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-400">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-background/60 backdrop-blur-md border-amber-900/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_40px_rgba(232,160,69,0.15)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={80} /></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-200/80">Active Accounts</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {loadingProfiles ? "..." : activeUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently verified and active
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-background/60 backdrop-blur-md border-amber-900/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_40px_rgba(232,160,69,0.15)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Package size={80} /></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-200/80">Global Listings</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {loadingProducts ? "..." : totalProducts}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-400">
              Active network listings
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-background/60 backdrop-blur-md border-red-900/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_40px_rgba(239,68,68,0.15)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500"><AlertTriangle size={80} /></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-400/80">Expired Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {loadingProducts ? "..." : expiredProducts}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-red-400/80">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Decorative Recent Activity Feed placeholder to make the page pop */}
      <Card className="bg-background/40 backdrop-blur-xl border-amber-900/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-amber-500" /> 
            Live Platform Activity
          </CardTitle>
          <CardDescription>Real-time feed of network events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "Just now", msg: "New shopkeeper 'Fresh Mart' registered in sector 4.", color: "bg-emerald-500/20 text-emerald-400" },
              { time: "2m ago", msg: "Global inventory increased by 450 items.", color: "bg-blue-500/20 text-blue-400" },
              { time: "15m ago", msg: "System auto-cleaned 12 expired products.", color: "bg-amber-500/20 text-amber-400" },
            ].map((feed, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-black/20 hover:bg-black/40 transition-colors border border-white/5">
                <div className={`px-3 py-1 text-xs font-semibold rounded-full ${feed.color}`}>
                  {feed.time}
                </div>
                <div className="text-sm text-muted-foreground">
                  {feed.msg}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
