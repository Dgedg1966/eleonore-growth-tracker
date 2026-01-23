import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

import pandas as pd
from dateutil import parser
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

EXCEL_PATH = Path(__file__).parent / "Éléonore.xlsx"

OFFSET_MINUTES = 3 * 60 + 41

def _clean_excel_hour(raw: Optional[str]) -> Optional[str]:
    if not isinstance(raw, str) or raw.strip() == "":
        return None
    dt = parser.parse(raw, ignoretz=True)
    if dt.hour >= 4:
        return dt.strftime("%H:%M")
    corrected = dt - pd.Timedelta(minutes=OFFSET_MINUTES)
    return corrected.strftime("%H:%M")

def _parse_growth_sheet() -> List[Dict[str, Any]]:
    df = pd.read_excel(
        EXCEL_PATH, sheet_name="Poids et Taille", engine="openpyxl"
    )
    df.columns = [c.strip() for c in df.columns]
    if df.columns[0] == "":
        df = df.drop(df.columns[0], axis=1)
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce").dt.date
    records = []
    for _, row in df.iterrows():
        rec = {"date": row["Date"].isoformat()}
        if pd.notna(row.get("Poids (kg)")):
            rec["weight"] = float(row["Poids (kg)"])
        if pd.notna(row.get("Taille (cm)")):
            rec["height"] = float(row["Taille (cm)"])
        if pd.notna(row.get("Tour de tête (cm)")):
            rec["head"] = float(row["Tour de tête (cm)"])
        records.append(rec)
    return records

def _parse_milk_sheet() -> Dict[str, Any]:
    raw_df = pd.read_excel(
        EXCEL_PATH,
        sheet_name="Lait",
        header=None,
        engine="openpyxl",
        dtype=str,
    )
    date_cells = raw_df.iloc[0, 1::2]
    dates = pd.to_datetime(
        date_cells.str.strip(","), format="%a %b %d %Y %H:%M:%S %Z%z"
    )
    entries: List[Dict[str, Any]] = []
    for row_idx in range(2, raw_df.shape[0]):
        row = raw_df.iloc[row_idx]
        for col_pair in range(1, raw_df.shape[1], 2):
            ml_val = row[col_pair]
            hour_raw = row[col_pair + 1]
            if pd.isna(ml_val) or str(ml_val).strip() == "":
                continue
            date_index = (col_pair - 1) // 2
            cur_date = dates.iloc[date_index].date().isoformat()
            if isinstance(hour_raw, str) and hour_raw.lower().startswith("tétées"):
                entries.append(
                    {
                        "date": cur_date,
                        "type": "tétée",
                        "source": "maternel",
                        "ml": float(ml_val),
                        "hours": [],
                    }
                )
                continue
            hour_clean = _clean_excel_hour(hour_raw)
            entries.append(
                {
                    "date": cur_date,
                    "type": "biberon",
                    "ml": float(ml_val),
                    "hour": hour_clean,
                }
            )
    for row_idx in range(2, raw_df.shape[0]):
        row = raw_df.iloc[row_idx]
        for col_pair in range(1, raw_df.shape[1], 2):
            hour_raw = row[col_pair + 1]
            if isinstance(hour_raw, str) and hour_raw.lower().startswith("tétées"):
                date_index = (col_pair - 1) // 2
                cur_date = dates.iloc[date_index].date().isoformat()
                for ent in entries:
                    if ent["date"] == cur_date and ent["type"] == "tétée":
                        slot = hour_raw.replace("Tétées", "").strip()
                        ent.setdefault("hours", []).append(slot)
                        break
    total_line = raw_df.iloc[-2]
    for col_pair in range(1, raw_df.shape[1], 2):
        total_val = total_line[col_pair]
        if pd.isna(total_val):
            continue
        date_index = (col_pair - 1) // 2
        cur_date = dates.iloc[date_index].date().isoformat()
        computed = sum(e["ml"] for e in entries if e["date"] == cur_date)
        if abs(computed - float(total_val)) > 0.001:
            app.logger.warning(
                f"Incohérence le {cur_date}: total={total_val}, somme={computed}"
            )
    weekly_avg_line = raw_df.iloc[-1]
    weekly_average = None
    if weekly_avg_line.shape[0] > 15:
        avg_candidate = weekly_avg_line.iloc[15]
        try:
            weekly_average = float(avg_candidate)
        except (ValueError, TypeError):
            weekly_average = None
    return {"entries": entries, "weekly_average": weekly_average}

@app.route("/growth", methods=["GET"])
def growth_endpoint():
    data = _parse_growth_sheet()
    return jsonify(data)

@app.route("/nutrition", methods=["GET"])
def nutrition_endpoint():
    data = _parse_milk_sheet()
    return jsonify(data)

if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
