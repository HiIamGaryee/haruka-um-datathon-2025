import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.metrics import mean_absolute_error
import json

# ======================================================
# PATHS
# ======================================================
ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "datathon_dataset.xlsx"
OUT = ROOT / "outputs"
OUT.mkdir(exist_ok=True)

# ======================================================
# 1. LOAD CASH BALANCE
# ======================================================
balance_df = pd.read_excel(DATA_FILE, sheet_name="Data - Cash Balance")
balance_df.columns = balance_df.columns.str.strip().str.lower()

starting_cash = float(balance_df["carryforward balance (usd)"].sum())

# ======================================================
# 2. LOAD TRANSACTIONS
# ======================================================
tx = pd.read_excel(DATA_FILE, sheet_name="Data - Main")
tx.columns = tx.columns.str.strip().str.lower()

tx["file month"] = pd.to_datetime(tx["file month"], errors="coerce")
tx = tx.dropna(subset=["file month"])

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
    .sort_values("week_start")
)

weekly["net_cash_flow"] = weekly["amount"]
weekly["cash_position"] = starting_cash + weekly["net_cash_flow"].cumsum()

weekly.to_csv(OUT / "weekly_actuals.csv", index=False)

# ======================================================
# 4. FORECAST HORIZONS (DATA-DRIVEN)
# ======================================================
series = weekly["net_cash_flow"].astype(float)
history_weeks = len(series)

horizons = {
    "1_month": min(4, history_weeks),
    "3_months": min(12, history_weeks * 3),
    "1_year": min(52, history_weeks * 6),
}

# ======================================================
# 5. BASELINE MODEL (ROLLING MEAN)
# ======================================================
window = min(4, history_weeks)
baseline = float(series.tail(window).mean())

last_week = weekly["week_start"].max()

forecasts = {}
for name, weeks in horizons.items():
    forecasts[name] = [
        {
            "week_index": i + 1,
            "forecast_week_start": (
                last_week + pd.Timedelta(weeks=i + 1)
            ).isoformat(),
            "forecast_net_cash_flow": baseline,
        }
        for i in range(weeks)
    ]

# ======================================================
# 6. EVALUATION
# ======================================================
if history_weeks >= 2:
    actual = series.tail(window).values
    pred = np.array([baseline] * len(actual))
    mae = float(mean_absolute_error(actual, pred))
else:
    mae = "insufficient_history"

# ======================================================
# 7. SERIALIZE WEEKLY ACTUALS (FIXED)
# ======================================================
weekly_serialized = [
    {
        "week_start": row["week_start"].isoformat(),
        "net_cash_flow": float(row["net_cash_flow"]),
        "cash_position": float(row["cash_position"]),
    }
    for row in weekly.to_dict(orient="records")
]

# ======================================================
# 8. FINAL OUTPUT
# ======================================================
output = {
    "starting_cash_usd": starting_cash,
    "history_weeks": history_weeks,
    "model": "Rolling Mean Baseline",
    "baseline_window_weeks": window,
    "mae": mae,
    "weekly_actuals": weekly_serialized,
    "forecasts": forecasts,
    "assumptions": [
        "Transaction values unavailable; directional proxy applied",
        "Recent historical behavior used as near-term signal",
        "Forecast reflects liquidity direction, not magnitude"
    ],
    "limitations": [
        "Short history limits statistical confidence",
        "No seasonality or shock modeling applied",
        "Indicative planning tool, not predictive guarantee"
    ]
}

with open(OUT / "forecast_bundle.json", "w") as f:
    json.dump(output, f, indent=2)

print("Forecast pipeline completed successfully.")
