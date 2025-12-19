import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import ExportPDFButton from "../components/ExportPDFButton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

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

export default function ForecastPage() {
  const [bundle, setBundle] = useState<ForecastBundle | null>(null);

  useEffect(() => {
    fetch("/src/data/forecast_bundle.json")
      .then((r) => r.json())
      .then(setBundle);
  }, []);

  if (!bundle) return null;

  return (
    <DashboardLayout>
      <div id="page-forecast" className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Cash Flow Forecast</h2>
            <p className="text-sm text-slate-500">
              Model: {bundle.model} · MAE: {bundle.mae}
            </p>
          </div>
          <ExportPDFButton targetId="page-forecast" />
        </div>

        {/* 1 MONTH */}
        <div className="kpi-card">
          <h3 className="mb-4 text-sm font-medium">1-Month Forecast</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={bundle.forecasts["1_month"]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="forecast_week_start" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="forecast_net_cash_flow"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3 MONTH */}
        <div className="kpi-card">
          <h3 className="mb-4 text-sm font-medium">3-Month Forecast</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={bundle.forecasts["3_months"]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="forecast_week_start" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="forecast_net_cash_flow"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 1 YEAR */}
        <div className="kpi-card">
          <h3 className="mb-4 text-sm font-medium">1-Year Forecast</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={bundle.forecasts["1_year"]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="forecast_week_start" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="forecast_net_cash_flow"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
