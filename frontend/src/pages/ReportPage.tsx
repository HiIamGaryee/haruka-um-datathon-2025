// src/pages/ReportPage.tsx

import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import ExportPDFButton from "../components/ExportPDFButton";

type Metrics = {
  starting_cash_usd: number;
  model: string;
  mae: number | string;
  assumptions: string[];
  limitations: string[];
};

export default function ReportPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch("/src/data/metrics.json")
      .then((res) => res.json())
      .then(setMetrics);
  }, []);

  return (
    <DashboardLayout>
      <div id="page-report" className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Model Report</h1>
            <p className="text-xs text-muted-foreground">
              Forecast methodology, assumptions, and limitations
            </p>
          </div>
          <ExportPDFButton targetId="page-report" />
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="kpi-card">
            <div className="section-title">Starting Cash (USD)</div>
            <div className="mt-2 text-xl font-semibold">
              {metrics?.starting_cash_usd?.toLocaleString()}
            </div>
          </div>

          <div className="kpi-card">
            <div className="section-title">Forecast Model</div>
            <div className="mt-2 text-sm">{metrics?.model}</div>
          </div>

          <div className="kpi-card">
            <div className="section-title">MAE</div>
            <div className="mt-2 text-sm">{metrics?.mae ?? "—"}</div>
          </div>
        </div>

        {/* ASSUMPTIONS */}
        <div className="kpi-card">
          <h2 className="mb-2">Model Assumptions</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {metrics?.assumptions?.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>

        {/* LIMITATIONS */}
        <div className="kpi-card">
          <h2 className="mb-2">Model Limitations</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {metrics?.limitations?.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
