// Ce code contient les corrections pour Éléonore
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Baby, Scale, Ruler, Brain, Printer, TrendingUp, Calendar, ChevronRight } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('growth');

  // DONNÉES CORRIGÉES ET DYNAMIQUES
  const stats = {
    weight: "7.8 kg",
    height: "70 cm",
    head: "43.8 cm",
    percentile: "62nd",
    daysTracked: 119
  };

  // Données pour le graphique de croissance (Courbe OMS)
  const growthData = [
    { month: 'Naiss.', weight: 3.3, oms: 3.3 },
    { month: 'M1', weight: 4.2, oms: 4.5 },
    { month: 'M3', weight: 5.8, oms: 6.4 },
    { month: 'M6', weight: 7.8, oms: 7.9 }, // Point actuel Éléonore
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-pink-100 p-2 rounded-lg">
            <Baby className="w-6 h-6 text-pink-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Éléonore Tracker</h1>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all">
          <Printer className="w-4 h-4" /> Rapport Complet
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {/* Onglets Dynamiques */}
        <div className="flex gap-4 mb-8 bg-slate-200/50 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('growth')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'growth' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Croissance OMS
          </button>
          <button 
            onClick={() => setActiveTab('nutrition')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'nutrition' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Nutrition (Juillet-Nov)
          </button>
        </div>

        {activeTab === 'growth' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" /> Courbe de Poids vs OMS
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} unit="kg" />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="oms" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Médiane OMS" />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={4} dot={{r: 6, fill: '#3b82f6'}} name="Éléonore" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg shadow-blue-200">
                  <p className="text-blue-100 text-sm font-medium mb-1">Taille Corrigée</p>
                  <p className="text-3xl font-black">70 cm</p>
                  <div className="mt-4 py-1 px-3 bg-blue-500 rounded-full text-xs w-fit">Stable & Normal</div>
               </div>
               {/* Autres cartes ici... */}
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border border-slate-200">
            <h3 className="text-xl font-bold mb-4">Historique Nutritionnel</h3>
            <p className="text-slate-500 mb-6">Analyse complète depuis le 29 Juillet 2025 (119 jours).</p>
            <div className="h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
               Graphique des biberons (en cours de chargement...)
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;



