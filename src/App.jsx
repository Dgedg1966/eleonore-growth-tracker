// Ce code contient les corrections pour Éléonore
import { useState } from 'react'
import { Baby, Scale, Ruler, Brain, FileText, Printer, TrendingUp, Calendar } from 'lucide-react'

function App() {
  // DONNÉES CORRIGÉES
  const currentData = {
    name: "Éléonore",
    weight: "7,8 kg",
    height: "70 cm",
    headCirc: "43,8 cm",
    percentile: "50e-75e (Moyenne Haute)",
    startDate: "29 Juillet 2025",
    totalDays: 119,
    avgMilk: "840 ml"
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Baby className="w-8 h-8 text-pink-500" />
            <h1 className="text-xl font-bold tracking-tight">Growth Tracker</h1>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Exporter PDF
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* CARDS RÉSUMÉ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Scale className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Poids actuel</p>
              <p className="text-2xl font-bold">{currentData.weight}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Ruler className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Taille (Corrigée)</p>
              <p className="text-2xl font-bold">{currentData.height}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Périmètre Crânien</p>
              <p className="text-2xl font-bold">{currentData.headCirc}</p>
            </div>
          </div>
        </div>

        {/* ANALYSE OMS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-50 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="font-bold text-lg">Analyse de Croissance OMS</h2>
          </div>
          <div className="p-6 bg-green-50/50">
            <p className="text-green-800 leading-relaxed">
              À <strong>{currentData.weight}</strong>, Éléonore se situe parfaitement entre le 50e et le 75e percentile. 
              Sa croissance est vigoureuse et régulière depuis sa naissance. Aucun signe de ralentissement détecté.
            </p>
          </div>
        </div>

        {/* NUTRITION & HISTORIQUE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-lg">Bilan Nutritionnel Long Terme</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text

}


export default App
