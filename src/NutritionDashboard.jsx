// src/NutritionDashboard.jsx
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

/* ---------------------------------------------------------------
   Phases d’alimentation d’Éléonore
   - Les dates sont au format ISO (YYYY‑MM‑DD) pour matcher le
     format de `nutritionData` (ex. "2025-07-29").
   - Vous pouvez ajouter / retirer des phases ici sans toucher le
     reste du composant.
   --------------------------------------------------------------- */
const PHASES = [
  { label: "Intro Kabrita (Chèvre)", date: "2025-07-29" },
  { label: "Fin Kabrita (Chèvre)",   date: "2025-08-09" },
  { label: "Transition Kendamil (Chèvre)", date: "2025-08-13" },

  { label: "Intro Aptamil (Vache)", date: "2025-07-29" },
  { label: "Fin Aptamil (Vache)",   date: "2025-11-14" },

  { label: "Intro Kendamil (Chèvre)", date: "2025-11-11" },
  { label: "Fin Kendamil (Chèvre)",   date: "2026-01-19" },

  { label: "Intro France Lait", date: "2025-12-16" },

  { label: "Intro Solides", date: "2025-12-02" },

  { label: "Fin des tétées", date: "2025-11-10" },

  { label: "Fin lait maternel (biberon)", date: "2025-10-23" },
];

/* ---------------------------------------------------------------
   Petite fonction utilitaire – formatte la date pour l’Axe X
   --------------------------------------------------------------- */
const formatDate = (isoStr) => {
  const d = new Date(isoStr);
  // Retourne "dd/mm" (ex. "29/07")
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
};

/* ---------------------------------------------------------------
   Component
   --------------------------------------------------------------- */
const NutritionDashboard = ({ nutritionData }) => {
  // Si aucune donnée n’est fournie, on affiche un message simple.
  if (!nutritionData || nutritionData.length === 0) {
    return (
      <p className="text-center text-gray-500 py-10">
        Aucune donnée nutritionnelle disponible.
      </p>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: 500,
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center", fontFamily: "sans-serif" }}>
        Suivi Nutritionnel Éléonore
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={nutritionData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          {/* ------------------- Axe X (date) ------------------- */}
          <XAxis
            dataKey="date"
            minTickGap={40}
            tickFormatter={formatDate}
            style={{ fontSize: "12px" }}
          />

          {/* ------------------- Axe Y (ml) ------------------- */}
          <YAxis unit="ml" style={{ fontSize: "12px" }} />

          {/* ------------------- Tooltip ------------------- */}
          <Tooltip
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            }
          />

          {/* ------------------- Legend ------------------- */}
          <Legend />

          {/* ------------------- Phases (vertical lines) ------------------- */}
          {PHASES.map((phase) => (
            <ReferenceLine
              key={phase.label}
              x={phase.date}
              stroke="#8884d8"
              strokeDasharray="4 2"
              // Le label peut être soit une string, soit un objet custom.
              // Ici on utilise un petit composant inline pour le style.
              label={{
                value: phase.label,
                position: "top",
                fill: "#555",
                fontSize: 11,
                // Décalage vertical pour éviter qu’il chevauche le titre du chart
                dy: -8,
                // Rotation légère pour gagner de la place (facultatif)
                angle: -45,
                textAnchor: "middle",
              }}
            />
          ))}

          {/* ------------------- Areas (laits) ------------------- */}
          <Area
            type="monotone"
            dataKey="sein"
            stackId="1"
            stroke="#e91e63"
            fill="#f06292"
            name="Allaitement (Sein)"
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="maternelBib"
            stackId="1"
            stroke="#388e3c"
            fill="#81c784"
            name="Lait Maternel (Bib)"
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="kabrita"
            stackId="1"
            stroke="#ffa000"
            fill="#ffca28"
            name="Kabrita"
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="aptamil"
            stackId="1"
            stroke="#1976d2"
            fill="#64b5f6"
            name="Aptamil"
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="kendamil"
            stackId="1"
            stroke="#673ab7"
            fill="#9575cd"
            name="Kendamil"
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="franceLait"
            stackId="1"
            stroke="#455a64"
            fill="#90a4ae"
            name="France Lait"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NutritionDashboard;
