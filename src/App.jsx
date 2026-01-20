// Ce code contient les corrections pour Éléonore
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ComposedChart } from 'recharts';
import { Baby, Scale, Ruler, Brain, Printer, Droplets } from 'lucide-react';

// Importation des fichiers que nous avons déjà générés
import { omsTables } from './omsData';
import { dailyNutrition } from './nutritionData'; // Ton fichier avec chaque jour

const App = () => {
  const [activeTab, setActiveTab] = useState('growth');
  const [growthType, setGrowthType] = useState('weight');

  // TES MESURES DE CROISSANCE
  const myMeasures = {
    weight: [{ month: 0, current: 3.3 }, { month: 1, current: 4.2 }, { month: 3, current: 5.8 }, { month: 6, current: 7.8 }],
    height: [{ month: 0, current: 50 }, { month: 6, current: 70 }],
    head: [{ month: 0, current: 34 }, { month: 6, current: 43.8 }]
  };

  const combinedGrowth = omsTables[growthType].map(oms => ({
    ...oms,
    current: myMeasures[growthType].find(m => m.month === oms.month)?.current || null
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      <nav className="bg-slate-900 text-white p-5 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <Baby className="text-pink-400 w-8 h-8" />
          <h1 className="text-xl font-black uppercase tracking-tighter">Éléonore Analytics</h1>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-sm">Rapport PDF</button>
      </nav>

      <main className="max-w-6xl mx-auto p-4">
        {/* SÉLECTEUR D'ONGLET PRINCIPAL */}
        <div className="flex bg-slate-200 p-1.5 rounded-2xl mb-8 w-fit mx-auto shadow-inner">
          <button onClick={() => setActiveTab('growth')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'growth' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>CROISSANCE</button>
          <button onClick={() => setActiveTab('nutrition')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'nutrition' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>NUTRITION</button>
        </div>

        {activeTab === 'growth' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 italic">Courbe de {growthType === 'weight' ? 'Poids' : growthType === 'height' ? 'Taille' : 'Périmètre'} vs Médiane OMS</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer>
                  <ComposedChart data={combinedGrowth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{fontWeight: 'bold'}} />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    {/* Zones OMS avec couleurs vives */}
                    <Area type="monotone" dataKey="p97" stroke="none" fill="#FF5252" fillOpacity={0.2} name="Limite Haute (P97)" />
                    <Area type="monotone" dataKey="p50" stroke="none" fill="#4CAF50" fillOpacity={0.3} name="Médiane (P50)" />
                    <Area type="monotone" dataKey="p3" stroke="none" fill="#FF5252" fillOpacity={0.2} name="Limite Basse (P3)" />
                    <Line type="monotone" dataKey="current" stroke="#2563eb" strokeWidth={5} dot={{r: 8, fill: '#2563eb', stroke: '#fff', strokeWidth: 3}} connectNulls name="Éléonore" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => setGrowthType('weight')} className={`p-6 rounded-3xl border-4 transition-all ${growthType === 'weight' ? 'border-blue-600 bg-white shadow-xl' : 'border-transparent bg-slate-100 opacity-60'}`}>
                <Scale className="mx-auto mb-2 text-blue-600" />
                <p className="font-black text-center text-lg">7.8 kg</p>
              </button>
              <button onClick={() => setGrowthType('height')} className={`p-6 rounded-3xl border-4 transition-all ${growthType === 'height' ? 'border-green-600 bg-white shadow-xl' : 'border-transparent bg-slate-100 opacity-60'}`}>
                <Ruler className="mx-auto mb-2 text-green-600" />
                <p className="font-black text-center text-lg">70 cm</p>
              </button>
              <button onClick={() => setGrowthType('head')} className={`p-6 rounded-3xl border-4 transition-all ${growthType === 'head' ? 'border-purple-600 bg-white shadow-xl' : 'border-transparent bg-slate-100 opacity-60'}`}>
                <Brain className="mx-auto mb-2 text-purple-600" />
                <p className="font-black text-center text-lg">43.8 cm</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Droplets className="text-blue-500" /> Historique Quotidien Complet</h3>
            <div className="h-[500px] w-full">
              <ResponsiveContainer>
                <AreaChart data={dailyNutrition}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" hide={false} tick={{fontSize: 10}} interval={7} />
                  <YAxis unit="ml" />
                  <Tooltip />
                  <Legend />
                  {/* Tous tes laits avec couleurs saturées */}
                  <Area type="monotone" dataKey="allaitement" stackId="1" stroke="#D81B60" fill="#F06292" fillOpacity={0.9} name="Allaitement (Sein)" />
                  <Area type="monotone" dataKey="maternelBib" stackId="1" stroke="#E91E63" fill="#F48FB1" fillOpacity={0.8} name="Lait Maternel (Bib)" />
                  <Area type="monotone" dataKey="kabrita" stackId="1" stroke="#FF8F00" fill="#FFD54F" fillOpacity={0.9} name="Kabrita" />
                  <Area type="monotone" dataKey="kendamil" stackId="1" stroke="#1565C0" fill="#64B5F6" fillOpacity={0.9} name="Kendamil" />
                  <Area type="monotone" dataKey="vache" stackId="1" stroke="#455A64" fill="#B0BEC5" fillOpacity={0.9} name="Lait de Vache" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;














