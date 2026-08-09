import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useSales, useProducts } from "@/hooks/useData";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Calendar,
  BarChart3,
  PackageMinus,
  Crown,
  Lightbulb,
  Zap,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Analytics() {
  const { data: sales = [], isLoading: loadingSales } = useSales();
  const { data: products = [], isLoading: loadingProducts } = useProducts();

  if (loadingSales || loadingProducts) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 w-full">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-muted rounded-xl skeleton-shimmer"></div>
            <div className="h-4 w-64 bg-muted rounded-md skeleton-shimmer"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded-xl skeleton-shimmer"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="h-[350px] bg-muted rounded-xl skeleton-shimmer"></div>
          <div className="h-[350px] bg-muted rounded-xl skeleton-shimmer"></div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

  // Revenue Metrics
  let totalRevenue = 0;
  let dailyRevenue = 0;
  let weeklyRevenue = 0;
  let monthlyRevenue = 0;

  sales.forEach((sale) => {
    const saleDate = new Date(sale.created_at);
    const total = Number(sale.total);
    totalRevenue += total;
    if (saleDate >= startOfToday) dailyRevenue += total;
    if (saleDate >= startOfWeek) weeklyRevenue += total;
    if (saleDate >= startOfMonth) monthlyRevenue += total;
  });

  // Product Sales Aggregation
  const productSalesMap: Record<string, { qty: number; revenue: number }> = {};

  // Initialize with all current products explicitly so we catch slow/0-selling products
  products.forEach((p) => {
    productSalesMap[p.name] = { qty: 0, revenue: 0 };
  });

  sales.forEach((sale) => {
    if (!productSalesMap[sale.product_name]) {
      productSalesMap[sale.product_name] = { qty: 0, revenue: 0 };
    }
    productSalesMap[sale.product_name].qty += sale.quantity;
    productSalesMap[sale.product_name].revenue += Number(sale.total);
  });

  const productStats = Object.keys(productSalesMap)
    .map((name) => ({
      name,
      qty: productSalesMap[name].qty,
      revenue: productSalesMap[name].revenue,
    }))
    .sort((a, b) => b.qty - a.qty);

  const topSelling = productStats.slice(0, 5);
  const slowSelling = [...productStats].reverse().slice(0, 5);

  // Chart 1: Last 7 Days Sales Trend
  const last7DaysMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    last7DaysMap[dateString] = 0;
  }

  sales.forEach((sale) => {
    const d = new Date(sale.created_at);
    if (d >= startOfWeek) {
      const dateString = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      if (last7DaysMap[dateString] !== undefined) {
        last7DaysMap[dateString] += Number(sale.total);
      }
    }
  });

  const trendData = Object.keys(last7DaysMap).map((date) => ({
    date,
    sales: last7DaysMap[date],
  }));

  // Chart 2: Top Categories
  const categorySalesMap: Record<string, number> = {};
  sales.forEach((sale) => {
    // Find category from products
    const p = products.find((prod) => prod.name === sale.product_name);
    const cat = p ? p.category : "Other";
    categorySalesMap[cat] = (categorySalesMap[cat] || 0) + Number(sale.total);
  });

  const categoryData = Object.keys(categorySalesMap).map((cat) => ({
    category: cat,
    value: categorySalesMap[cat],
  }));

  // Smart Recommendations Engine
  const productStockMap: Record<string, number> = {};
  products.forEach((p) => {
    productStockMap[p.name] = (productStockMap[p.name] || 0) + p.quantity;
  });

  const productSalesLife: Record<string, { qtySold: number; minDate: number; maxDate: number }> =
    {};
  sales.forEach((sale) => {
    const time = new Date(sale.created_at).getTime();
    if (!productSalesLife[sale.product_name]) {
      productSalesLife[sale.product_name] = { qtySold: 0, minDate: time, maxDate: time };
    }
    productSalesLife[sale.product_name].qtySold += sale.quantity;
    if (time < productSalesLife[sale.product_name].minDate)
      productSalesLife[sale.product_name].minDate = time;
    if (time > productSalesLife[sale.product_name].maxDate)
      productSalesLife[sale.product_name].maxDate = time;
  });

  const nowTime = now.getTime();
  const recommendations = Object.keys(productStockMap)
    .map((name) => {
      const stock = productStockMap[name];
      const sData = productSalesLife[name];

      let avgDaily = 0;
      let desc = "";
      let daysUntilEmpty = Number.POSITIVE_INFINITY;
      let type = "normal";

      if (!sData || sData.qtySold === 0) {
        desc = `${name} is selling slowly (no recorded sales). Avoid purchasing large quantities.`;
        type = "slow";
      } else {
        // Calculate days active minimum 1 to avoid division by zero
        const daysActive = Math.max(1, (nowTime - sData.minDate) / (1000 * 60 * 60 * 24));
        avgDaily = sData.qtySold / daysActive;
        daysUntilEmpty = avgDaily > 0 ? stock / avgDaily : Number.POSITIVE_INFINITY;

        if (avgDaily >= 1 || (daysUntilEmpty <= 14 && stock > 0)) {
          desc = `${name} sells quickly. Consider purchasing more stock.`;
          type = "fast";
        } else if (daysUntilEmpty > 60 || avgDaily <= 0.2) {
          desc = `${name} is selling slowly. Avoid purchasing large quantities.`;
          type = "slow";
        } else {
          desc = `${name} has steady sales. Current stock will last about ${Math.round(daysUntilEmpty)} days.`;
          type = "normal";
        }
      }

      return { name, stock, avgDaily, daysUntilEmpty, desc, type };
    })
    .sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty);

  const COLORS = [
    "hsl(162, 63%, 34%)",
    "hsl(38, 92%, 55%)",
    "hsl(200, 60%, 50%)",
    "hsl(280, 50%, 55%)",
    "hsl(0, 72%, 51%)",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: "blur(5px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(5px)" }}
      transition={{ duration: 0.4 }}
    >
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Sales Analytics
          </h1>
          <p className="page-subtitle">Visualize your business performance and trends</p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl shadow-soft dark:shadow-soft-dark p-5 flex flex-col justify-between border-b-4 border-b-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Today's Sales</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display">₹{dailyRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-soft dark:shadow-soft-dark p-5 flex flex-col justify-between border-b-4 border-b-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Weekly Sales (7d)</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display">₹{weeklyRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-soft dark:shadow-soft-dark p-5 flex flex-col justify-between border-b-4 border-b-warning">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Monthly Sales (30d)</span>
            <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-warning" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display text-foreground">
            ₹{monthlyRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-soft dark:shadow-soft-dark p-5 flex flex-col justify-between border-b-4 border-b-success">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </div>
          <p className="text-3xl font-bold font-display text-success">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trend Chart */}
        {/* Trend Chart */}
        <div className="col-span-1 bg-card border border-border rounded-xl shadow-soft dark:shadow-soft-dark overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h2 className="text-[17px] font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              7-Day Revenue Trend
            </h2>
          </div>
          <div className="p-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(val) => `₹${val}`}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Chart */}
        {/* Category Chart */}
        <div className="col-span-1 bg-card border border-border rounded-xl shadow-soft dark:shadow-soft-dark overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h2 className="text-[17px] font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Revenue By Category
            </h2>
          </div>
          <div className="p-6">
            {categoryData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No data yet
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="category"
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--card))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  {categoryData.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {entry.category}: ₹{entry.value.toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top and Slow Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling */}
        {/* Top Selling */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-xl shadow-soft dark:shadow-soft-dark overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border bg-success/10">
            <h2 className="text-[17px] font-semibold flex items-center gap-2">
              <Crown className="h-5 w-5 text-success" />
              Top Selling Products
            </h2>
          </div>
          <div>
            <div className="divide-y divide-border">
              {topSelling.length === 0 || topSelling[0].qty === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No sales recorded yet.
                </p>
              ) : (
                topSelling
                  .filter((p) => p.qty > 0)
                  .map((product, idx) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-success/15 text-success font-bold text-xs ring-1 ring-success/20">
                          #{idx + 1}
                        </div>
                        <p className="font-medium text-sm text-foreground">{product.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{product.qty} sold</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{product.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
          </motion.div>

        {/* Slow Selling */}
        {/* Slow Selling */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-xl shadow-soft dark:shadow-soft-dark overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border bg-destructive/10">
            <h2 className="text-[17px] font-semibold flex items-center gap-2">
              <PackageMinus className="h-5 w-5 text-destructive" />
              Slow / Zero Selling Products
            </h2>
          </div>
          <div>
            <div className="divide-y divide-border">
              {slowSelling.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Add products to track performance.
                </p>
              ) : (
                slowSelling.map((product, idx) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-destructive/15 text-destructive font-bold text-xs ring-1 ring-destructive/20">
                        <TrendingDown className="h-4 w-4" />
                      </div>
                      <p className="font-medium text-sm text-foreground">{product.name}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${product.qty === 0 ? "text-destructive" : "text-foreground"}`}
                        >
                          {product.qty} sold
                        </p>
                        {product.revenue > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ₹{product.revenue.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Smart Recommendations */}
      {/* Smart Recommendations */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
        className="bg-card border border-border rounded-xl shadow-soft dark:shadow-soft-dark overflow-hidden mt-6 mb-8"
      >
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h2 className="text-[17px] font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Smart Inventory Recommendations
          </h2>
        </div>
        <div>
          <div className="divide-y divide-border">
            {recommendations.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Add products and log sales to see AI recommendations.
              </p>
            ) : (
              recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {rec.type === "fast" && <Zap className="h-4 w-4 text-warning" />}
                      {rec.type === "slow" && <Clock className="h-4 w-4 text-primary" />}
                      {rec.type === "normal" && <Activity className="h-4 w-4 text-success" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{rec.desc}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="font-semibold text-foreground">Stock: {rec.stock}</span>
                        <span>Avg. daily: {rec.avgDaily.toFixed(1)}/day</span>
                        <span>
                          {rec.daysUntilEmpty === Number.POSITIVE_INFINITY
                            ? "Est. Depletion: N/A"
                            : `Est. Depletion: ~${Math.round(rec.daysUntilEmpty)} days`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
