import { Routes, Route, Navigate } from "react-router-dom";
import ReportPage from "./pages/ReportPage";
import ForecastPage from "./pages/ForecastPage";
import DashboardPage from "./pages/DashboardPage";
// import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/forecast" element={<ForecastPage />} />
      <Route path="/report" element={<ReportPage />} />
    </Routes>
  );
}
