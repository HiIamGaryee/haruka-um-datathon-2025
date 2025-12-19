import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import ExportPDFButton from "../components/ExportPDFButton";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ==========================================
// TYPES
// ==========================================
type ForecastPoint = {
  week_index: number;
  forecast_week_start: string;
  forecast_net_cash_flow: number;
};

type ForecastBundle = {
  model: string;
  mae: number | string;
  forecasts: {
    "1_month": ForecastPoint[];
    "3_months": ForecastPoint[];
    "1_year": ForecastPoint[];
  };
};

// ==========================================
// AZ THEME COLORS
// ==========================================
const AZ_MULBERRY = "#830051";
const AZ_NAVY = "#003865";
const AZ_LIME = "#C4D600";
const AZ_GRAPHITE = "#3F4444";
const AZ_RED = "#D6002A"; // Added for negative values

export default function ForecastPage() {
  const [bundle, setBundle] = useState<ForecastBundle | null>(null);

  useEffect(() => {
    fetch("/src/data/forecast_bundle.json")
      .then((r) => r.json())
      .then(setBundle);
  }, []);

  // ==========================================
  // DATA PREPARATION FOR NEW VIEWS
  // ==========================================
  const insights = useMemo(() => {
    if (!bundle) return null;

    const data = bundle.forecasts["1_year"]; // Use 1-year data for deep dive

    // 1. PIE CHART DATA: Total Positive vs Total Negative Volume
    let totalPositive = 0;
    let totalNegative = 0;
    let cumulative = 0;

    // 2. CUMULATIVE DATA: Add a 'running_total' field to the data
    const cumulativeData = data.map((point) => {
      if (point.forecast_net_cash_flow > 0) {
        totalPositive += point.forecast_net_cash_flow;
      } else {
        totalNegative += Math.abs(point.forecast_net_cash_flow);
      }
      cumulative += point.forecast_net_cash_flow;

      return {
        ...point,
        cumulative_total: cumulative,
      };
    });

    return {
      pieData: [
        { name: "Total Inflow", value: totalPositive, color: AZ_LIME },
        { name: "Total Outflow", value: totalNegative, color: AZ_MULBERRY },
      ],
      cumulativeData,
    };
  }, [bundle]);

  if (!bundle || !insights)
    return <div className="p-8">Loading Forecasts...</div>;

  return (
    <DashboardLayout>
      <div
        id="page-forecast"
        className="space-y-8 p-8 max-w-7xl mx-auto animate-in fade-in duration-500"
      >
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-border pb-6">
          <div>
            <h2 className="text-3xl font-bold text-secondary">
              Cash Flow Forecast
            </h2>
            <p className="text-muted-foreground mt-1">
              Model:{" "}
              <span className="font-medium text-foreground">
                {bundle.model}
              </span>{" "}
              · MAE:{" "}
              <span className="font-medium text-foreground">{bundle.mae}</span>
            </p>
          </div>
          <ExportPDFButton targetId="page-forecast" />
        </div>

        {/* ==========================================
            SECTION 1: THE MAIN FORECASTS (AREA CHARTS)
           ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1 MONTH - SHORT TERM */}
          <div className="kpi-card hover:shadow-md transition-shadow">
            <h3 className="mb-4 text-sm font-semibold text-secondary uppercase tracking-wider">
              1-Month Outlook
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bundle.forecasts["1_month"]}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={AZ_MULBERRY}
                        stopOpacity={0.3}
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
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast_net_cash_flow"
                    stroke={AZ_MULBERRY}
                    fill="url(#grad1)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3 MONTH - MID TERM */}
          <div className="kpi-card hover:shadow-md transition-shadow">
            <h3 className="mb-4 text-sm font-semibold text-secondary uppercase tracking-wider">
              3-Month Outlook
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bundle.forecasts["3_months"]}>
                  <defs>
                    <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={AZ_NAVY} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={AZ_NAVY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
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
                    dataKey="forecast_net_cash_flow"
                    stroke={AZ_NAVY}
                    fill="url(#grad2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 1 YEAR - LONG TERM */}
          <div className="kpi-card hover:shadow-md transition-shadow">
            <h3 className="mb-4 text-sm font-semibold text-secondary uppercase tracking-wider">
              1-Year Outlook
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bundle.forecasts["1_year"]}>
                  <defs>
                    <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={AZ_LIME} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={AZ_LIME} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
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
                    dataKey="forecast_net_cash_flow"
                    stroke={AZ_LIME}
                    fill="url(#grad3)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ==========================================
            SECTION 2: DEEP DIVE ANALYTICS (NEW!)
           ========================================== */}
        <h2 className="text-xl font-bold text-secondary pt-4 border-t border-border">
          Deep Dive Analysis (1-Year Model)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NEW CHART 1: PIE CHART (Volume Balance) */}
          <div className="kpi-card col-span-1">
            <h3 className="mb-2 text-lg font-semibold text-secondary">
              Cash Flow Volume Balance
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Total predicted inflow vs outflow magnitude
            </p>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={insights.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {insights.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-xs font-medium text-muted-foreground">
                  Ratio
                </span>
              </div>
            </div>
          </div>

          {/* NEW CHART 2: COMPOSED CHART (Cumulative Trend) */}
          <div className="kpi-card col-span-1 lg:col-span-2">
            <h3 className="mb-2 text-lg font-semibold text-secondary">
              Cumulative Cash Position
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Weekly Net Flow (Bars) vs Running Cash Balance (Line)
            </p>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={insights.cumulativeData}>
                  <CartesianGrid
                    stroke="#e5e7eb"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="forecast_week_start"
                    tick={{ fill: AZ_GRAPHITE, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: AZ_GRAPHITE, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: "Net Flow",
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 10,
                      fill: AZ_GRAPHITE,
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: AZ_MULBERRY, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: "Total Balance",
                      angle: 90,
                      position: "insideRight",
                      fontSize: 10,
                      fill: AZ_MULBERRY,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />

                  {/* The Bars: Weekly fluctuations */}
                  <Bar
                    yAxisId="left"
                    dataKey="forecast_net_cash_flow"
                    name="Weekly Flow"
                    fill={AZ_NAVY}
                    barSize={20}
                    radius={[4, 4, 0, 0]}
                  />

                  {/* The Line: The "Big Picture" trend */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulative_total"
                    name="Cumulative Balance"
                    stroke={AZ_MULBERRY}
                    strokeWidth={3}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
