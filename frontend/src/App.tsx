import { Routes, Route, Navigate } from "react-router-dom";
import ReportPage from "./pages/ReportPage";
import ForecastPage from "./pages/ForecastPage";
import DashboardPage from "./pages/DashboardPage";
import LiquidityRiskPage from "./pages/LiquidityRiskPage";
import CashStructurePage from "./pages/CashStructurePage";
// import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/forecast" element={<ForecastPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/cash-structure" element={<CashStructurePage />} />
      <Route path="/liquidity-risk" element={<LiquidityRiskPage />} />
    </Routes>
  );
}
