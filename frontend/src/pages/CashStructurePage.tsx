import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import ExportPDFButton from "../components/ExportPDFButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  AlertOctagon,
  Layers,
} from "lucide-react";

/* =========================
   TYPES (SAFE)
========================= */
type WeeklyMixRow = {
  week_start: string;
  inflow: number;
  outflow: number;
};

type DriverSummary = {
  inflow_transactions: number;
  outflow_transactions: number;
  dominant_direction: string;
  dominance_ratio: number;
  risk_level: string;
};

type RiskBundle = {
  driver_concentration?: {
    summary?: DriverSummary;
    weekly_mix?: WeeklyMixRow[];
  };
};

/* =========================
   AZ COLORS
========================= */
const AZ_MULBERRY = "#830051";
const AZ_LIME = "#C4D600";
const AZ_GRAPHITE = "#3F4444";

export default function CashStructurePage() {
  const [data, setData] = useState<RiskBundle | null>(null);

  useEffect(() => {
    fetch("/src/data/risk_analysis.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  /* =========================
     SAFE FALLBACKS
  ========================= */
  const summary: DriverSummary = {
    inflow_transactions:
      data?.driver_concentration?.summary?.inflow_transactions ?? 0,
    outflow_transactions:
      data?.driver_concentration?.summary?.outflow_transactions ?? 0,
    dominant_direction:
      data?.driver_concentration?.summary?.dominant_direction ?? "unknown",
    dominance_ratio: data?.driver_concentration?.summary?.dominance_ratio ?? 0,
    risk_level: data?.driver_concentration?.summary?.risk_level ?? "Unknown",
  };

  const weeklyMix: WeeklyMixRow[] =
    data?.driver_concentration?.weekly_mix ?? [];

  /* =========================
     NORMALIZED STRUCTURE
  ========================= */
  const normalizedData = useMemo(() => {
    return weeklyMix.map((row) => {
      const total = row.inflow + row.outflow || 1;
      return {
        ...row,
        inflow_pct: (row.inflow / total) * 100,
        outflow_pct: (row.outflow / total) * 100,
      };
    });
  }, [weeklyMix]);

  const transactionData = [
    {
      name: "Inflow Txns",
      value: summary.inflow_transactions,
      color: AZ_LIME,
    },
    {
      name: "Outflow Txns",
      value: summary.outflow_transactions,
      color: AZ_MULBERRY,
    },
  ];

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-8 text-muted-foreground">
          Loading cash structure analysis…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div
        id="page-cash-structure"
        className="space-y-10 p-8 max-w-7xl mx-auto"
      >
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-border pb-6">
          <div>
            <h2 className="text-3xl font-bold text-secondary">
              Cash Structure & Drivers
            </h2>
            <p className="text-muted-foreground mt-1">
              Structural dependency & transaction dominance
            </p>
          </div>
          <ExportPDFButton targetId="page-cash-structure" />
        </div>

        {/* KPI ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="kpi-card">
            <p className="section-title">Inflow Volume</p>
            <div className="flex items-center gap-3 mt-2">
              <ArrowDownLeft className="text-lime-600" />
              <span className="text-2xl font-bold">
                {summary.inflow_transactions}
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <p className="section-title">Outflow Volume</p>
            <div className="flex items-center gap-3 mt-2">
              <ArrowUpRight className="text-pink-600" />
              <span className="text-2xl font-bold">
                {summary.outflow_transactions}
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <p className="section-title">Dominance Ratio</p>
            <div className="flex items-center gap-3 mt-2">
              <Scale className="text-secondary" />
              <span className="text-2xl font-bold">
                {summary.dominance_ratio}x
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <p className="section-title">Structural Risk</p>
            <div className="flex items-center gap-3 mt-2">
              <AlertOctagon
                className={
                  summary.risk_level === "High"
                    ? "text-red-600"
                    : "text-emerald-600"
                }
              />
              <span className="text-2xl font-bold">{summary.risk_level}</span>
            </div>
          </div>
        </div>

        {/* ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="kpi-card lg:col-span-2">
            <h3 className="font-bold mb-4">Weekly Cash Flow Composition</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyMix}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week_start" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="inflow" stackId="a" fill={AZ_LIME} />
                <Bar dataKey="outflow" stackId="a" fill={AZ_MULBERRY} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="kpi-card">
            <h3 className="font-bold mb-4">Transaction Split</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={90}
                >
                  {transactionData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="kpi-card">
          <h3 className="font-bold mb-4">Structural Dependency Trend (100%)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={normalizedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week_start" />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <Area dataKey="outflow_pct" stackId="1" fill={AZ_MULBERRY} />
              <Area dataKey="inflow_pct" stackId="1" fill={AZ_LIME} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
