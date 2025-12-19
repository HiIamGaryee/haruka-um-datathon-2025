import DashboardLayout from "../layout/DashboardLayout";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Wallet, Activity, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

type WeeklyRow = {
  week_start: string;
  net_cash_flow: number;
  cash_position: number;
};

type Metric = {
  starting_cash_usd: number;
  model: string;
  mae: number | string;
};

export default function DashboardPage() {
  const [weekly, setWeekly] = useState<WeeklyRow[]>([]);
  const [metrics, setMetrics] = useState<Metric | null>(null);

  useEffect(() => {
    Papa.parse("/src/data/weekly_actuals.csv", {
      header: true,
      download: true,
      complete: (res) => {
        const data = res.data.map((r: any) => ({
          week_start: r.week_start,
          net_cash_flow: Number(r.net_cash_flow),
          cash_position: Number(r.cash_position),
        }));
        setWeekly(data);
      },
    });

    fetch("/src/data/metrics.json")
      .then((r) => r.json())
      .then(setMetrics);
  }, []);

  // Calculate percentage change for demo purposes
  const calculateChange = (current: number, previous: number) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const startingCash = metrics?.starting_cash_usd || 0;
  const previousCash = startingCash * 0.97; // Demo previous value
  const cashChange = calculateChange(startingCash, previousCash);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Weekly Forecast & Liquidity View
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="kpi-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <span className="section-title">STARTING CASH (USD)</span>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold text-foreground">
                    {metrics?.starting_cash_usd?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || "0.00"}
                  </div>
                  {cashChange !== null && (
                    <div
                      className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                        cashChange >= 0 ? "text-positive" : "text-negative"
                      }`}
                    >
                      {cashChange >= 0 ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      {Math.abs(cashChange).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Activity className="h-4 w-4 text-secondary" />
                  </div>
                  <span className="section-title">FORECAST MODEL</span>
                </div>
                <div className="mt-3">
                  <div className="text-lg font-semibold text-foreground">
                    {metrics?.model || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Baseline Model
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                  <span className="section-title">MAE</span>
                </div>
                <div className="mt-3">
                  <div className="text-lg font-semibold text-foreground">
                    {typeof metrics?.mae === "number"
                      ? metrics.mae.toFixed(2)
                      : metrics?.mae || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Mean Absolute Error
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="chart-card">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Weekly Net Cash Flow
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Net cash flow over time
                  </p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={weekly}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="week_start"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="net_cash_flow"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Wallet className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Cash Position Over Time
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Total cash position tracking
                  </p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={weekly}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="week_start"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cash_position"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "hsl(var(--secondary))" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
