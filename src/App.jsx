// src/App.jsx
import React, { useEffect, useState } from "react";
import { Baby, Droplets, Plus } from "lucide-react";

import GrowthSection from "./GrowthSection";
import NutritionSection from "./NutritionSection";

/* -----------------------------------------------------------------
   Backend URL – peut être surchargée via REACT_APP_BACKEND_URL
   ----------------------------------------------------------------- */
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://eleonore-backend.onrender.com";

/* -----------------------------------------------------------------
   Home page – welcome + 4 big cards
   ----------------------------------------------------------------- */
const Home = () => (
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
      <a
        href="/growth"
        className="inline-block px-6 py-2 bg-pink-600 text-white rounded-full font-semibold hover:bg-pink-700 transition"
      >
        Voir la croissance
      </a>
    </div>

    {/* ==== 2️⃣ Consommation de laits ==== */}
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-2">Consommation de laits</h2>
      <p className="mb-3 text-gray-600">
        Analysez la consommation de lait d’Éléonore avec visualisations
        dynamiques (globale, mensuelle, hebdomadaire, quotidienne).
      </p>
      <a
        href="/nutrition"
        className="inline-block px-6 py-2 bg-pink-600 text-white rounded-full font-semibold hover:bg-pink-700 transition"
      >
        Voir la nutrition
      </a>
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
        disabled
        className="inline-block px-6 py-2 bg-gray-400 text-white rounded-full font-semibold cursor-not-allowed"
      >
        Générer le rapport (à implémenter)
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
        disabled
        className="inline-block px-6 py-2 bg-gray-400 text-white rounded-full font-semibold cursor-not-allowed"
      >
        Accéder à l’analyse (à implémenter)
      </button>
    </div>
  </section>
);

/* -----------------------------------------------------------------
   Main App component
   ----------------------------------------------------------------- */
export default function App() {
  /* ---------- Navigation state ---------- */
  const [activeTab, setActiveTab] = useState("home"); // home | growth | nutrition
  const [selectedStandard, setSelectedStandard] = useState("oms"); // oms | cdc

  /* ---------- Sync with URL ---------- */
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/growth") setActiveTab("growth");
    else if (path === "/nutrition") setActiveTab("nutrition");
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

      {/* ------------------- HOME / GROWTH / NUTRITION SELECTOR ------------------- */}
      {activeTab !== "home" && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => goTo("growth")}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              activeTab === "growth"
                ? "bg-pink-600 text-white shadow"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Croissance
          </button>
          <button
            onClick={() => goTo("nutrition")}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              activeTab === "nutrition"
                ? "bg-pink-600 text-white shadow"
                : "bg-gray-200 text-gray-800"
            }`}
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
        {activeTab === "home" && <Home />}

        {activeTab === "growth" && (
          <>
            {/* Back button */}
            <button
              onClick={() => goTo("home")}
              className="mb-4 flex items-center text-pink-600 hover:underline"
            >
              ← Retour à l’accueil
            </button>

            <GrowthSection selectedStandard={selectedStandard} />
          </>
        )}

        {activeTab === "nutrition" && (
          <>
            {/* Back button */}
            <button
              onClick={() => goTo("home")}
              className="mb-4 flex items-center text-pink-600 hover:underline"
            >
              ← Retour à l’accueil
            </button>

            <NutritionSection selectedStandard={selectedStandard} />
          </>
        )}
      </main>

      {/* ------------------- FOOTER ------------------- */}
      <footer className="bg-gray-100 py-4 mt-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Éléonore Growth Tracker – Tous droits
          réservés.
        </div>
      </footer>
    </div>
  );
}

























