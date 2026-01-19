// Ce code contient les corrections pour Éléonore
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ComposedChart } from 'recharts';
import { Baby, Scale, Ruler, Brain, Printer, TrendingUp, Droplets, Calendar, ChevronRight } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('growth');
  const [growthType, setGrowthType] = useState('weight'); // weight, height, or head

  // TABLES DE RÉFÉRENCE OMS (SIMPLIFIÉES)
  const omsData = {
    weight: [
      { month: 'Naiss.', current: 3.3, p15: 2.8, p50: 3.2, p85: 4.0 },
      { month: 'M2', current: 5.1, p15: 4.5, p50: 5.1, p85: 6.0 },
      { month: 'M4', current: 6.5, p15: 5.7, p50: 6.4, p85: 7.5 },
      { month: 'M6', current: 7.8, p15: 6.5, p50: 7.3, p85: 8.5 },
    ],
    height: [
      { month: 'Naiss.', current: 50, p15: 47, p50: 49, p85: 52 },
      { month: 'M2', current: 57, p15: 54, p50: 56, p85: 59 },
      { month: 'M4', current: 64, p15: 61, p50: 63, p85: 66 },
      { month: 'M6', current: 70, p15: 65, p50: 67, p85: 71 },
    ],
    head: [
      { month: 'Naiss.', current: 34, p15: 33, p50: 34, p85: 36 },
      { month: 'M2', current: 38.5, p15: 37, p50: 38, p85: 39.5 },
      { month: 'M4', current: 41.5, p15: 40, p50: 41, p85: 42.5 },
      { month: 'M6', current: 43.8, p15: 42, p50: 43, p85: 44.5 },
    ]
  };

  // NUTRITION : MATERNEL, CHÈVRE, VACHE
  const nutritionHistory = [
    { period: 'Fin Juil', maternel: 840, chevre: 0, vache: 0 },
    { period: 'Août', maternel: 600, chevre: 100, vache: 140 },
    { period: 'Sept', maternel: 300, chevre: 340, vache: 200 },
    { period: 'Oct', maternel: 50, chevre: 590, vache: 200 },
    { period: 'Nov', maternel: 0, chevre: 740, vache: 100 },
  ];

  const renderGrowthChart = () => {
    const data = omsData[growthType];
    const unit = growthType === 'weight' ? 'kg' : 'cm';
    const color = growthType === 'weight' ? '#2563eb' : growthType === 'height' ? '#16a34a' : '#9333ea';

    return (
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} unit={unit} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
            <Legend verticalAlign="top" height={36}/>
            <Area type="monotone" dataKey="p85" stroke="none" fill="#fee2e2" name="Zone Haute (P85)" fillOpacity={0.6} />
            <Area type="monotone" dataKey="p50" stroke="none" fill="#dcfce7" name="Médiane (P50)" fillOpacity={0.6} />
            <Line type="monotone" dataKey="current" stroke={color} strokeWidth={4} dot={{r: 6, fill: color, stroke: '#fff', strokeWidth: 2}} name={`Éléonore (${unit})`} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Baby className="w-8 h-8 text-pink-500" />
          <h1 className="text-xl font-bold">Éléonore Dashboard</h1>
        </div>
        <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md">
          <Printer className="w-4 h-4 inline mr-2" /> PDF
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {/* TABS PRINCIPAUX */}
        <div className="flex gap-2 mb-8 bg-slate-200/50 p-1 rounded-2xl w-fit">
          <button onClick={() => setActiveTab('growth')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'growth' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Croissance</button>
          <button onClick={() => setActiveTab('nutrition')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'nutrition' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Nutrition</button>
        </div>

        {activeTab === 'growth' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-500" /> Comparaison Courbes OMS
              </h3>
              {renderGrowthChart()}
            </div>

            {/* BOUTONS INTERACTIFS EN BAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => setGrowthType('weight')} className={`p-6 rounded-[24px] border-2 transition-all text-left ${growthType === 'weight' ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white shadow-sm'}`}>
                <Scale className="mb-2 text-blue-600" />
                <p className="text-xs font-bold uppercase text-slate-400">Poids</p>
                <p className="text-2xl font-black text-slate-800">7.8 kg</p>
              </button>
              <button onClick={() => setGrowthType('height')} className={`p-6 rounded-[24px] border-2 transition-all text-left ${growthType === 'height' ? 'border-green-500 bg-green-50' : 'border-transparent bg-white shadow-sm'}`}>
                <Ruler className="mb-2 text-green-600" />
                <p className="text-xs font-bold uppercase text-slate-400">Taille</p>
                <p className="text-2xl font-black text-slate-800">70 cm</p>
              </button>
              <button onClick={() => setGrowthType('head')} className={`p-6 rounded-[24px] border-2 transition-all text-left ${growthType === 'head' ? 'border-purple-500 bg-purple-50' : 'border-transparent bg-white shadow-sm'}`}>
                <Brain className="mb-2 text-purple-600" />
                <p className="text-xs font-bold uppercase text-slate-400">Périmètre</p>
                <p className="text-2xl font-black text-slate-800">43.8 cm</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Répartition Mensuelle (Maternel / Chèvre / Vache)</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <AreaChart data={nutritionHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="period" />
                    <YAxis unit="ml" />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="maternel" stackId="1" stroke="#ec4899" fill="#fbcfe8" name="Lait Maternel" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="chevre" stackId="1" stroke="#3b82f6" fill="#bfdbfe" name="Lait de Chèvre" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="vache" stackId="1" stroke="#64748b" fill="#e2e8f0" name="Lait de Vache" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-blue-600 text-white p-8 rounded-[32px] shadow-lg shadow-blue-200">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold flex items-center gap-2 text-lg"><Calendar className="w-5 h-5"/> Moyenne Hebdomadaire (Nov)</h4>
                  <ChevronRight />
               </div>
               <div className="text-4xl font-black mb-2">840 ml <span className="text-lg font-normal opacity-70">/ jour</span></div>
               <p className="text-blue-100 text-sm">Consommation 100% stable sur les 4 dernières semaines.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;






