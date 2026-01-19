// Ce code contient les corrections pour Éléonore
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ComposedChart } from 'recharts';
import { Baby, Scale, Ruler, Brain, Printer, Droplets } from 'lucide-react';
import { omsTables } from './omsData';
import { nutritionData } from './nutritionData'; // Import du nouveau fichier

const App = () => {
  const [activeTab, setActiveTab] = useState('growth');
  const [growthType, setGrowthType] = useState('weight');

  // Tes mesures de croissance
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
      {/* Navigation identique à ton souhait */}
      <nav className="bg-slate-900 text-white p-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Baby className="text-pink-400 w-8 h-8" />
          <h1 className="text-xl font-black uppercase tracking-tighter">Éléonore Tracker</h1>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-sm">PDF</button>
      </nav>

      <main className="max-w-6xl mx-auto p-4">
        <div className="flex bg-slate-200 p-1.5 rounded-2xl mb-8 w-fit mx-auto shadow-inner">
          <button onClick={() => setActiveTab('growth')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'growth' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>CROISSANCE</button>
          <button onClick={() => setActiveTab('nutrition')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'nutrition' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>NUTRITION DÉTAILLÉE</button>
        </div>

        {activeTab === 'growth' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 italic">Analyse {growthType} vs Courbes OMS</h3>
              <div className="h-96 w-full">
                <ResponsiveContainer>
                  <ComposedChart data={combinedGrowth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Area type="monotone" dataKey="p97" stroke="none" fill="#fee2e2" fillOpacity={0.6} name="P97 (Haut)" />
                    <Area type="monotone" dataKey="p50" stroke="none" fill="#dcfce7" fillOpacity={0.6} name="P50 (Médiane)" />
                    <Line type="monotone" dataKey="current" stroke="#2563eb" strokeWidth={5} dot={{r: 8, fill: '#2563eb', stroke: '#fff', strokeWidth: 3}} connectNulls name="Éléonore" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => setGrowthType('weight')} className={`p-5 rounded-3xl border-4 transition-all ${growthType === 'weight' ? 'border-blue-600 bg-white' : 'border-transparent bg-slate-100 opacity-50'}`}>
                <Scale className="mx-auto mb-2 text-blue-600" />
                <p className="font-black text-center">Poids</p>
              </button>
              <button onClick={() => setGrowthType('height')} className={`p-5 rounded-3xl border-4 transition-all ${growthType === 'height' ? 'border-green-600 bg-white' : 'border-transparent bg-slate-100 opacity-50'}`}>
                <Ruler className="mx-auto mb-2 text-green-600" />
                <p className="font-black text-center">Taille</p>
              </button>
              <button onClick={() => setGrowthType('head')} className={`p-5 rounded-3xl border-4 transition-all ${growthType === 'head' ? 'border-purple-600 bg-white' : 'border-transparent bg-slate-100 opacity-50'}`}>
                <Brain className="mx-auto mb-2 text-purple-600" />
                <p className="font-black text-center">Tête</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Droplets className="text-blue-500" /> Historique de Consommation Précis</h3>
            <div className="h-[500px] w-full">
              <ResponsiveContainer>
                <AreaChart data={detailedNutrition}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis unit="ml" width={40} />
                  <Tooltip labelStyle={{fontWeight: 'bold'}} />
                  <Legend iconType="circle" />
                  {/* Couleurs saturées et empilement précis */}
                  <Area type="monotone" dataKey="sein" stackId="1" stroke="#ec4899" fill="#fbcfe8" name="Allaitement Sein" fillOpacity={0.9} />
                  <Area type="monotone" dataKey="bib" stackId="1" stroke="#f43f5e" fill="#fda4af" name="Lait Maternel (Biberon)" fillOpacity={0.9} />
                  <Area type="monotone" dataKey="kabrita" stackId="1" stroke="#f59e0b" fill="#fde68a" name="Kabrita (Chèvre)" fillOpacity={0.9} />
                  <Area type="monotone" dataKey="kendamil" stackId="1" stroke="#3b82f6" fill="#bfdbfe" name="Kendamil (Chèvre)" fillOpacity={0.9} />
                  <Area type="monotone" dataKey="vache" stackId="1" stroke="#475569" fill="#94a3b8" name="Lait de Vache" fillOpacity={0.9} />
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












