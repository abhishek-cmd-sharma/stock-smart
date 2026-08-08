import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, BarChart3, TrendingUp, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { useAllProducts, useAdminDeleteProduct } from "@/hooks/useData";

export default function AdminInventory() {
  const { data: products, isLoading } = useAllProducts();
  const deleteProductMutation = useAdminDeleteProduct();

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product listing?")) {
      deleteProductMutation.mutate(id, {
        onSuccess: () => toast.success("Product deleted"),
        onError: () => toast.error("Failed to delete product")
      });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-200 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
          Platform Analytics & Inventory
        </h1>
        <p className="text-muted-foreground text-lg">
          Moderate global product listings and analyze marketplace trends.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-background/40 backdrop-blur-md border-blue-900/30 hover:border-blue-700/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-200"><TrendingUp className="w-5 h-5 text-blue-500" /> Category Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-4 opacity-50">
              <BarChart3 className="w-12 h-12" />
              <p>Visual charts will be rendered here.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/40 backdrop-blur-md border-purple-900/30 hover:border-purple-700/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-200"><PackageSearch className="w-5 h-5 text-purple-500" /> Regional Listings</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-4 opacity-50">
              <BarChart3 className="w-12 h-12" />
              <p>Map visualizations will be rendered here.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-background/40 backdrop-blur-xl border-blue-900/20 shadow-2xl">
        <CardHeader>
          <CardTitle>Global Inventory List</CardTitle>
          <CardDescription>All products currently indexed on the marketplace.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
              <Table>
                <TableHeader className="bg-black/40">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="font-semibold text-blue-100/70">Product</TableHead>
                    <TableHead className="font-semibold text-blue-100/70">Shop Info</TableHead>
                    <TableHead className="font-semibold text-blue-100/70">Pricing & Qty</TableHead>
                    <TableHead className="text-right font-semibold text-blue-100/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="py-4">
                        <div className="font-medium text-blue-50">{product.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{product.category}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground/90">{product.shop_name || 'Unknown Shop'}</div>
                        <div className="text-xs text-muted-foreground">PIN: {product.shop_pincode || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-emerald-400 font-bold">₹{product.price}</div>
                        <div className="text-xs text-muted-foreground">Available: {product.quantity} units</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteProduct(product.id)} 
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
