import { Bell, AlertTriangle, Package, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useProducts, useNotifications, useDismissNotification } from "@/hooks/useData";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function NotificationsPanel() {
  const { data: products = [] } = useProducts();
  const { data: dbNotifications = [] } = useNotifications();
  const { mutate: dismissNotification } = useDismissNotification();

  const nearExpiry = products.filter((p: any) => {
    if (!p.expiry_date) return false;
    const d = new Date(p.expiry_date);
    const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff <= 7 && diff >= 0;
  });

  const lowStock = products.filter((p: any) => p.quantity > 0 && p.quantity <= 10);

  const count = nearExpiry.length + lowStock.length + dbNotifications.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <Badge className="absolute -top-1 -right-1 text-[10px]">{count}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[360px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Notifications
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          
          {/* Database Notifications (Alerts/Expiry) */}
          {dbNotifications.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Alerts</h4>
              <ul className="mt-2 space-y-2">
                {dbNotifications.map((notif: any) => (
                  <li key={notif.id} className="flex items-start gap-3 bg-red-50/50 p-3 rounded-md border border-red-100">
                    <div className="text-red-500 mt-0.5 shrink-0">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-red-900">{notif.title}</div>
                      <div className="text-xs text-red-700 mt-0.5">{notif.message}</div>
                      {notif.created_at && (
                        <div className="text-[10px] text-red-500 mt-1">
                          {format(new Date(notif.created_at.toDate ? notif.created_at.toDate() : notif.created_at), 'dd MMM yyyy, p')}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-100 -mr-1 shrink-0" 
                      onClick={() => dismissNotification(notif.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Near Expiry */}
          <div>
            <h4 className="text-sm font-medium">Near expiry</h4>
            {nearExpiry.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">No products near expiry.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {nearExpiry.map((p: any) => (
                  <li key={p.id} className="flex items-start gap-3 p-2 bg-amber-50/30 rounded-md">
                    <div className="p-2 bg-amber-100 rounded-md text-amber-600 shrink-0">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-muted-foreground">Expires: {format(new Date(p.expiry_date), 'dd MMM yyyy')}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Low Stock */}
          <div>
            <h4 className="text-sm font-medium">Low stock</h4>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">All stocks healthy.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {lowStock.map((p: any) => (
                  <li key={p.id} className="flex items-start gap-3 p-2 bg-blue-50/30 rounded-md">
                    <div className="p-2 bg-blue-100 rounded-md text-blue-600 shrink-0">
                      <Info className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{p.name} <span className="font-normal text-muted-foreground">— {p.quantity} left</span></div>
                      <div className="text-xs text-muted-foreground">Category: {p.category}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default NotificationsPanel;
