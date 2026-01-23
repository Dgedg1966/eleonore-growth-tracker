# -*- coding: utf-8 -*-
"""
Flask backend that reads Éléonore.xlsx and exposes two JSON endpoints:
    /growth   -> weight / height / head measurements
    /nutrition -> milk / feeding data (7-day blocks)

Author : Lumo (Proton AI)
# backend/app.py
# -------------------------------------------------------------
# Flask backend - lecture dynamique de Éléonore.xlsx (situé dans le même dossier)
# -------------------------------------------------------------
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
CORS(app)   # Autorise les appels depuis le front-end React

# -------------------------------------------------------------
# CHEMIN VERS LE CLASSEUR (dans le même répertoire que ce fichier)
# -------------------------------------------------------------
# __file__ -> chemin complet de app.py
# Path(__file__).parent -> dossier "backend"
EXCEL_PATH = Path(__file__).parent / "Éléonore.xlsx"

# Décalage de fuseau ajouté par Excel (GMT+0341 = +3 h 41 min)
OFFSET_MINUTES = 3 * 60 + 41   # 221 minutes


def _clean_excel_hour(raw: Optional[str]) -> Optional[str]:
    """
    Convertit une chaîne Excel du type
        "Sat Dec 30 1899 06:41:12 GMT+0341 (heure du Golfe)"
    en une heure au format HH:MM exactement comme affichée dans la feuille.
    - Si l'heure brute est >= 04:00, on garde telle quelle (Excel masque déjà le décalage).
    - Sinon, on soustrait le décalage +03:41.
    """
    if not isinstance(raw, str) or raw.strip() == "":
        return None

    # Parse la chaîne sans tenir compte du fuseau
    dt = parser.parse(raw, ignoretz=True)   # ex. 1899-12-30 06:41:12
    if dt.hour >= 4:
        # L'heure affichée dans Excel est déjà correcte
        return dt.strftime("%H:%M")
    # Sinon, on enlève le décalage +03:41
    corrected = dt - pd.Timedelta(minutes=OFFSET_MINUTES)
    return corrected.strftime("%H:%M")


# -------------------------------------------------------------
# 1️⃣  Parsing de l'onglet "Poids et Taille"
# -------------------------------------------------------------
def _parse_growth_sheet() -> List[Dict[str, Any]]:
    """
    Retourne une liste d'objets :
    {
        "date": "2025-05-14",
        "weight": 3.6,
        "height": 51,
        "head": 36
    }
    Les champs absents sont simplement omis.
    """
    df = pd.read_excel(
        EXCEL_PATH, sheet_name="Poids et Taille", engine="openpyxl", header=1
    )
    # Nettoyage des noms de colonnes
    df.columns = [c.strip() for c in df.columns]

    # La première colonne est vide (index), on la supprime
    if df.columns[0] == "":
        df = df.drop(df.columns[0], axis=1)

    # Conversion de la colonne Date (Excel stocke déjà un datetime)
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


# -------------------------------------------------------------
# 2️⃣  Parsing de l'onglet "Lait"
# -------------------------------------------------------------
def _parse_milk_sheet() -> Dict[str, Any]:
    """
    Version simplifiée pour parser l'onglet "Lait"
    """
    try:
        raw_df = pd.read_excel(
            EXCEL_PATH,
            sheet_name="Lait",
            header=None,
            engine="openpyxl",
            dtype=str,
        )
        
        print(f"DEBUG: Raw milk sheet shape: {raw_df.shape}", file=sys.stderr)
        
        entries = []
        
        # 1. Extraire les dates (première ligne, colonnes B, D, F, ...)
        dates = []
        for col in range(1, raw_df.shape[1], 2):  # B=1, D=3, F=5, ...
            date_val = raw_df.iloc[0, col]
            if pd.isna(date_val):
                dates.append(None)
            else:
                try:
                    parsed = pd.to_datetime(str(date_val), errors='coerce')
                    dates.append(parsed)
                    print(f"DEBUG: Parsed date '{date_val}' -> {parsed}", file=sys.stderr)
                except:
                    dates.append(None)
        
        # 2. Parcourir les lignes de données (à partir de la ligne 3)
        for row_idx in range(2, raw_df.shape[0]):
            row = raw_df.iloc[row_idx]
            
            for date_idx, date_val in enumerate(dates):
                if date_val is None:
                    continue
                    
                col_ml = 1 + (date_idx * 2)      # colonne ml
                col_hour = col_ml + 1            # colonne heure
                
                # Vérifier les bornes
                if col_ml >= len(row) or col_hour >= len(row):
                    continue
                
                ml_val = row[col_ml]
                hour_val = row[col_hour]
                
                # Ignorer si vide
                if pd.isna(ml_val) or str(ml_val).strip() == "":
                    continue
                
                try:
                    ml_float = float(str(ml_val).strip())
                except ValueError:
                    continue
                
                # Créer l'entrée
                entry = {
                    "date": date_val.date().isoformat(),
                    "ml": ml_float,
                }
                
                # Déterminer le type
                if (hour_val and 
                    isinstance(hour_val, str) and 
                    "tétée" in hour_val.lower()):
                    entry["type"] = "tétée"
                    entry["source"] = "maternel"
                    # Extraire les heures des tétées
                    if "à" in hour_val:
                        time_range = hour_val.split("à")[-1].strip()
                        entry["time_range"] = time_range
                else:
                    entry["type"] = "biberon"
                    if hour_val:
                        entry["hour"] = _clean_excel_hour(hour_val)
                
                entries.append(entry)
        
        return {
            "success": True,
            "entries": entries,
            "count": len(entries),
            "weekly_average": None  # À implémenter plus tard
        }
        
    except Exception as e:
        print(f"ERROR in _parse_milk_sheet: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return {
            "success": False,
            "error": str(e),
            "entries": [],
            "count": 0
        }
    
    # DEBUG: Afficher ce que Pandas lit réellement
    print(f"DEBUG [MILK]: Raw DataFrame shape: {raw_df.shape}", file=sys.stderr)
    print(f"DEBUG [MILK]: First date row: {raw_df.iloc[0, 1:15]}", file=sys.stderr)
    
    # -----------------------------------------------------------------
    # 1️⃣  Dates (première ligne, colonnes paires B,D,F,…)
    # -----------------------------------------------------------------
    date_cells = raw_df.iloc[0, 1::2]  # B, D, F, …
    
    # DEBUG: Afficher les dates brutes
    print(f"DEBUG [MILK]: Date cells: {date_cells.tolist()}", file=sys.stderr)
    
    # Essayer plusieurs formats de parsing
    dates = []
    for cell in date_cells:
        if pd.isna(cell) or str(cell).strip() == "":
            dates.append(pd.NaT)
            continue
            
        cell_str = str(cell).strip()
        try:
            # Essayer de parser avec différents formats
            # Format 1: "2025-07-29 00:00:00" (format ISO)
            parsed = pd.to_datetime(cell_str, errors='raise')
            dates.append(parsed)
            print(f"DEBUG [MILK]: Parsed '{cell_str}' as {parsed}", file=sys.stderr)
        except Exception as e:
            print(f"DEBUG [MILK]: Error parsing '{cell_str}': {e}", file=sys.stderr)
            dates.append(pd.NaT)
    
    # Convertir en Series pour faciliter l'accès
    dates = pd.Series(dates)
    
    # Continuer avec le reste de votre fonction...
    entries: List[Dict[str, Any]] = []

    # -----------------------------------------------------------------
    # 2️⃣  Parcours des lignes de données
    # -----------------------------------------------------------------
    for row_idx in range(2, raw_df.shape[0]):  # ligne 3 du tableau (index 2)
        row = raw_df.iloc[row_idx]
        
        # DEBUG: Afficher la ligne actuelle
        if row_idx < 10:  # Limiter le debug aux premières lignes
            print(f"DEBUG [MILK]: Row {row_idx}: {row.tolist()}", file=sys.stderr)

        for col_pair in range(1, raw_df.shape[1], 2):  # B/D/F/…
            ml_val = row[col_pair]      # colonne ml
            hour_raw = row[col_pair + 1]  # colonne heure

            # Ignorer les cellules complètement vides
            if pd.isna(ml_val) or str(ml_val).strip() == "":
                continue

            # Date associée à cette paire de colonnes
            date_index = (col_pair - 1) // 2
            if date_index >= len(dates) or pd.isna(dates.iloc[date_index]):
                continue
                
            cur_date = dates.iloc[date_index].date().isoformat()

            # ---------------------------------------------------------
            # Cas spécial : le mot "Tétées" apparaît dans la colonne heure
            # ---------------------------------------------------------
            if isinstance(hour_raw, str) and hour_raw.lower().startswith("tétées"):
                # Le volume total des tétées est déjà présent dans ml_val
                entries.append(
                    {
                        "date": cur_date,
                        "type": "tétée",
                        "source": "maternel",  # différencie biberon vs tétée
                        "ml": float(ml_val),
                        "hours": [],  # remplira le deuxième passage
                    }
                )
                continue

            # ---------------------------------------------------------
            # Biberon classique
            # ---------------------------------------------------------
            hour_clean = _clean_excel_hour(hour_raw)
            entries.append(
                {
                    "date": cur_date,
                    "type": "biberon",
                    "ml": float(ml_val),
                    "hour": hour_clean,
                }
            )

    # ... reste de votre fonction (deuxième passage, validation, extraction moyenne) ...

    # -----------------------------------------------------------------
    # 3️⃣  Deuxième passage : récupération des créneaux de tétées
    # -----------------------------------------------------------------
    for row_idx in range(2, raw_df.shape[0]):
        row = raw_df.iloc[row_idx]
        for col_pair in range(1, raw_df.shape[1], 2):
            hour_raw = row[col_pair + 1]
            if isinstance(hour_raw, str) and hour_raw.lower().startswith("tétées"):
                date_index = (col_pair - 1) // 2
                cur_date = dates.iloc[date_index].date().isoformat()
                # Trouver l'entrée tétée correspondante
                for ent in entries:
                    if ent["date"] == cur_date and ent["type"] == "tétée":
                        slot = hour_raw.replace("Tétées", "").strip()
                        ent.setdefault("hours", []).append(slot)
                        break

    # -----------------------------------------------------------------
    # 4️⃣  Validation des totaux quotidiens (colonne "total")
    # -----------------------------------------------------------------
    total_line = raw_df.iloc[-2]                     # ligne juste avant "Moyenne semaine"
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

    # -----------------------------------------------------------------
    # 5️⃣  Extraction de la moyenne hebdomadaire (ligne "Moyenne semaine")
    # -----------------------------------------------------------------
    weekly_avg_line = raw_df.iloc[-1]                # dernière ligne du tableau
    weekly_average = None
    # La moyenne se trouve généralement dans la colonne P (index 15)
    if weekly_avg_line.shape[0] > 15:
        avg_candidate = weekly_avg_line.iloc[15]
        try:
            weekly_average = float(avg_candidate)
        except (ValueError, TypeError):
            weekly_average = None

    return {"entries": entries, "weekly_average": weekly_average}


# ------------------------------------------------------------
#  FLASK ROUTES
# ------------------------------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "API Éléonore Growth Tracker",
        "endpoints": {
            "growth": "/growth",
            "nutrition": "/nutrition"
        }
    })

@app.route("/growth", methods=["GET"])
def growth_endpoint():
    """ Retourne les mesures de poids / taille / tête."""
    data = _parse_growth_sheet()
    return jsonify(data)

@app.route("/nutrition", methods=["GET"])
def nutrition_endpoint():
    """ Retourne les données de l'onglet "Lait"."""
    data = _parse_milk_sheet()
    return jsonify(data)

# ------------------------------------------------------------
#  LANCEMENT DU SERVEUR
# ------------------------------------------------------------
if __name__ == "__main__":
    # Sur Render on utilise la variable d'environnement PORT,
    # sinon on écoute sur le 5000 par défaut.
    import os

    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
