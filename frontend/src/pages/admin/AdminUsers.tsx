import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Shield, User, Store } from "lucide-react";
import { toast } from "sonner";
import { useAllProfiles, useUpdateProfileRole, useDeleteProfile } from "@/hooks/useData";

export default function AdminUsers() {
  const { data: profiles, isLoading } = useAllProfiles();
  const updateRoleMutation = useUpdateProfileRole();
  const deleteProfileMutation = useDeleteProfile();

  const handleRoleChange = (id: string, newRole: string) => {
    updateRoleMutation.mutate({ id, role: newRole }, {
      onSuccess: () => toast.success("Role updated successfully"),
      onError: () => toast.error("Failed to update role")
    });
  };

  const handleDeleteProfile = (id: string) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteProfileMutation.mutate(id, {
        onSuccess: () => toast.success("Profile deleted"),
        onError: () => toast.error("Failed to delete profile")
      });
    }
  };

  const getRoleIcon = (role: string | null) => {
    if (role === 'admin') return <Shield className="w-4 h-4 text-emerald-500" />;
    if (role === 'customer') return <User className="w-4 h-4 text-blue-500" />;
    return <Store className="w-4 h-4 text-amber-500" />; // Shopkeeper is default
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-200 to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">
          User Management
        </h1>
        <p className="text-muted-foreground text-lg">
          View, moderate, and manage all registered profiles on the platform.
        </p>
      </div>

      <Card className="bg-background/40 backdrop-blur-xl border-emerald-900/20 shadow-2xl">
        <CardHeader>
          <CardTitle>Platform Users</CardTitle>
          <CardDescription>All user accounts currently registered in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
              <Table>
                <TableHeader className="bg-black/40">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="font-semibold text-emerald-100/70">Name / Shop</TableHead>
                    <TableHead className="font-semibold text-emerald-100/70">Contact Info</TableHead>
                    <TableHead className="font-semibold text-emerald-100/70">Role</TableHead>
                    <TableHead className="font-semibold text-emerald-100/70">Status</TableHead>
                    <TableHead className="text-right font-semibold text-emerald-100/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles?.map((profile) => (
                    <TableRow key={profile.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="py-4">
                        <div className="font-medium text-emerald-50">{profile.shop_name || profile.owner_name || 'Anonymous'}</div>
                        <div className="text-xs text-muted-foreground font-mono">{profile.user_id.slice(0, 8)}...</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground/90">{profile.email || 'No email provided'}</div>
                        <div className="text-xs text-muted-foreground">{profile.phone || 'No phone'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(profile.role)}
                          <Select 
                            defaultValue={profile.role || 'shopkeeper'} 
                            onValueChange={(val) => handleRoleChange(profile.id, val)}
                          >
                            <SelectTrigger className="w-[130px] h-8 bg-black/40 border-white/10 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="shopkeeper">Shopkeeper</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={profile.is_active ? "default" : "secondary"} 
                               className={profile.is_active ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"}>
                          {profile.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteProfile(profile.id)} 
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-950/50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
