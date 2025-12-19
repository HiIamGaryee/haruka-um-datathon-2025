# ======================================================
# HARUKA UM DATATHON 2025
# RISK ANALYSIS PIPELINE (NaN-SAFE)
# ======================================================

import json
import numpy as np
import pandas as pd
from pathlib import Path

# ======================================================
# PATHS
# ======================================================
ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "datathon_dataset.xlsx"
OUT = ROOT / "outputs"
OUT.mkdir(exist_ok=True)

# ======================================================
# HELPERS
# ======================================================
def safe(v):
    if v is None:
        return None
    if isinstance(v, float) and (np.isnan(v) or np.isinf(v)):
        return None
    return float(v)

def risk_band(v):
    if v is None:
        return "unknown"
    if v < 0.33:
        return "low"
    if v < 0.66:
        return "medium"
    return "high"

# ======================================================
# 1. LOAD CASH BALANCE
# ======================================================
balance = pd.read_excel(DATA_FILE, sheet_name="Data - Cash Balance")
balance.columns = balance.columns.str.strip().str.lower()
starting_cash = balance["carryforward balance (usd)"].sum()

# ======================================================
# 2. LOAD TRANSACTIONS
# ======================================================
tx = pd.read_excel(DATA_FILE, sheet_name="Data - Main")
tx.columns = tx.columns.str.strip().str.lower()

tx["file month"] = pd.to_datetime(tx["file month"], errors="coerce")

tx["direction"] = np.where(
    tx["name of offsetting account"]
    .astype(str)
    .str.contains("house bank", case=False, na=False),
    -1,
    1,
)

tx["amount"] = tx["direction"].astype(float)

# ======================================================
# 3. WEEKLY AGGREGATION
# ======================================================
tx["week_start"] = tx["file month"].dt.to_period("W").apply(lambda r: r.start_time)

weekly = (
    tx.groupby("week_start")["amount"]
    .sum()
    .reset_index()
)

weekly["net_cash_flow"] = weekly["amount"]
weekly["cash_position"] = starting_cash + weekly["net_cash_flow"].cumsum()
weekly = weekly.sort_values("week_start").reset_index(drop=True)

# ======================================================
# 4. STABILITY & STRESS
# ======================================================
weekly["rolling_volatility"] = weekly["net_cash_flow"].rolling(4).std()

weekly["negative"] = weekly["net_cash_flow"] < 0
weekly["stress_run"] = (
    weekly["negative"]
    .astype(int)
    .groupby((weekly["negative"] != weekly["negative"].shift()).cumsum())
    .cumsum()
)

vol_norm = weekly["rolling_volatility"] / weekly["rolling_volatility"].max()
stress_norm = weekly["stress_run"] / weekly["stress_run"].max()

weekly["stability_index"] = 1 - (
    0.6 * vol_norm.fillna(np.nan) +
    0.4 * stress_norm.fillna(np.nan)
)

# ======================================================
# 5. LIQUIDITY RISK METRICS
# ======================================================
weekly["liquidity_ratio"] = weekly["cash_position"] / starting_cash
weekly["drawdown"] = (
    weekly["cash_position"] -
    weekly["cash_position"].cummax()
) / weekly["cash_position"].cummax()

# ======================================================
# 6. EXPORT JSON (NaN → null)
# ======================================================
risk_rows = []

for _, r in weekly.iterrows():
    stability = safe(r["stability_index"])

    risk_rows.append({
        "week_start": r["week_start"].isoformat(),
        "stability_index": stability,
        "risk_band": risk_band(stability),
        "liquidity_ratio": safe(r["liquidity_ratio"]),
        "drawdown": safe(r["drawdown"]),
    })

output = {
    "starting_cash_usd": float(starting_cash),
    "cash_stability_index": risk_rows,
    "assumptions": [
        "Directional cash proxy used",
        "Volatility via rolling standard deviation",
        "Stress from consecutive negative weeks",
        "Indices normalized for comparison"
    ],
    "limitations": [
        "Does not capture magnitude of cash flows",
        "Short history reduces statistical confidence",
        "Indicative risk, not predictive stress testing"
    ]
}

with open(OUT / "risk_analysis.json", "w") as f:
    json.dump(output, f, indent=2)

print("Risk analysis pipeline completed successfully.")
