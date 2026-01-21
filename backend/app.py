# -*- coding: utf-8 -*-
"""
Flask backend that reads Eléonore.xlsx and exposes two JSON endpoints:
    /growth   → weight / height / head measurements
    /nutrition → milk / feeding data (7‑day blocks)

Author : Lumo (Proton AI)
"""

from pathlib import Path
from typing import List, Dict, Any, Optional

import pandas as pd
from dateutil import parser
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)   # autorise les appels depuis le front‑end React

# ------------------------------------------------------------
#  CONFIGURATION
# ------------------------------------------------------------
EXCEL_PATH = Path(__file__).parent / "Eléonore.xlsx"

# Décalage de fuseau ajouté par Excel (GMT+0341 = +3h41)
OFFSET_MINUTES = 3 * 60 + 41   # 221 minutes


def _clean_excel_hour(raw: Optional[str]) -> Optional[str]:
    """
    Convertit une chaîne du type
        "Sat Dec 30 1899 06:41:12 GMT+0341 (heure du Golfe)"
    en une heure au format HH:MM exactement comme affichée dans Excel.

    - Si l'heure brute est >= 04:00, on considère que le format d'affichage
      masque déjà le décalage → on renvoie l'heure brute.
    - Sinon, on soustrait le décalage +03:41.
    - Retourne None si la cellule est vide ou ne contient pas d'heure.
    """
    if not isinstance(raw, str) or raw.strip() == "":
        return None

    # Parse la chaîne sans tenir compte du fuseau (ignoretz=True)
    dt = parser.parse(raw, ignoretz=True)   # ex. 1899‑12‑30 06:41:12

    # Si l'heure brute est >= 04:00, on garde telle quelle (affichage Excel)
    if dt.hour >= 4:
        return dt.strftime("%H:%M")

    # Sinon, on enlève le décalage +03:41
    corrected = dt - pd.Timedelta(minutes=OFFSET_MINUTES)
    return corrected.strftime("%H:%M")


# ------------------------------------------------------------
#  PARSER POUR L'ONGLET "Poids et Taille"
# ------------------------------------------------------------
def _parse_growth_sheet() -> List[Dict[str, Any]]:
    """
    Retourne une liste d'objets :
    {
        "date": "2025-05-14",
        "weight": 3.6,
        "height": 51,
        "head": 36
    }
    Les cellules vides sont ignorées.
    """
    df = pd.read_excel(EXCEL_PATH, sheet_name="Poids et Taille", engine="openpyxl")
    # Normalisation des noms de colonnes (enlever les espaces)
    df.columns = [c.strip() for c in df.columns]

    # La première colonne est vide (index), on la supprime
    if df.columns[0] == "":
        df = df.drop(df.columns[0], axis=1)

    # Conversion de la colonne Date (Excel stocke déjà un datetime)
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce").dt.date

    records = []
    for _, row in df.iterrows():
        rec = {"date": row["Date"].isoformat()}
        # Poids
        if pd.notna(row.get("Poids (kg)")):
            rec["weight"] = float(row["Poids (kg)"])
        # Taille
        if pd.notna(row.get("Taille (cm)")):
            rec["height"] = float(row["Taille (cm)"])
        # Tour de tête
        if pd.notna(row.get("Tour de tête (cm)")):
            rec["head"] = float(row["Tour de tête (cm)"])

        # On ne garde que les champs qui existent réellement
        records.append(rec)

    return records


# ------------------------------------------------------------
#  PARSER POUR L'ONGLET "Lait"
# ------------------------------------------------------------
def _parse_milk_sheet() -> Dict[str, Any]:
    """
    Retourne un dictionnaire contenant :

    {
        "entries": [               # toutes les prises (biberons + tétées)
            {
                "date": "2025-09-23",
                "type": "biberon",
                "ml": 150,
                "hour": "04:00",
                "milk_type": "Kendamil (Chèvre)"   # à compléter via la légende couleur
            },
            {
                "date": "2025-09-23",
                "type": "tétée",
                "ml": 45,
                "hours": ["21:30 à 21:45"],
                "source": "maternel"
            },
            …
        ],
        "weekly_average": 812.14   # valeur extraite de la ligne « Moyenne semaine »
    }

    Le parsing accepte **un nombre quelconque de blocs de 7 jours**,
    chacun devant être complet (pas de lignes vides à l’intérieur du bloc).
    Les cellules vides sont simplement ignorées.
    """
    # Lecture brute du fichier (pas d’interprétation de dates)
    raw_df = pd.read_excel(EXCEL_PATH, sheet_name="Lait", header=None, engine="openpyxl", dtype=str)

    # -----------------------------------------------------------------
    # 1️⃣  Extraction des dates (première ligne, colonnes paires B,D,F,…)
    # -----------------------------------------------------------------
    date_cells = raw_df.iloc[0, 1::2]                     # B, D, F, …
    dates = pd.to_datetime(date_cells.str.strip(","), format="%a %b %d %Y %H:%M:%S %Z%z")
    # dates[i] correspond à la colonne paire i (B → dates[0], D → dates[1], …)

    entries: List[Dict[str, Any]] = []

    # -----------------------------------------------------------------
    # 2️⃣  Parcours des lignes de données (à partir de la 3ᵉ ligne du bloc)
    # -----------------------------------------------------------------
    for row_idx in range(2, raw_df.shape[0]):            # ligne 3 du tableau (index 2)
        row = raw_df.iloc[row_idx]

        for col_pair in range(1, raw_df.shape[1], 2):    # B/D/F/…
            ml_val = row[col_pair]                      # colonne ml
            hour_raw = row[col_pair + 1]                # colonne heure

            # Ignorer les cellules complètement vides
            if pd.isna(ml_val) or str(ml_val).strip() == "":
                continue

            # Date associée à cette paire de colonnes
            date_index = (col_pair - 1) // 2
            cur_date = dates.iloc[date_index].date().isoformat()

            # ---------------------------------------------------------
            # Cas spécial : le mot « Tétées » apparaît dans la colonne heure
            # ---------------------------------------------------------
            if isinstance(hour_raw, str) and hour_raw.lower().startswith("tétées"):
                # Le volume total des tétées est déjà présent dans ml_val
                entries.append({
                    "date": cur_date,
                    "type": "tétée",
                    "source": "maternel",
                    "ml": float(ml_val),
                    "hours": []                     # remplira le deuxième passage
                })
                continue

            # ---------------------------------------------------------
            # Biberon classique
            # ---------------------------------------------------------
            hour_clean = _clean_excel_hour(hour_raw)
            entries.append({
                "date": cur_date,
                "type": "biberon",
                "ml": float(ml_val),
                "hour": hour_clean,
                # Le type de lait (Kendamil, Aptamil, …) sera ajouté
                # via la légende couleur (voir remarque plus bas)
            })

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
    # 4️⃣  Validation des totaux quotidiens (colonne « total »)
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
    # 5️⃣  Extraction de la moyenne hebdomadaire (ligne « Moyenne semaine »)
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

    # -----------------------------------------------------------------
    # 6️⃣  (Optionnel) Ajout du type de lait via la légende couleur
    # -----------------------------------------------------------------
    # La légende se situe dans les colonnes Q/R (indices 16/17) et
    # contient des cellules du type "Kendamil (Chèvre)", "Aptamil (Vache)", …
    # Si vous avez besoin de ce mapping, vous pouvez le récupérer ainsi :
    #
    # legend = {}
    # for row in raw_df.itertuples(index=False):
    #     if pd.notna(row[16]):               # colonne Q
    #         color = row[16]                 # (dans votre fichier c’est le texte de la couleur)
    #         name  = row[17]                 # colonne R → libellé du lait
    #         legend[color] = name
    #
    # Ensuite, dans la boucle du parsing des biberons, vous pourriez
    # déterminer le type de lait à partir de la couleur de la cellule.
    # Pour l’instant, on laisse le champ `milk_type` vide.
    # -----------------------------------------------------------------

    return {"entries": entries, "weekly_average": weekly_average}


# ------------------------------------------------------------
#  FLASK ROUTES
# ------------------------------------------------------------
@app.route("/growth", methods=["GET"])
def growth_endpoint():
    """
    Retourne les mesures de poids / taille / tour de tête.
    Exemple de réponse :

    [
        {"date":"2025-05-14","weight":3.6,"height":51,"head":36},
        {"date":"2025-05-17","weight":3.4,"height":51},
        ...
    ]
    """
    data = _parse_growth_sheet()
    return jsonify(data)


@app.route("/nutrition", methods=["GET"])
def nutrition_endpoint():
    """
    Retourne les données de l'onglet « Lait ».
    Exemple de réponse (simplifiée) :

    {
        "entries":[
            {"date":"2025-09-23","type":"biberon","ml":150,"hour":"04:00"},
            {"date":"2025-09-23","type":"biberon","ml":120,"hour":"03:00"},
            {"date":"2025-09-23","type":"tétée","ml":45,"hours":["21:30 à 21:45"],"source":"maternel"}
            …
        ],
        "weekly_average":812.14
    }
    """
    data = _parse_milk_sheet()
    return jsonify(data)


# ------------------------------------------------------------
#  LANCEMENT DU SERVEUR
# ------------------------------------------------------------
if __name__ == "__main__":
    # Vous pouvez choisir le port que vous voulez (ex. 5000)
    app.run(host="0.0.0.0", port=5000, debug=True)
