// Ce code contient les corrections pour Éléonore
// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  Baby,
  Scale,
  Ruler,
  Brain,
  Droplets,
  Plus,
} from "lucide-react";

import NutritionDashboard from "./NutritionDashboard";

/* ------------------------------------------------------------------ */
/*  HELPERS – conversion du percentile (identique à votre version)   */
/* ------------------------------------------------------------------ */
const computePercentile = (latest, tables, growthType) => {
  if (!latest) return 0;
  const ref = tables[growthType][latest.month];
  if (!ref) return 0;
  const p50 = ref.p50;
  const p97 = ref.p97;
  const diff = p97 - p50 || 1; // éviter division par zéro
  const z = (latest.current - p50) / diff;
  // Approximation simple (0‑100 %) → on ramène à 50‑100 %
  const perc = Math.round(50 + 50 * Math.tanh(z));
  return Math.max(0, Math.min(100, perc));
};

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                   */
/* ------------------------------------------------------------------ */
export default function App() {
  /* ---------- STATE ---------- */
  const [activeTab, setActiveTab] = useState("growth"); // growth | nutrition
  const [growthType, setGrowthType] = useState("weight"); // weight | height | head
  const [chartStandard, setChartStandard] = useState("oms"); // oms | cdc

  const [myMeasures, setMyMeasures] = useState({
    weight: [],
    height: [],
    head: [],
  });

  const [dailyNutrition, setDailyNutrition] = useState([]);
  const [weeklyAverage, setWeeklyAverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  /* ---------- FETCH DATA ON MOUNT ---------- */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // ------- CROISSANCE -------
        const growthResp = await fetch(
          "https://YOUR_BACKEND_URL_ON_RENDER.com/growth"
        ); // <-- remplacez par votre URL Render
        if (!growthResp.ok) throw new Error("Growth endpoint failed");
        const growthData = await growthResp.json();

        // Réorganiser les mesures par type
        const measures = { weight: [], height: [], head: [] };
        growthData.forEach((row) => {
          const date = new Date(row.date).toISOString().split("T")[0];
          const month = Math.round(
            (new Date(date) - new Date("2025-05-14")) /
              (1000 * 60 * 60 * 24 * 30.4)
          );

          if (row.weight !== undefined) {
            measures.weight.push({ month, current: row.weight, date });
          }
          if (row.height !== undefined) {
            measures.height.push({ month, current: row.height, date });
          }
          if (row.head !== undefined) {
            measures.head.push({ month, current: row.head, date });
          }
        });
        setMyMeasures(measures);

        // ------- NUTRITION -------
        const nutriResp = await fetch(
          "https://YOUR_BACKEND_URL_ON_RENDER.com/nutrition"
        );
        if (!nutriResp.ok) throw new Error("Nutrition endpoint failed");
        const nutriJson = await nutriResp.json();
        setDailyNutrition(nutriJson.entries || []);
        setWeeklyAverage(nutriJson.weekly_average ?? null);
      } catch (e) {
        console.error(e);
        setErrorMsg(
          "Impossible de récupérer les données depuis le serveur. Vérifiez que le backend est bien déployé."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  /* ---------- TABLEAU DE CROISSANCE (OMS / CDC) ---------- */
  const tables =
    chartStandard === "oms"
      ? require("./growthData").omsTables
      : require("./growthData").cdcTables;

  const combinedGrowth = tables[growthType].map((ref) => {
    const measure = myMeasures[growthType].find((m) => m.month === ref.month);
    return {
      ...ref,
      current: measure ? measure.current : null,
    };
  });

  const latest = myMeasures[growthType][myMeasures[growthType].length - 1] || {
    current: 0,
    month: 0,
  };
  const percentile = computePercentile(latest, tables, growthType);

  /* ---------- RENDER ---------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Chargement des données…
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-800 p-4">
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-gray-900">
      {/* ----------------- NAVBAR ----------------- */}
      <nav className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-5 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Baby className="w-10 h-10" />
            <h1 className="text-2xl font-bold">
              Éléonore Growth Tracker
            </h1>
          </div>
          <span className="text-sm opacity-90">Famille seulement</span>
        </div>
      </nav>

      {/* ----------------- MAIN CONTENT ----------------- */}
      <main className="max-w-6xl mx-auto p-6">
        {/* ------- Onglet switch ------- */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-full shadow-md p-1">
            <button
              onClick={() => setActiveTab("growth")}
              className={`px-8 py-3 rounded-full font-semibold transition ${
                activeTab === "growth"
                  ? "bg-pink-600 text-white shadow"
                  : "text-gray-600 hover:bg-pink-50"
              }`}
            >
              Croissance
            </button>
            <button
              onClick={() => setActiveTab("nutrition")}
              className={`px-8 py-3 rounded-full font-semibold transition ${
                activeTab === "nutrition"
                  ? "bg-pink-600 text-white shadow"
                  : "text-gray-600 hover:bg-pink-50"
              }`}
            >
              Nutrition
            </button>
          </div>
        </div>

        {/* ==================== CROISSANCE ==================== */}
        {activeTab === "growth" && (
          <div className="space-y-8">
            {/* ------ Sélecteur OMS / CDC ------ */}
            <select
              value={chartStandard}
              onChange={(e) => setChartStandard(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm mx-auto block"
            >
              <option value="oms">OMS (recommandé 0‑2 ans)</option>
              <option value="cdc">CDC</option>
            </select>

            {/* ------ Boutons de type de mesure ------ */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setGrowthType("weight")}
                className={`p-6 rounded-xl shadow-lg ${
                  growthType === "weight"
                    ? "bg-pink-100 border-2 border-pink-500"
                    : "bg-white border border-gray-200"
                }`}
              >
                <Scale className="mx-auto mb-2 text-pink-600" size={32} />
                <div className="font-bold text-xl">
                  {latest.current} kg
                </div>
                <div className="text-sm text-gray-600">
                  P {percentile}
                </div>
              </button>

              <button
                onClick={() => setGrowthType("height")}
                className={`p-6 rounded-xl shadow-lg ${
                  growthType === "height"
                    ? "bg-green-100 border-2 border-green-500"
                    : "bg-white border border-gray-200"
                }`}
              >
                <Ruler className="mx-auto mb-2 text-green-600" size={32} />
                <div className="font-bold text-xl">
                  {latest.current} cm
                </div>
              </button>

              <button
                onClick={() => setGrowthType("head")}
                className={`p-6 rounded-xl shadow-lg ${
                  growthType === "head"
                    ? "bg-purple-100 border-2 border-purple-500"
                    : "bg-white border border-gray-200"
                }`}
              >
                <Brain className="mx-auto mb-2 text-purple-600" size={32} />
                <div className="font-bold text-xl">
                  {latest.current} cm
                </div>
              </button>
            </div>

            {/* ------ Graphique de la courbe ------ */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-center">
                Courbe{" "}
                {growthType === "weight"
                  ? "Poids"
                  : growthType === "height"
                  ? "Taille"
                  : "Périmètre crânien"}
              </h2>
              <div className="h-80">
                <ResponsiveContainer>
                  <ComposedChart data={combinedGrowth}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="month"
                      label={{
                        value: "Âge (mois)",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Area
                      dataKey="p97"
                      fill="#fecaca"
                      fillOpacity={0.3}
                      stroke="none"
                      name="P97"
                    />
                    <Area
                      dataKey="p50"
                      fill="#86efac"
                      fillOpacity={0.4}
                      stroke="none"
                      name="Médiane"
                    />
                    <Area
                      dataKey="p3"
                      fill="#fecaca"
                      fillOpacity={0.3}
                      stroke="none"
                      name="P3"
                    />
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="#ec4899"
                      strokeWidth={5}
                      dot={{
                        r: 6,
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      name="Éléonore"
                      connectNulls
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ------ Formulaire d’ajout d’une mesure (optionnel) ------ */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Ajouter une mesure
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Vous pouvez garder cette partie si vous voulez
                  // persister les nouvelles mesures côté client.
                }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <input
                  type="date"
                  name="date"
                  required
                  className="p-3 border rounded-lg"
                />
                <input
                  type="number"
                  name="value"
                  step="0.1"
                  placeholder="Valeur"
                  required
                  className="p-3 border rounded-lg"
                />
                <button
                  type="submit"
                  className="bg-pink-600 text-white font-semibold py-3 rounded-lg hover:bg-pink-700 transition"
                >
                  Enregistrer
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== NUTRITION ==================== */}
        {activeTab === "nutrition" && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <Droplets className="text-blue-500" /> Nutrition quotidienne
            </h2>

            {/* Si vous avez déjà un composant NutritionDashboard qui attend
                `nutritionData` sous forme de tableau, on le ré‑utilise ici. */}
            {dailyNutrition.length > 0 ? (
              <NutritionDashboard nutritionData={dailyNutrition} />
            ) : (
              <p className="text-center text-gray-500 py-10">
                Aucune donnée nutritionnelle disponible.
              </p>
            )}

            {/* Affichage de la moyenne hebdomadaire (facultatif) */}
            {weeklyAverage !== null && (
              <p className="mt-4 text-center text-gray-700">
                Moyenne quotidienne de la semaine :{" "}
                <strong>{weeklyAverage.toFixed(2)} ml</strong>
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
















