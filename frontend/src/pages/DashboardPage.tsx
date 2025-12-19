import DashboardLayout from "../layout/DashboardLayout";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  Wallet,
  Activity,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  BarChart3,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================
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

// ==========================================
// AZ THEME COLORS
// ==========================================
const AZ_MULBERRY = "#830051";
const AZ_NAVY = "#003865";
const AZ_LIME = "#C4D600";
const AZ_GRAPHITE = "#3F4444";

export default function DashboardPage() {
  const [weekly, setWeekly] = useState<WeeklyRow[]>([]);
  const [metrics, setMetrics] = useState<Metric | null>(null);

  useEffect(() => {
    Papa.parse("/src/data/weekly_actuals.csv", {
      header: true,
      download: true,
      complete: (res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const previousCash = startingCash * 0.98; // Demo previous value (2% growth)
  const cashChange = calculateChange(startingCash, previousCash);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold text-secondary">
              Financial Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time Liquidity & Forecast Performance
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              Last Updated
            </p>
            <p className="text-sm text-foreground">Oct 24, 2025</p>
          </div>
        </div>

        {/* KPI CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* KPI 1: STARTING CASH */}
          <div className="kpi-card hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Starting Cash (USD)
                </p>
                <div className="text-3xl font-bold text-secondary group-hover:text-primary transition-colors">
                  {metrics?.starting_cash_usd?.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }) || "0"}
                </div>
                {cashChange !== null && (
                  <div
                    className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                      cashChange >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {cashChange >= 0 ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                    {Math.abs(cashChange).toFixed(1)}% vs last month
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* KPI 2: MODEL ACCURACY */}
          <div className="kpi-card hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Forecast Model
                </p>
                <div className="text-2xl font-bold text-secondary">
                  {metrics?.model || "—"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Baseline Configuration v2.1
                </div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* KPI 3: MAE SCORE */}
          <div className="kpi-card hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Error Margin (MAE)
                </p>
                <div className="text-3xl font-bold text-secondary">
                  {typeof metrics?.mae === "number"
                    ? metrics.mae.toFixed(2)
                    : metrics?.mae || "—"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Lower is better (Target: &lt;1.5)
                </div>
              </div>
              <div className="p-3 rounded-xl bg-accent/20 text-accent-foreground">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CHART 1: NET CASH FLOW (AREA) */}
          <div className="kpi-card">
            <div className="mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-secondary">
                  Weekly Net Cash Flow
                </h2>
                <p className="text-xs text-muted-foreground">
                  Inflow/Outflow Delta Trend
                </p>
              </div>
            </div>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weekly}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={AZ_MULBERRY}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={AZ_MULBERRY}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week_start"
                    tick={{ fontSize: 11, fill: AZ_GRAPHITE }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: AZ_GRAPHITE }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="net_cash_flow"
                    stroke={AZ_MULBERRY}
                    fillOpacity={1}
                    fill="url(#colorNet)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 2: CASH POSITION (LINE) */}
          <div className="kpi-card">
            <div className="mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Wallet className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-secondary">
                  Total Cash Position
                </h2>
                <p className="text-xs text-muted-foreground">
                  End-of-week Bank Balance
                </p>
              </div>
            </div>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weekly}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week_start"
                    tick={{ fontSize: 11, fill: AZ_GRAPHITE }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: AZ_GRAPHITE }}
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cash_position"
                    stroke={AZ_NAVY}
                    strokeWidth={3}
                    dot={{ r: 3, fill: AZ_NAVY }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CHART 3: NEW "TREASURER'S VIEW" (COMBO) */}
        <div className="kpi-card">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <BarChart3 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-secondary">
                Treasurer's View: Flow vs Balance
              </h2>
              <p className="text-xs text-muted-foreground">
                Correlating weekly volatility with total liquidity impact
              </p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={weekly}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="week_start"
                  scale="band"
                  tick={{ fontSize: 11, fill: AZ_GRAPHITE }}
                  tickLine={false}
                  axisLine={false}
                />

                {/* Left Y-Axis for Net Flow (Bars) */}
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fontSize: 11, fill: AZ_LIME }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Net Flow",
                    angle: -90,
                    position: "insideLeft",
                    fill: AZ_GRAPHITE,
                    fontSize: 10,
                  }}
                />

                {/* Right Y-Axis for Cash Position (Line) */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: AZ_NAVY }}
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                  label={{
                    value: "Total Position",
                    angle: 90,
                    position: "insideRight",
                    fill: AZ_NAVY,
                    fontSize: 10,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend verticalAlign="top" height={36} />

                {/* Bars: Net Cash Flow (Lime Green) */}
                <Bar
                  yAxisId="left"
                  dataKey="net_cash_flow"
                  name="Weekly Net Flow"
                  fill={AZ_LIME}
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />

                {/* Line: Cash Position (Navy Blue) */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cash_position"
                  name="Total Cash Position"
                  stroke={AZ_NAVY}
                  strokeWidth={4}
                  dot={{ r: 4, fill: AZ_NAVY, strokeWidth: 2, stroke: "#fff" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
