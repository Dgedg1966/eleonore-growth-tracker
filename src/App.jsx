// Ce code contient les corrections pour Éléonore
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ComposedChart } from 'recharts';
import { Baby, Scale, Ruler, Brain, Printer, TrendingUp, Droplets } from 'lucide-react';

// On importe les données officielles du fichier que tu viens de créer
import { omsTables } from './omsData';

const App = () => {
  const [activeTab, setActiveTab] = useState('growth');
  const [growthType, setGrowthType] = useState('weight'); // 'weight', 'height', ou 'head'

  // TES DONNÉES RÉELLES (À mettre à jour ici quand tu as de nouvelles mesures)
  const myMeasures = {
    weight: [
      { month: 0, current: 3.3 },
      { month: 1, current: 4.2 },
      { month: 3, current: 5.8 },
      { month: 6, current: 7.8 },
    ],
    height: [
      { month: 0, current: 50 },
      { month: 6, current: 70 },
    ],
    head: [
      { month: 0, current: 34 },
      { month: 6, current: 43.8 },
    ]
  };

  // FUSION DES DONNÉES OMS + TES MESURES
  const chartData = omsTables[growthType].map(omsPoint => {
    const myPoint = myMeasures[growthType].find(m => m.month === omsPoint.month);
    return { ...omsPoint, current: myPoint ? myPoint.current : null };
  });

  const renderGrowthChart = () => {
    const config = {
      weight: { color: "#0047FF", unit: "kg", label: "Poids" },
      height: { color: "#00C851", unit: "cm", label: "Taille" },
      head: { color: "#AA00FF", unit: "cm", label: "Périmètre" }
    };
    const active = config[growthType];

    return (
      <div className="h-[450px] w-full bg-white p-4 rounded-3xl border-2 border-slate-100">
        <ResponsiveContainer>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" label={{ value: 'Mois', position: 'insideBottom', offset: -5 }} />
            <YAxis unit={active.unit} domain={['auto', 'auto']} />
            <Tooltip />
            <Legend verticalAlign="top" />
            {/* Couloirs OMS très visibles */}
            <Area type="monotone" dataKey="p97" stroke="none" fill="#ff4444" fillOpacity={0.1} name="Limite Haute" />
            <Area type="monotone" dataKey="p50" stroke="none" fill="#00C851" fillOpacity={0.2} name="Médiane OMS" />
            <Area type="monotone" dataKey="p3" stroke="none" fill="#ff4444" fillOpacity={0.1} name="Limite Basse" />
            {/* Ta ligne d'Éléonore */}
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke={active.color} 
              strokeWidth={5} 
              dot={{ r: 8, fill: active.color, stroke: '#fff', strokeWidth: 3 }} 
              name={`Éléonore (${active.unit})`}
              connectNulls 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      <nav className="bg-slate-900 text-white p-5 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <Baby className="text-pink-400 w-8 h-8" />
          <h1 className="text-xl font-black italic">ÉLÉONORE TRACKER</h1>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 px-4 py-2 rounded-xl font-bold text-sm">Rapport PDF</button>
      </nav>

      <main className="max-w-5xl mx-auto p-4">
        {/* SÉLECTEUR D'ONGLET */}
        <div className="flex bg-slate-200 p-1.5 rounded-2xl mb-8 w-full md:w-fit mx-auto shadow-inner">
          <button onClick={() => setActiveTab('growth')} className={`flex-1 md:w-48 py-3 rounded-xl font-bold transition-all ${activeTab === 'growth' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>CROISSANCE</button>
          <button onClick={() => setActiveTab('nutrition')} className={`flex-1 md:w-48 py-3 rounded-xl font-bold transition-all ${activeTab === 'nutrition' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>NUTRITION</button>
        </div>

        {activeTab === 'growth' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderGrowthChart()}
            
            {/* BOUTONS DE SÉLECTION DE MESURE */}
            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => setGrowthType('weight')} className={`p-6 rounded-[32px] border-4 transition-all text-center ${growthType === 'weight' ? 'border-blue-600 bg-white shadow-xl scale-105' : 'border-transparent bg-slate-100 opacity-50'}`}>
                <Scale className="mx-auto mb-2 text-blue-600 w-8 h-8" />
                <span className="font-black text-lg text-slate-800">7.8 kg</span>
              </button>
              <button onClick={() => setGrowthType('height')} className={`p-6 rounded-[32px] border-4 transition-all text-center ${growthType === 'height' ? 'border-green-600 bg-white shadow-xl scale-105' : 'border-transparent bg-slate-100 opacity-50'}`}>
                <Ruler className="mx-auto mb-2 text-green-600 w-8 h-8" />
                <span className="font-black text-lg text-slate-800">70 cm</span>
              </button>
              <button onClick={() => setGrowthType('head')} className={`p-6 rounded-[32px] border-4 transition-all text-center ${growthType === 'head' ? 'border-purple-600 bg-white shadow-xl scale-105' : 'border-transparent bg-slate-100 opacity-50'}`}>
                <Brain className="mx-auto mb-2 text-purple-600 w-8 h-8" />
                <span className="font-black text-lg text-slate-800">43.8 cm</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 min-h-[500px]">
             <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Droplets className="text-blue-500"/> Historique Nutritionnel</h2>
             <p className="text-slate-500 italic mb-4">Chargement des données hebdomadaires (S29 - S03)...</p>
             {/* Le graphique nutritionnel sera ici dès que j'aurai ton Excel */}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;









