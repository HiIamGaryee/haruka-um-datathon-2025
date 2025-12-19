import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.metrics import mean_absolute_error

# ======================================================
# PATHS
# ======================================================
ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "datathon_dataset.xlsx"
OUT = ROOT / "outputs"
OUT.mkdir(exist_ok=True)

# ======================================================
# 1. LOAD CASH BALANCE (STARTING LIQUIDITY)
# ======================================================
balance_df = pd.read_excel(DATA_FILE, sheet_name="Data - Cash Balance")
balance_df.columns = balance_df.columns.str.strip().str.lower()

starting_cash = balance_df["carryforward balance (usd)"].sum()

# ======================================================
# 2. LOAD TRANSACTIONS (DIRECTIONAL FLOWS)
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

weekly.to_csv(OUT / "weekly_actuals.csv", index=False)

# ======================================================
# 4. BASELINE FORECAST (ROLLING MEAN)
# ======================================================
series = weekly["net_cash_flow"].astype(float).values

window = min(4, len(series))
rolling_mean = float(np.mean(series[-window:]))

forecast_1m = [rolling_mean] * 4
forecast_6m = [rolling_mean] * 26

pd.DataFrame({
    "week": range(1, 5),
    "forecast_net_cash_flow": forecast_1m
}).to_csv(OUT / "forecast_1m.csv", index=False)

pd.DataFrame({
    "week": range(1, 27),
    "forecast_net_cash_flow": forecast_6m
}).to_csv(OUT / "forecast_6m.csv", index=False)

# ======================================================
# 5. EVALUATION (SAFE FOR SHORT SERIES)
# ======================================================
if len(series) >= 2:
    actual = series[-window:]
    pred = np.array(forecast_1m[:len(actual)])
    mae = mean_absolute_error(actual, pred)
else:
    mae = None

metrics = {
    "starting_cash_usd": float(starting_cash),
    "model": "Rolling Mean Baseline",
    "mae": float(mae) if mae is not None else "insufficient_history",
    "assumptions": [
        "Transaction amounts unavailable; directional proxy used",
        "Recent weeks represent near-term liquidity behaviour",
        "Forecast focuses on liquidity direction not magnitude"
    ],
    "limitations": [
        "Short historical window limits backtesting",
        "Forecast is indicative not predictive of shocks"
    ]
}

pd.Series(metrics).to_json(OUT / "metrics.json", indent=2)

print("Forecast pipeline completed successfully.")
