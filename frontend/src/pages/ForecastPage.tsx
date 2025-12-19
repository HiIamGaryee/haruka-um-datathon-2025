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
} from "recharts";
import ExportPDFButton from "../components/ExportPDFButton";

type Row = { week: string; forecast_net_cash_flow: number };

export default function ForecastPage() {
  const [data, setData] = useState<Row[]>([]);

  useEffect(() => {
    Papa.parse("/src/data/forecast_1m.csv", {
      header: true,
      download: true,
      complete: (r) =>
        setData(
          r.data.map((x: any) => ({
            week: String(x.week),
            forecast_net_cash_flow: Number(x.forecast_net_cash_flow),
          }))
        ),
    });
  }, []);

  return (
    <DashboardLayout>
      <div id="page-forecast" className="space-y-4">
        <div className="flex justify-between items-center">
          <h2>1-Month Forecast</h2>
          <ExportPDFButton targetId="page-forecast" />
        </div>
        <div className="kpi-card">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="forecast_net_cash_flow"
                stroke="hsl(var(--primary))"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
