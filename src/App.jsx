// src/App.jsx
import React, { useState } from "react";
import { Baby, Droplets, Plus } from "lucide-react";
import GrowthSection from "./GrowthSection";
import NutritionSection from "./NutritionSection";

const App = () => {
  // Onglet actif : "growth" ou "nutrition"
  const [activeTab, setActiveTab] = useState("growth");
  // Standard de référence : "oms" ou "cdc"
  const [selectedStandard, setSelectedStandard] = useState("oms");

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

      {/* ------------------- TAB SELECTOR ------------------- */}
      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={() => setActiveTab("growth")}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            activeTab === "growth"
              ? "bg-pink-600 text-white shadow"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Croissance
        </button>
        <button
          onClick={() => setActiveTab("nutrition")}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            activeTab === "nutrition"
              ? "bg-pink-600 text-white shadow"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Alimentation
        </button>
      </div>

      {/* ------------------- STANDARD SELECTOR (OMS / CDC) ------------------- */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Référence :</span>
          <button
            onClick={() => setSelectedStandard("oms")}
            className={`px-4 py-1 rounded ${
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
      </div>

      {/* ------------------- MAIN CONTENT ------------------- */}
      <main className="max-w-6xl mx-auto p-6">
        {activeTab === "growth" ? (
          <GrowthSection selectedStandard={selectedStandard} />
        ) : (
          <NutritionSection selectedStandard={selectedStandard} />
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
};

export default App;























