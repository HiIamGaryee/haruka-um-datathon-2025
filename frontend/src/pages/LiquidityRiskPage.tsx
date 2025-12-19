import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import ExportPDFButton from "../components/ExportPDFButton";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
  Legend,
  ReferenceLine,
} from "recharts";
import { ShieldCheck, AlertTriangle, Zap, Activity } from "lucide-react";

/* =========================
   TYPES
========================= */
type VolatilityRow = {
  week_start: string;
  net_cash_flow: number;
  volatility: number;
  shock: number;
};

type StressRow = {
  week_start: string;
  net_cash_flow: number;
  stress_score: number;
};

type StabilityRow = {
  week_start: string;
  stability_index: number;
  risk_band: "low" | "medium" | "high";
};

type RiskBundle = {
  volatility_risk?: VolatilityRow[];
  liquidity_stress?: StressRow[];
  cash_stability_index?: StabilityRow[];
};

/* =========================
   AZ COLORS
========================= */
const AZ_MULBERRY = "#830051";
const AZ_NAVY = "#003865";
const AZ_LIME = "#C4D600";
const AZ_GRAPHITE = "#3F4444";
const AZ_RED = "#D6002A";
const AZ_ORANGE = "#F0AB00";
const AZ_GREEN = "#6AB42D";

export default function LiquidityRiskPage() {
  const [data, setData] = useState<RiskBundle | null>(null);

  useEffect(() => {
    fetch("/src/data/risk_analysis.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  /* =========================
     SAFE FALLBACK ARRAYS
  ========================= */
  const volatilityRisk = data?.volatility_risk ?? [];
  const liquidityStress = data?.liquidity_stress ?? [];
  const stabilityIndex = data?.cash_stability_index ?? [];

  /* =========================
     PIE DATA (SAFE)
  ========================= */
  const riskDistribution = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 };

    stabilityIndex.forEach((r) => {
      counts[r.risk_band]++;
    });

    return [
      { name: "Low Risk", value: counts.low, color: AZ_GREEN },
      { name: "Medium Risk", value: counts.medium, color: AZ_ORANGE },
      { name: "High Risk", value: counts.high, color: AZ_RED },
    ];
  }, [stabilityIndex]);

  /* =========================
     COMPOSITE DATA (SAFE MERGE)
  ========================= */
  const compositeStressData = useMemo(() => {
    return liquidityStress.map((stress, i) => ({
      ...stress,
      volatility: volatilityRisk[i]?.volatility ?? 0,
      shock: volatilityRisk[i]?.shock ?? 0,
    }));
  }, [liquidityStress, volatilityRisk]);

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-8 text-muted-foreground">
          Loading liquidity risk analysis…
        </div>
      </DashboardLayout>
    );
  }

  const shockCount = volatilityRisk.filter((v) => v.shock === 1).length;

  const avgStability =
    stabilityIndex.length === 0
      ? 0
      : stabilityIndex.reduce((s, r) => s + r.stability_index, 0) /
        stabilityIndex.length;

  return (
    <DashboardLayout>
      <div id="page-liquidity-risk" className="space-y-8 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-border pb-6">
          <div>
            <h2 className="text-3xl font-bold text-secondary">
              Liquidity Risk Intelligence
            </h2>
            <p className="text-muted-foreground mt-1">
              Volatility, stress, and stability signals
            </p>
          </div>
          <ExportPDFButton targetId="page-liquidity-risk" />
        </div>

        {/* KPI ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="kpi-card">
            <p className="section-title">Volatility Shocks</p>
            <div className="flex items-center gap-3 mt-2">
              <Zap className="text-red-600" />
              <span className="text-3xl font-bold">{shockCount}</span>
            </div>
          </div>

          <div className="kpi-card">
            <p className="section-title">Avg Stability Index</p>
            <div className="flex items-center gap-3 mt-2">
              <ShieldCheck className="text-lime-600" />
              <span className="text-3xl font-bold">
                {avgStability.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="kpi-card">
            <p className="section-title">Dominant Risk</p>
            <div className="flex items-center gap-3 mt-2">
              <Activity className="text-secondary" />
              <span className="text-3xl font-bold">
                {riskDistribution.sort((a, b) => b.value - a.value)[0]?.name ??
                  "—"}
              </span>
            </div>
          </div>
        </div>

        {/* PIE + COMBO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="kpi-card">
            <h3 className="font-bold mb-4">Risk Band Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={80}
                >
                  {riskDistribution.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="kpi-card lg:col-span-2">
            <h3 className="font-bold mb-4">Stress vs Net Cash Flow</h3>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={compositeStressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week_start" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="right"
                  dataKey="net_cash_flow"
                  fill={AZ_NAVY}
                  opacity={0.3}
                />
                <Area
                  yAxisId="left"
                  dataKey="stress_score"
                  stroke={AZ_RED}
                  fill={AZ_RED}
                  fillOpacity={0.15}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STABILITY TREND */}
        <div className="kpi-card">
          <h3 className="font-bold mb-4">Cash Stability Index</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stabilityIndex}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week_start" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <ReferenceLine y={0.5} stroke={AZ_RED} strokeDasharray="3 3" />
              <Area
                dataKey="stability_index"
                stroke={AZ_LIME}
                fill={AZ_LIME}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
