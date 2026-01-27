// src/NutritionSection.jsx
import React, { useEffect, useState } from "react";
import { Droplets, Plus } from "lucide-react";
import NutritionDashboard from "./NutritionDashboard";

/* ---------------------------------------------------------------
   URL du backend – vous pouvez la remplacer par une variable d’environnement
   --------------------------------------------------------------- */
const BACKEND_URL = "https://eleonore-backend.onrender.com";

/* ---------------------------------------------------------------
   Phases d’alimentation d’Éléonore
   - Chaque objet possède un `label` (texte affiché) et une `date` au format ISO (YYYY‑MM‑DD)
   - Ces phases seront dessinées comme des `ReferenceLine` dans NutritionDashboard
   --------------------------------------------------------------- */
const PHASES = [
  { label: "Intro Kabrita (Chèvre)",      date: "2025-07-29" },
  { label: "Fin Kabrita (Chèvre)",        date: "2025-08-09" },
  { label: "Transition Kendamil (Chèvre)",date: "2025-08-13" },

  { label: "Intro Aptamil (Vache)",       date: "2025-07-29" },
  { label: "Fin Aptamil (Vache)",         date: "2025-11-14" },

  { label: "Intro Kendamil (Chèvre)",     date: "2025-11-11" },
  { label: "Fin Kendamil (Chèvre)",       date: "2026-01-19" },

  { label: "Intro France Lait",           date: "2025-12-16" },

  { label: "Intro Solides",               date: "2025-12-02" },

  { label: "Fin des tétées",              date: "2025-11-10" },

  { label: "Fin lait maternel (biberon)", date: "2025-10-23" }
];

/* ---------------------------------------------------------------
   Hook personnalisé – fetch les données nutritionnelles
   --------------------------------------------------------------- */
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
        setData({
          entries: json.entries || [],
          weekly_average: json.weekly_average ?? null
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

/* ---------------------------------------------------------------
   NutritionSection – composant affiché quand l’onglet « Alimentation » est actif
   --------------------------------------------------------------- */
const NutritionSection = ({ selectedStandard }) => {
  const { data, loading, error } = useNutrition();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-600 mr-3"></div>
        <span>Chargement des données nutritionnelles…</span>
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
    <section className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Droplets size={24} />
        <h2 className="text-xl font-semibold">Alimentation – Consommation de lait</h2>
      </div>

      {/* -------------------------------------------------
          Le composant NutritionDashboard s’occupe du rendu du
          graphique et des lignes de phase.
         ------------------------------------------------- */}
      <NutritionDashboard
        nutritionData={data.entries}
        phases={PHASES}               // on transmet les phases
        weeklyAverage={data.weekly_average}
      />

      {/* -------------------------------------------------
          Informations complémentaires (facultatives)
         ------------------------------------------------- */}
      {data.weekly_average != null && (
        <p className="mt-4 text-center text-gray-700">
          <strong>Moyenne hebdomadaire (toutes les journées) :</strong>{" "}
          {Number(data.weekly_average).toFixed(2)} ml
        </p>
      )}
    </section>
  );
};

export default NutritionSection;
