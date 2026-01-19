// Ce code contient les corrections pour Éléonore
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ComposedChart } from 'recharts';
import { Baby, Scale, Ruler, Brain, Printer, TrendingUp, Droplets, Calendar } from 'lucide-react';

// Importation des données (Une fois les fichiers créés)
// import { omsTables } from './omsData';
// import { measures } from './babyMeasures';

const App = () => {
  const [activeTab, setActiveTab] = useState('growth');
  const [growthType, setGrowthType] = useState('weight');

  // DONNÉES NUTRITION HEBDOMADAIRES (Exemple à remplacer par ton Excel)
  const nutritionWeekly = [
    { week: 'S29', maternel: 840, chevre: 0, vache: 0 },
    { week: 'S32', maternel: 500, chevre: 200, vache: 140 },
    { week: 'S35', maternel: 200, chevre: 440, vache: 200 },
    { week: 'S38', maternel: 50, chevre: 640, vache: 150 },
    { week: 'S41', maternel: 0, chevre: 840, vache: 0 },
    { week: 'S44', maternel: 0, chevre: 820, vache: 0 },
  ];

  const renderGrowthChart = () => {
    // Couleurs ultra-saturées pour visibilité
    const colors = {
      weight: { line: "#0047FF", p50: "#00C851", p85: "#ffbb33", bg: "#f0f7ff" },
      height: { line: "#007E33", p50: "#00C851", p85: "#ffbb33", bg: "#f1f8f1" },
      head: { line: "#AA00FF", p50: "#00C851", p85: "#ffbb33", bg: "#f9f0ff" }
    };
    
    const c = colors[growthType];

    return (
      <div className="h-96 w-full bg-white rounded-3xl p-2">
        <ResponsiveContainer>
          <ComposedChart data={growthData[growthType]}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{fill: '#475569', fontWeight: 'bold'}} />
            <YAxis tick={{fill: '#475569'}} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{borderRadius: '15px', border: '2px solid #E2E8F0'}} />
            <Legend verticalAlign="top" iconType="circle" />
            {/* Zones Percentiles OMS avec couleurs plus marquées */}
            <Area type="monotone" dataKey="p97" stroke="none" fill="#ff4444" fillOpacity={0.15} name="Zone Alerte Haute" />
            <Area type="monotone" dataKey="p50" stroke="none" fill="#00C851" fillOpacity={0.2} name="Médiane OMS" />
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke={c.line} 
              strokeWidth={5} 
              dot={{r: 8, fill: c.line, stroke: '#fff', strokeWidth: 3}} 
              name={`Mesure Éléonore`} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-20">
      <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-pink-500 p-2 rounded-lg">
            <Baby className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter">Éléonore Intelligence</h1>
        </div>
        <button onClick={() => window.print()} className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm">PDF</button>
      </nav>

      <main className="max-w-5xl mx-auto p-4 md:p-6">
        {/* SÉLECTEUR DE MODE */}
        <div className="flex bg-slate-200 p-1 rounded-2xl mb-6 shadow-inner">
          <button onClick={() => setActiveTab('growth')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'growth' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>CROISSANCE</button>
          <button onClick={() => setActiveTab('nutrition')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'nutrition' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>NUTRITION HEBDO</button>
        </div>

        {activeTab === 'growth' ? (
          <div className="space-y-6">
            {renderGrowthChart()}
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setGrowthType('weight')} className={`p-4 rounded-2xl border-4 transition-all ${growthType === 'weight' ? 'border-blue-600 bg-white shadow-lg' : 'border-transparent opacity-60'}`}>
                <Scale className="mx-auto mb-1 text-blue-600" />
                <p className="text-[10px] font-bold text-center">POIDS</p>
              </button>
              <button onClick={() => setGrowthType('height')} className={`p-4 rounded-2xl border-4 transition-all ${growthType === 'height' ? 'border-green-600 bg-white shadow-lg' : 'border-transparent opacity-60'}`}>
                <Ruler className="mx-auto mb-1 text-green-600" />
                <p className="text-[10px] font-bold text-center">TAILLE</p>
              </button>
              <button onClick={() => setGrowthType('head')} className={`p-4 rounded-2xl border-4 transition-all ${growthType === 'head' ? 'border-purple-600 bg-white shadow-lg' : 'border-transparent opacity-60'}`}>
                <Brain className="mx-auto mb-1 text-purple-600" />
                <p className="text-[10px] font-bold text-center">TÊTE</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 underline decoration-blue-500 underline-offset-8">
              <Droplets className="text-blue-500" /> CONSOMMATION PAR SEMAINE
            </h3>
            <div className="h-96 w-full">
              <ResponsiveContainer>
                <AreaChart data={nutritionWeekly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tick={{fontWeight: 'bold'}} />
                  <YAxis unit="ml" />
                  <Tooltip cursor={{stroke: '#3b82f6', strokeWidth: 2}} />
                  <Legend />
                  <Area type="monotone" dataKey="maternel" stackId="1" stroke="#E91E63" fill="#F06292" fillOpacity={0.9} name="Maternel" />
                  <Area type="monotone" dataKey="chevre" stackId="1" stroke="#0091EA" fill="#4FC3F7" fillOpacity={0.9} name="Chèvre" />
                  <Area type="monotone" dataKey="vache" stackId="1" stroke="#455A64" fill="#90A4AE" fillOpacity={0.9} name="Vache" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Données OMS simulées (en attendant ton fichier séparé)
const growthData = {
  weight: [
    { month: 'Naiss.', current: 3.3, p50: 3.2, p97: 4.2 },
    { month: 'M3', current: 5.8, p50: 5.8, p97: 7.2 },
    { month: 'M6', current: 7.8, p50: 7.3, p97: 9.2 }
  ],
  height: [
    { month: 'Naiss.', current: 50, p50: 49.1, p97: 52.9 },
    { month: 'M6', current: 70, p50: 65.7, p97: 70.3 }
  ],
  head: [
    { month: 'Naiss.', current: 34, p50: 33.9, p97: 35.9 },
    { month: 'M6', current: 43.8, p50: 42.2, p97: 44.3 }
  ]
};

export default App;







