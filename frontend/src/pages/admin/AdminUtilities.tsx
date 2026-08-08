import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Database } from "lucide-react";
import { toast } from "sonner";
import { db, collection, getDocs, query, where, updateDoc, doc } from "@/firebase-adapter";

export default function AdminUtilities() {
  const [running, setRunning] = useState(false);

  async function runBackfill() {
    setRunning(true);
    try {
      const profilesSnap = await getDocs(collection(db, "profiles"));
      let updatedCount = 0;

      for (const profileDoc of profilesSnap.docs) {
        const profile = profileDoc.data();
        if (!profile.pincode) continue;

        const productsQuery = query(
          collection(db, "products"),
          where("user_id", "==", profile.user_id)
        );
        const productsSnap = await getDocs(productsQuery);

        for (const productDoc of productsSnap.docs) {
          const product = productDoc.data();
          if (!product.shop_pincode) {
            await updateDoc(doc(db, "products", productDoc.id), {
              shop_pincode: profile.pincode,
              shop_name: profile.shop_name || null,
              owner_name: profile.owner_name || null,
              shop_address: profile.address || null,
              contact_phone: profile.phone || null,
            });
            updatedCount++;
          }
        }
      }

      toast.success(`Backfill completed. Updated ${updatedCount} products.`);
    } catch (err: any) {
      toast.error(err?.message || "Backfill failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-200 to-purple-500 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-3">
          <Settings className="h-10 w-10 text-purple-400" /> System Utilities
        </h1>
        <p className="text-muted-foreground text-lg">
          Advanced maintenance and backfill operations for the marketplace.
        </p>
      </div>

      <Card className="bg-background/40 backdrop-blur-xl border-purple-900/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-500" /> Marketplace Backfill
          </CardTitle>
          <CardDescription>
            Populate missing `shop_pincode` values on existing products from seller profiles. Use this after updating many profiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runBackfill} 
            disabled={running}
            className="bg-purple-600 hover:bg-purple-500 text-white border-none shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all"
          >
            {running ? 'Running Database Operation...' : 'Execute Backfill Routine'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
