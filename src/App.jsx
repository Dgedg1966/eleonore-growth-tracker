// Ce code contient les corrections pour Éléonore
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ComposedChart } from 'recharts';
import { Baby, Scale, Ruler, Brain, Printer, TrendingUp, Droplets } from 'lucide-react';

// On importe tes fichiers de données existants
import { omsTables } from './omsData';
import { nutritionData } from './nutritionData'; // Assure-toi que l'export dans ton fichier s'appelle nutritionData ou adapte ici

const App = () => {
  const [activeTab, setActiveTab] = useState('growth');
  const [growthType, setGrowthType] = useState('weight');

  // TES MESURES DE CROISSANCE
  const myMeasures = {
    weight: [{ month: 0, current: 3.3 }, { month: 1, current: 4.2 }, { month: 3, current: 5.8 }, { month: 6, current: 7.8 }],
    height: [{ month: 0, current: 50 }, { month: 6, current: 70 }],
    head: [{ month: 0, current: 34 }, { month: 6, current: 43.8 }]
  };

  // Fusion pour le graphique de croissance
  const growthChartData = omsTables[growthType].map(omsPoint => {
    const myPoint = myMeasures[growthType].find(m => m.month === omsPoint.month);
    return { ...omsPoint, current: myPoint ? myPoint.current : null };
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10 font-sans">
      <nav className="bg-slate-900 text-white p-5 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <Baby className="text-pink-400 w-8 h-8" />
          <h1 className="text-xl font-black italic uppercase">Éléonore Analytics</h1>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 px-4 py-2 rounded-xl font-bold text-sm">EXPORT PDF</button>
      </nav>

      <main className="max-w-5xl mx-auto p-4">
        {/* SÉLECTEUR D'ONGLET */}
        <div className="flex bg-slate-200 p-1.5 rounded-2xl mb-8 w-full md:w-fit mx-auto shadow-inner">
          <button onClick={() => setActiveTab('growth')} className={`flex-1 md:w-48 py-3 rounded-xl font-bold transition-all ${activeTab === 'growth' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>CROISSANCE</button>
          <button onClick={() => setActiveTab('nutrition')} className={`flex-1 md:w-48 py-3 rounded-xl font-bold transition-all ${activeTab === 'nutrition' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>NUTRITION</button>
        </div>

        {activeTab === 'growth' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="h-[450px] w-full bg-white p-6 rounded-[40px] shadow-sm border border-slate-200">
               <h3 className="text-lg font-black mb-4 flex items-center gap-2"><TrendingUp className="text-blue-500"/> Courbes de Percentiles OMS</h3>
               <ResponsiveContainer>
                <ComposedChart data={growthChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{fontWeight: 'bold'}} />
                  <YAxis unit={growthType === 'weight' ? 'kg' : 'cm'} />
                  <Tooltip />
                  <Legend verticalAlign="top" />
                  <Area type="monotone" dataKey="p97" stroke="none" fill="#ff4444" fillOpacity={0.15} name="P97 (Alerte)" />
                  <Area type="monotone" dataKey="p50" stroke="none" fill="#00C851" fillOpacity={0.25} name="Médiane OMS" />
                  <Area type="monotone" dataKey="p3" stroke="none" fill="#ff4444" fillOpacity={0.15} name="P3 (Alerte)" />
                  <Line type="monotone" dataKey="current" stroke={growthType === 'weight' ? '#0047FF' : '#00C851'} strokeWidth={6} dot={{r: 8, fill: '#fff', strokeWidth: 4}} connectNulls name="Éléonore" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => setGrowthType('weight')} className={`p-6 rounded-[32px] border-4 transition-all ${growthType === 'weight' ? 'border-blue-600 bg-white' : 'border-transparent opacity-40 bg-slate-100'}`}>
                <Scale className="mx-auto mb-2 text-blue-600 w-8 h-8" /><span className="font-black">7.8 kg</span>
              </button>
              <button onClick={() => setGrowthType('height')} className={`p-6 rounded-[32px] border-4 transition-all ${growthType === 'height' ? 'border-green-600 bg-white' : 'border-transparent opacity-40 bg-slate-100'}`}>
                <Ruler className="mx-auto mb-2 text-green-600 w-8 h-8" /><span className="font-black">70 cm</span>
              </button>
              <button onClick={() => setGrowthType('head')} className={`p-6 rounded-[32px] border-4 transition-all ${growthType === 'head' ? 'border-purple-600 bg-white' : 'border-transparent opacity-40 bg-slate-100'}`}>
                <Brain className="mx-auto mb-2 text-purple-600 w-8 h-8" /><span className="font-black">43.8 cm</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-200 animate-in fade-in duration-500">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Droplets className="text-blue-500"/> Détail de la Consommation</h3>
            <div className="h-[500px] w-full">
              <ResponsiveContainer>
                <AreaChart data={nutritionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" /> 
                  <YAxis unit="ml" />
                  <Tooltip />
                  <Legend />
                  {/* J'utilise ici les clés que l'on voit sur ton graphique (Allaitement, Kabrita, etc.) */}
                  <Area type="monotone" dataKey="allaitement" stackId="1" stroke="#ec4899" fill="#fbcfe8" fillOpacity={0.8} name="Allaitement (Sein)" />
                  <Area type="monotone" dataKey="maternel" stackId="1" stroke="#d946ef" fill="#f5d0fe" fillOpacity={0.8} name="Lait Maternel (Bib)" />
                  <Area type="monotone" dataKey="kabrita" stackId="1" stroke="#eab308" fill="#fef08a" fillOpacity={0.8} name="Kabrita" />
                  <Area type="monotone" dataKey="kendamil" stackId="1" stroke="#3b82f6" fill="#bfdbfe" fillOpacity={0.8} name="Kendamil" />
                  <Area type="monotone" dataKey="vache" stackId="1" stroke="#64748b" fill="#e2e8f0" fillOpacity={0.8} name="Lait de Vache" />
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









