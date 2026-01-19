// Ce code contient les corrections pour Éléonore
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Baby, Scale, Ruler, Brain, Printer, TrendingUp, Calendar, Droplets } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('growth');

  // DONNÉES ÉLÉONORE
  const stats = {
    weight: "7.8 kg",
    height: "70 cm",
    head: "43.8 cm",
    percentile: "50e-75e",
    days: 119,
    avgMilk: "840 ml"
  };

  // DONNÉES GRAPHIQUE CROISSANCE
  const growthData = [
    { month: 'Naiss.', weight: 3.3, oms: 3.2 },
    { month: 'M1', weight: 4.2, oms: 4.2 },
    { month: 'M3', weight: 5.8, oms: 5.8 },
    { month: 'M6', weight: 7.8, oms: 7.3 },
  ];

  // DONNÉES GRAPHIQUE NUTRITION (Exemple dynamique)
  const nutritionData = [
    { day: 'Lun', ml: 820 },
    { day: 'Mar', ml: 850 },
    { day: 'Mer', ml: 840 },
    { day: 'Jeu', ml: 860 },
    { day: 'Ven', ml: 830 },
    { day: 'Sam', ml: 840 },
    { day: 'Dim', ml: 850 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Baby className="w-8 h-8 text-pink-500" />
          <h1 className="text-xl font-bold">Éléonore Tracker</h1>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-blue-200 shadow-lg">
          <Printer className="w-4 h-4" /> Rapport Complet
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {/* ONGLETS */}
        <div className="flex gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
          <button onClick={() => setActiveTab('growth')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'growth' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Croissance OMS</button>
          <button onClick={() => setActiveTab('nutrition')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'nutrition' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Nutrition (Détails)</button>
        </div>

        {activeTab === 'growth' ? (
          <div className="space-y-6">
            {/* GRAPHIQUE OMS */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-8 flex items-center gap-2 italic text-slate-700">
                <TrendingUp className="w-5 h-5 text-blue-500" /> Courbe de Poids vs Médiane OMS
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} unit="kg" domain={[3, 9]} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="oms" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Médiane OMS" />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={5} dot={{r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff'}} name="Éléonore" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CARTES DES MESURES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-600 text-white p-6 rounded-[32px]">
                <Scale className="mb-4 opacity-80" />
                <p className="text-blue-100 text-sm font-medium">Poids</p>
                <p className="text-3xl font-black">{stats.weight}</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-slate-200">
                <Ruler className="mb-4 text-green-500" />
                <p className="text-slate-500 text-sm font-medium">Taille (Corrigée)</p>
                <p className="text-3xl font-black text-slate-800">{stats.height}</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-slate-200">
                <Brain className="mb-4 text-purple-500" />
                <p className="text-slate-500 text-sm font-medium">Périmètre Crânien</p>
                <p className="text-3xl font-black text-slate-800">{stats.head}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* GRAPHIQUE NUTRITION */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-8 flex items-center gap-2 italic text-slate-700">
                <Droplets className="w-5 h-5 text-blue-400" /> Consommation de Lait (7 derniers jours)
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={nutritionData}>
                    <defs>
                      <linearGradient id="colorMl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} unit="ml" domain={[700, 950]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="ml" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMl)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-[32px] border border-blue-100">
              <div className="flex items-center gap-4 mb-4 text-blue-800 font-bold">
                <Calendar /> Analyse sur {stats.days} jours
              </div>
              <p className="text-blue-700 leading-relaxed">
                Depuis le 29 Juillet, la moyenne est stable à <strong>{stats.avgMilk} par jour</strong>. 
                Cela correspond à un apport calorique optimal pour son poids actuel.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;




