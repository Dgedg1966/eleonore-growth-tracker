// Ce code contient les corrections pour Éléonore
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ComposedChart } from 'recharts';
import { Baby, Scale, Ruler, Brain, Printer, Droplets, Calendar } from 'lucide-react';
import { omsTables } from './omsData';

const App = () => {
  const [activeTab, setActiveTab] = useState('growth');
  const [growthType, setGrowthType] = useState('weight');

  // DONNÉES DE NUTRITION (Fusion de ton historique complet)
  const nutritionData = [
    { date: 'Août', sein: 400, bib: 200, kabrita: 300, kendamil: 0, vache: 0 },
    { date: 'Sept', sein: 200, bib: 100, kabrita: 500, kendamil: 0, vache: 0 },
    { date: 'Oct', sein: 50, bib: 0, kabrita: 200, kendamil: 600, vache: 0 },
    { date: 'Nov', sein: 0, bib: 0, kabrita: 0, kendamil: 740, vache: 100 },
    { date: 'Déc', sein: 0, bib: 0, kabrita: 0, kendamil: 840, vache: 0 },
    { date: 'Jan', sein: 0, bib: 0, kabrita: 0, kendamil: 820, vache: 50 },
  ];

  // TES MESURES RÉELLES
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
          <h1 className="text-xl font-black uppercase">Éléonore Tracker</h1>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-sm">PDF</button>
      </nav>

      <main className="max-w-5xl mx-auto p-4">
        <div className="flex bg-slate-200 p-1.5 rounded-2xl mb-8 w-fit mx-auto shadow-inner">
          <button onClick={() => setActiveTab('growth')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'growth' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>CROISSANCE</button>
          <button onClick={() => setActiveTab('nutrition')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'nutrition' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>NUTRITION</button>
        </div>

        {activeTab === 'growth' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 italic">Courbe de {growthType === 'weight' ? 'Poids' : growthType === 'height' ? 'Taille' : 'Périmètre'} vs OMS</h3>
              <div className="h-96 w-full">
                <ResponsiveContainer>
                  <ComposedChart data={combinedGrowth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{fontWeight: 'bold'}} />
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
              <button onClick={() => setGrowthType('weight')} className={`p-5 rounded-3xl border-4 transition-all ${growthType === 'weight' ? 'border-blue-600 bg-white' : 'border-transparent bg-slate-100'}`}>
                <Scale className="mx-auto mb-2 text-blue-600" />
                <p className="font-black text-center">7.8 kg</p>
              </button>
              <button onClick={() => setGrowthType('height')} className={`p-5 rounded-3xl border-4 transition-all ${growthType === 'height' ? 'border-green-600 bg-white' : 'border-transparent bg-slate-100'}`}>
                <Ruler className="mx-auto mb-2 text-green-600" />
                <p className="font-black text-center">70 cm</p>
              </button>
              <button onClick={() => setGrowthType('head')} className={`p-5 rounded-3xl border-4 transition-all ${growthType === 'head' ? 'border-purple-600 bg-white' : 'border-transparent bg-slate-100'}`}>
                <Brain className="mx-auto mb-2 text-purple-600" />
                <p className="font-black text-center">43.8 cm</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Droplets className="text-blue-500" /> Détail des Apports (Mensuel)</h3>
            <div className="h-[450px] w-full">
              <ResponsiveContainer>
                <AreaChart data={nutritionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{fontWeight: 'bold'}} />
                  <YAxis unit="ml" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="sein" stackId="1" stroke="#ec4899" fill="#fbcfe8" name="Allaitement Sein" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="bib" stackId="1" stroke="#f43f5e" fill="#fda4af" name="Lait Maternel (Bib)" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="kabrita" stackId="1" stroke="#f59e0b" fill="#fde68a" name="Kabrita" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="kendamil" stackId="1" stroke="#3b82f6" fill="#bfdbfe" name="Kendamil" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="vache" stackId="1" stroke="#64748b" fill="#e2e8f0" name="Lait de Vache" fillOpacity={0.8} />
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










