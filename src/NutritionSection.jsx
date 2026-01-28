// src/NutritionSection.jsx
import React, { useEffect, useState } from "react";
import { Droplets } from "lucide-react";

import NutritionDashboard from "./NutritionDashboard";

/* -----------------------------------------------------------------
   Backend URL – fixed to the one you gave
   ----------------------------------------------------------------- */
const BACKEND_URL = "https://eleonore-backend.onrender.com";

/* -----------------------------------------------------------------
   Phases d’alimentation – dates (ISO YYYY‑MM‑DD) et libellés
   ----------------------------------------------------------------- */
const PHASES = [
  { label: "Intro Kabrita (Chèvre)", date: "2025-07-29" },
  { label: "Fin Kabrita (Chèvre)", date: "2025-08-09" },
  { label: "Transition Kendamil (Chèvre)", date: "2025-08-13" },

  { label: "Intro Aptamil (Vache)", date: "2025-07-29" },
  { label: "Fin Aptamil (Vache)", date: "2025-11-14" },

  { label: "Intro Kendamil (Chèvre)", date: "2025-11-11" },
  { label: "Fin Kendamil (Chèvre)", date: "2026-01-19" },

  { label: "Intro France Lait", date: "2025-12-16" },

  { label: "Introduction solides", date: "2025-12-02" },
  { label: "Fin des tétées", date: "2025-11-10" },
  { label: "Fin lait maternel biberon", date: "2025-10-23" }
];

/* -----------------------------------------------------------------
   Hook – fetch nutrition data from the backend
   ----------------------------------------------------------------- */
const useNutrition = () => {
  const [data, setData] = useState({ entries: [], weekly_average: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNutrition = async () => {
      try {
        const resp = await fetch(`${BACKEND_URL}/nutrition`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const json = await resp.json();
        // Ensure we always have the expected shape
        setData({
          entries: json.entries ?? [],
          weekly_average:
            json.weekly_average != null ? json.weekly_average : null
        });
        setError(null);
      } catch (e) {
        console.error(e);
        setError(e.message);
        setData({ entries: [], weekly_average: null });
      } finally {
        setLoading(false);
      }
    };
    fetchNutrition();
  }, []);

  return { data, loading, error };
};

/* -----------------------------------------------------------------
   NutritionSection component
   ----------------------------------------------------------------- */
export default function NutritionSection({ selectedStandard }) {
  const { data, loading, error } = useNutrition();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-600 mr-3"></div>
        <span>Chargement des données de nutrition…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 text-red-800 rounded">
        <h2 className="font-bold mb-2">Erreur de chargement</h2>
        <p>{error}</p>
        <p>
          Vérifiez que le backend est accessible :
          <a
            href={`${BACKEND_URL}/nutrition`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-pink-600 ml-2"
          >
            {BACKEND_URL}/nutrition
          </a>
        </p>
      </div>
    );
  }

  return (
    <section>
      {/* ---- Retour à l’accueil ---- */}
      <button
        onClick={() => {
          window.history.pushState(null, "", "/");
          window.location.reload(); // simple reload to go back to home
        }}
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        ← Retour à l’accueil
      </button>

      {/* ---- Dashboard ---- */}
      <div className="flex items-center gap-2 mb-4">
        <Droplets size={24} />
        <h2 className="text-xl font-semibold">Alimentation – Consommation de lait</h2>
      </div>

      <NutritionDashboard
        nutritionData={data.entries}
        phases={PHASES}
        weeklyAverage={data.weekly_average}
        selectedStandard={selectedStandard}   // (kept for consistency, not used inside)
      />
    </section>
  );
}
