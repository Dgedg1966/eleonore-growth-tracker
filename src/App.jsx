// Ce code contient les corrections pour Éléonore
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ComposedChart } from 'recharts';
import { Baby, Scale, Ruler, Brain, Printer, TrendingUp, Droplets, Calendar } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('growth');

  // DONNÉES DE CROISSANCE AVEC PERCENTILES OMS
  const growthData = [
    { month: 'Naiss.', weight: 3.3, p15: 2.8, p50: 3.2, p85: 3.7 },
    { month: 'M1', weight: 4.2, p15: 3.6, p50: 4.2, p85: 4.8 },
    { month: 'M2', weight: 5.1, p15: 4.5, p50: 5.1, p85: 5.8 },
    { month: 'M3', weight: 5.8, p15: 5.2, p50: 5.8, p85: 6.6 },
    { month: 'M4', weight: 6.5, p15: 5.7, p50: 6.4, p85: 7.3 },
    { month: 'M5', weight: 7.2, p15: 6.1, p50: 7.0, p85: 7.8 },
    { month: 'M6', weight: 7.8, p15: 6.5, p50: 7.3, p85: 8.2 }, // Éléonore est ici
  ];

  // HISTORIQUE NUTRITIONNEL DEPUIS JUILLET (Simplifié pour l'exemple)
  const nutritionHistory = [
    { period: 'Fin Juil', maternel: 800, chevre: 0, vache: 0 },
    { period: 'Août', maternel: 600, chevre: 200, vache: 0 },
    { period: 'Sept', maternel: 300, chevre: 500, vache: 0 },
    { period: 'Oct', maternel: 100, chevre: 740, vache: 0 },
    { period: 'Nov', maternel: 0, chevre: 840, vache: 0 }, // Actuellement 100% Chèvre
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Baby className="w-8 h-8 text-pink-500" />
          <h1 className="text-xl font-bold italic">Éléonore Analytics</h1>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-5 py-2 rounded-2xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all">
          <Printer className="w-4 h-4 inline mr-2" /> Rapport Pédiatrique
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
          <button onClick={() => setActiveTab('growth')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'growth' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Croissance & Percentiles</button>
          <button onClick={() => setActiveTab('nutrition')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'nutrition' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Évolution Lait (Juil-Nov)</button>
        </div>

        {activeTab === 'growth' ? (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-700 italic">Positionnement sur les Courbes OMS (Poids)</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <ComposedChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} unit="kg" domain={[2, 9]} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36}/>
                    {/* Zones de Percentiles */}
                    <Area type="monotone" dataKey="p85" stackId="1" stroke="none" fill="#fee2e2" name="Zone Haute (P85)" />
                    <Area type="monotone" dataKey="p50" stackId="2" stroke="none" fill="#dcfce7" name="Médiane (P50)" />
                    {/* Courbe Éléonore */}
                    <Line type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={4} dot={{r: 8, fill: '#2563eb', stroke: '#fff', strokeWidth: 3}} name="Éléonore" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-sm text-slate-500 text-center">La zone verte représente la médiane OMS. Éléonore se situe idéalement en haut de cette zone.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[32px] border-2 border-blue-100 shadow-sm">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Poids</p>
                <p className="text-3xl font-black text-blue-600">7.8 kg</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border-2 border-green-100 shadow-sm">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Taille</p>
                <p className="text-3xl font-black text-green-600">70 cm</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] border-2 border-purple-100 shadow-sm">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Périmètre</p>
                <p className="text-3xl font-black text-purple-600">43.8 cm</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-slate-700">Répartition des types de lait (Depuis le 29 Juillet)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer>
                <AreaChart data={nutritionHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" />
                  <YAxis unit="ml" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="maternel" stackId="1" stroke="#f472b6" fill="#fbcfe8" name="Maternel" />
                  <Area type="monotone" dataKey="chevre" stackId="1" stroke="#60a5fa" fill="#dbeafe" name="Chèvre (Kendamil)" />
                  <Area type="monotone" dataKey="vache" stackId="1" stroke="#94a3b8" fill="#f1f5f9" name="Vache" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-2 font-bold text-slate-700">
                <Droplets className="text-blue-500" /> Observation Transitionnelle
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                On observe une transition complète vers le lait de chèvre finalisée en novembre. 
                L'apport total est resté stable autour de <strong>840ml</strong>, ce qui a soutenu la croissance constante visible sur la courbe de poids.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;





