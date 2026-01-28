// src/App.jsx
import React, { useEffect, useState } from "react";
import { Baby } from "lucide-react";

import GrowthSection from "./GrowthSection";
import NutritionSection from "./NutritionSection";

/* -----------------------------------------------------------------
   Backend URL – vous avez indiqué https://eleonore-backend.onrender.com
   ----------------------------------------------------------------- */
const BACKEND_URL =
  "https://eleonore-backend.onrender.com";

/* -----------------------------------------------------------------
   Page d’accueil (welcome) – texte + 4 gros boutons
   ----------------------------------------------------------------- */
const Home = ({ goTo }) => (
  <section className="max-w-3xl mx-auto text-center py-12">
    <h1 className="text-3xl font-bold mb-6">Bienvenue !</h1>
    <p className="mb-8 text-lg">
      Ce dashboard vous permet de suivre la croissance et l’alimentation d’Éléonore
      en détail. Vous pouvez consulter ses courbes de croissance selon les
      standards OMS (WHO) ou CDC, ainsi que son historique de consommation de
      lait avec une analyse dynamique par période.
    </p>

    {/* ==== 1️⃣ Suivi de croissance ==== */}
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-2">Suivi de croissance</h2>
      <p className="mb-3 text-gray-600">
        Consultez les courbes de croissance d’Éléonore (poids, taille,
        périmètre crânien) comparées aux standards OMS et CDC.
      </p>
      <button
        onClick={() => goTo("growth")}
        className="inline-block px-6 py-2 bg-pink-600 text-white rounded-full font-semibold hover:bg-pink-700 transition"
      >
        Voir la croissance
      </button>
    </div>

    {/* ==== 2️⃣ Consommation de laits ==== */}
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-2">Consommation de laits</h2>
      <p className="mb-3 text-gray-600">
        Analysez la consommation de lait d’Éléonore avec visualisations
        dynamiques (globale, mensuelle, hebdomadaire, quotidienne).
      </p>
      <button
        onClick={() => goTo("nutrition")}
        className="inline-block px-6 py-2 bg-pink-600 text-white rounded-full font-semibold hover:bg-pink-700 transition"
      >
        Voir la nutrition
      </button>
    </div>

    {/* ==== 3️⃣ Création de rapports ==== */}
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-2">Création de rapports</h2>
      <p className="mb-3 text-gray-600">
        Téléchargez les rapports et exportez les données en CSV ou JSON.
        Les rapports, destinés au pédiatre, sont disponibles en français ou en
        anglais.
      </p>
      <button
        onClick={generateReport}
        className="inline-block px-6 py-2 bg-pink-600 text-white rounded-full font-semibold hover:bg-pink-700 transition"
      >
        Générer le rapport
      </button>
    </div>

    {/* ==== 4️⃣ Analyse ==== */}
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-2">Analyse</h2>
      <p className="mb-3 text-gray-600">
        Consultez la vélocité de croissance et les étapes de développement
        d’Éléonore.
      </p>
      <button
        onClick={() => goTo("analysis")}
        className="inline-block px-6 py-2 bg-pink-600 text-white rounded-full font-semibold hover:bg-pink-700 transition"
      >
        Aller à l’analyse
      </button>
    </div>
  </section>
);

/* -----------------------------------------------------------------
   Fonction de génération de rapport (JSON + CSV)
   ----------------------------------------------------------------- */
async function generateReport() {
  try {
    const [growthResp, nutriResp] = await Promise.all([
      fetch(`${BACKEND_URL}/growth`),
      fetch(`${BACKEND_URL}/nutrition`),
    ]);

    if (!growthResp.ok || !nutriResp.ok) throw new Error("Erreur API");

    const growth = await growthResp.json();
    const nutrition = await nutriResp.json();

    const report = { growth, nutrition };

    // ---- JSON ----
    const jsonBlob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const aJson = document.createElement("a");
    aJson.href = jsonUrl;
    aJson.download = "eleonore_report.json";
    aJson.click();
    URL.revokeObjectURL(jsonUrl);

    // ---- CSV (growth uniquement, à titre d’exemple) ----
    const csvRows = [
      ["date", "weight", "height", "head"],
      ...growth.map((r) => [
        r.date,
        r.weight ?? "",
        r.height ?? "",
        r.head ?? "",
      ]),
    ];
    const csvContent = csvRows.map((e) => e.join(",")).join("\n");
    const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const csvUrl = URL.createObjectURL(csvBlob);
    const aCsv = document.createElement("a");
    aCsv.href = csvUrl;
    aCsv.download = "eleonore_growth.csv";
    aCsv.click();
    URL.revokeObjectURL(csvUrl);
  } catch (e) {
    alert("Impossible de générer le rapport : " + e.message);
  }
}

/* -----------------------------------------------------------------
   Application principale
   ----------------------------------------------------------------- */
export default function App() {
  const [activeTab, setActiveTab] = useState("home"); // home | growth | nutrition | analysis
  const [selectedStandard, setSelectedStandard] = useState("oms"); // oms | cdc

  /* ------------------- Synchronisation URL ------------------- */
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/growth") setActiveTab("growth");
    else if (path === "/nutrition") setActiveTab("nutrition");
    else if (path === "/analysis") setActiveTab("analysis");
    else setActiveTab("home");
  }, []);

  const goTo = (tab) => {
    const newPath = tab === "home" ? "/" : `/${tab}`;
    window.history.pushState(null, "", newPath);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-gray-900">
      {/* ------------------- HEADER ------------------- */}
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

      {/* ------------------- NAVIGATION BUTTONS (only on home) ------------------- */}
      {activeTab === "home" && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => goTo("growth")}
            className="px-6 py-2 rounded-full bg-pink-600 text-white font-semibold shadow"
          >
            Croissance
          </button>
          <button
            onClick={() => goTo("nutrition")}
            className="px-6 py-2 rounded-full bg-pink-600 text-white font-semibold shadow"
          >
            Alimentation
          </button>
        </div>
      )}

      {/* ------------------- OMS / CDC SELECTOR (only on growth) ------------------- */}
      {activeTab === "growth" && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setSelectedStandard("oms")}
            className={`px-4 py-1 rounded mr-2 ${
              selectedStandard === "oms"
                ? "bg-pink-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            OMS
          </button>
          <button
            onClick={() => setSelectedStandard("cdc")}
            className={`px-4 py-1 rounded ${
              selectedStandard === "cdc"
                ? "bg-pink-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            CDC
          </button>
        </div>
      )}

      {/* ------------------- MAIN CONTENT ------------------- */}
      <main className="max-w-6xl mx-auto p-6">
        {activeTab === "home" && <Home goTo={goTo} />}

        {activeTab === "growth" && (
          <>
            {/* Bouton retour */}
            <button
              onClick={() => goTo("home")}
              className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              ← Retour à l’accueil
            </button>
            <GrowthSection selectedStandard={selectedStandard} />
          </>
        )}

        {activeTab === "nutrition" && (
          <>
            {/* Bouton retour */}
            <button
              onClick={() => goTo("home")}
              className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              ← Retour à l’accueil
            </button>
            <NutritionSection selectedStandard={selectedStandard} />
          </>
        )}

        {activeTab === "analysis" && (
          <>
            {/* Bouton retour */}
            <button
              onClick={() => goTo("home")}
              className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              ← Retour à l’accueil
            </button>
            <section className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Analyse détaillée</h2>
              <p className="text-gray-600">
                Cette page est un placeholder ; vous pouvez y intégrer
                l’analyse de la vélocité de croissance, les étapes de
                développement, etc.
              </p>
            </section>
          </>
        )}
      </main>

      {/* ------------------- FOOTER ------------------- */}
      <footer className="bg-gray-100 py-4 mt-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Éléonore Growth Tracker – Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}


























