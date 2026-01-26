# -*- coding: utf-8 -*-
"""
Flask backend for Éléonore Growth Tracker
Exposes two JSON endpoints:
    /growth   -> weight / height / head measurements
    /nutrition -> milk / feeding data
"""
import logging
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional

import pandas as pd
from dateutil import parser
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow calls from React frontend

# -------------------------------------------------------------
# EXCEL FILE PATH (in same directory as this file)
# -------------------------------------------------------------
EXCEL_PATH = Path(__file__).parent / "Éléonore.xlsx"

# Excel timezone offset (GMT+0341 = +3h 41min)
OFFSET_MINUTES = 3 * 60 + 41  # 221 minutes

# -------------------------------------------------------------
# HELPER FUNCTIONS
# -------------------------------------------------------------
def _clean_excel_hour(raw: Optional[str]) -> Optional[str]:
    """
    Convert Excel time string like "Sat Dec 30 1899 06:41:12 GMT+0341"
    to HH:MM format as shown in the sheet.
    """
    if not isinstance(raw, str) or raw.strip() == "":
        return None

    # Parse ignoring timezone
    dt = parser.parse(raw, ignoretz=True)
    if dt.hour >= 4:
        # Time displayed in Excel is already correct
        return dt.strftime("%H:%M")
    # Otherwise subtract offset +03:41
    corrected = dt - pd.Timedelta(minutes=OFFSET_MINUTES)
    return corrected.strftime("%H:%M")

# -------------------------------------------------------------
# 1. GROWTH SHEET PARSING (Poids et Taille)
# -------------------------------------------------------------
def _parse_growth_sheet() -> List[Dict[str, Any]]:
    """
    Returns list of growth measurements:
    {
        "date": "2025-05-14",
        "weight": 3.6,
        "height": 51,
        "head": 36
    }
    """
    try:
        # Read with header on row 2 (index 1)
        df = pd.read_excel(
            EXCEL_PATH, 
            sheet_name="Poids et Taille", 
            engine="openpyxl",
            header=1
        )
        
        # Clean column names
        df.columns = [str(c).strip() for c in df.columns]
        
        # Remove empty first column if present
        if len(df.columns) > 0 and df.columns[0] == "":
            df = df.drop(df.columns[0], axis=1)
        
        # Convert Date column
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce").dt.date
        
        # Build records
        records = []
        for _, row in df.iterrows():
            if pd.isna(row.get("Date")):
                continue
                
            rec = {"date": row["Date"].isoformat()}
            
            if pd.notna(row.get("Poids (kg)")):
                rec["weight"] = float(row["Poids (kg)"])
            if pd.notna(row.get("Taille (cm)")):
                rec["height"] = float(row["Taille (cm)"])
            if pd.notna(row.get("Tour de tête (cm)")):
                rec["head"] = float(row["Tour de tête (cm)"])
            
            records.append(rec)
        
        app.logger.info(f"Parsed {len(records)} growth records")
        return records
        
    except Exception as e:
        app.logger.error(f"Error parsing growth sheet: {str(e)}")
        import traceback
        traceback.print_exc(file=sys.stderr)
        return []

# -------------------------------------------------------------
# 2. MILK SHEET PARSING (Lait) - CLEAN VERSION
# -------------------------------------------------------------
def _parse_milk_sheet() -> Dict[str, Any]:
    """
    Returns milk/feeding data from "Lait" sheet.
    """
    try:
        raw_df = pd.read_excel(
            EXCEL_PATH,
            sheet_name="Lait",
            header=None,
            engine="openpyxl",
            dtype=str,
        )
        
        app.logger.info(f"Milk sheet shape: {raw_df.shape}")
        
        entries = []
        
        # 1. Extract dates from first row (columns B, D, F, ...)
        dates = []
        for col in range(1, raw_df.shape[1], 2):  # B=1, D=3, F=5, ...
            date_val = raw_df.iloc[0, col]
            if pd.isna(date_val):
                dates.append(None)
            else:
                try:
                    date_str = str(date_val).strip()
                    parsed = pd.to_datetime(date_str, errors='coerce')
                    dates.append(parsed)
                    app.logger.debug(f"Parsed date '{date_str}' -> {parsed}")
                except Exception:
                    dates.append(None)
        
        # 2. Parse data rows (starting from row index 2)
        for row_idx in range(2, raw_df.shape[0]):
            row = raw_df.iloc[row_idx]
            
            for date_idx, date_val in enumerate(dates):
                if date_val is None:
                    continue
                    
                # Calculate column indices
                col_ml = 1 + (date_idx * 2)      # ml column
                col_hour = col_ml + 1            # hour column
                
                # Check bounds
                if col_ml >= len(row) or col_hour >= len(row):
                    continue
                
                ml_val = row[col_ml]
                hour_val = row[col_hour]
                
                # Skip empty ml values
                if pd.isna(ml_val) or str(ml_val).strip() == "":
                    continue
                
                # Parse ml value
                try:
                    ml_float = float(str(ml_val).strip())
                except ValueError:
                    continue
                
                # Create entry
                entry = {
                    "date": date_val.date().isoformat(),
                    "ml": ml_float,
                }
                
                # Determine type (biberon or tétée)
                if (hour_val and 
                    isinstance(hour_val, str) and 
                    "tétée" in hour_val.lower()):
                    entry["type"] = "tétée"
                    entry["source"] = "maternel"
                else:
                    entry["type"] = "biberon"
                    if hour_val:
                        cleaned_hour = _clean_excel_hour(hour_val)
                        if cleaned_hour:
                            entry["hour"] = cleaned_hour
                
                entries.append(entry)
        
        app.logger.info(f"Parsed {len(entries)} milk entries")
        
        return {
            "success": True,
            "entries": entries,
            "count": len(entries),
            "weekly_average": None
        }
        
    except Exception as e:
        app.logger.error(f"Error parsing milk sheet: {str(e)}")
        import traceback
        traceback.print_exc(file=sys.stderr)
        
        return {
            "success": False,
            "error": str(e),
            "entries": [],
            "count": 0
        }

# ------------------------------------------------------------
# FLASK ROUTES
# ------------------------------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "Éléonore Growth Tracker API",
        "version": "1.0",
        "endpoints": {
            "growth": "/growth",
            "nutrition": "/nutrition"
        }
    })

@app.route("/growth", methods=["GET"])
def growth_endpoint():
    """Returns growth measurements."""
    data = _parse_growth_sheet()
    return jsonify(data)

@app.route("/nutrition", methods=["GET"])
def nutrition_endpoint():
    """Returns milk/feeding data."""
    data = _parse_milk_sheet()
    return jsonify(data)

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    import os
    return jsonify({
        "status": "healthy",
        "excel_file_exists": os.path.exists(EXCEL_PATH),
        "file_path": str(EXCEL_PATH)
    })

# ------------------------------------------------------------
# MAIN ENTRY POINT
# ------------------------------------------------------------
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Get port from environment or default
    import os
    port = int(os.getenv("PORT", 10000))
    
    app.logger.info(f"Starting server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
