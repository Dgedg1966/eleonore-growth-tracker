// Ce code contient les corrections pour Éléonore
import React, { useState, useEffect } from 'react';
import { Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { Baby, Scale, Ruler, Brain, Droplets, Plus } from 'lucide-react';
import { omsTables, cdcTables } from './growthData';
import { dailyNutrition } from './nutritionData';

const App = () => {
  const [activeTab, setActiveTab] = useState('growth');
  const [growthType, setGrowthType] = useState('weight');
  const [chartStandard, setChartStandard] = useState('oms');

  // Données séparées par type pour éviter le bug de copie
  const [myMeasures, setMyMeasures] = useState({
    weight: [],
    height: [],
    head: []
  });

  useEffect(() => {
    const saved = localStorage.getItem('eleonoreMeasures');
    if (saved) {
      setMyMeasures(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('eleonoreMeasures', JSON.stringify(myMeasures));
  }, [myMeasures]);

  const tables = chartStandard === 'oms' ? omsTables : cdcTables;

  // Données pour le graphique du type actif
  const combinedGrowth = tables[growthType].map(oms => {
    const measure = myMeasures[growthType].find(m => m.month === oms.month);
    return {
      ...oms,
      current: measure ? measure.current : null
    };
  });

  const latest = myMeasures[growthType][myMeasures[growthType].length - 1] || { current: 0, month: 0 };
  const percentile = Math.round(50 + 50 * Math.tanh(((latest.current - tables[growthType][latest.month]?.p50 || 0) / ((tables[growthType][latest.month]?.p97 || 10 - tables[growthType][latest.month]?.p50 || 0) / 1.88)) / Math.sqrt(2))) || 0;

  const addMeasure = (e) => {
    e.preventDefault();
    const date = new Date(e.target.date.value);
    const birth = new Date('2025-05-14');
    const month = Math.round((date - birth) / (1000 * 60 * 60 * 24 * 30.4));
    const value = parseFloat(e.target.value.value);
    const newEntry = { month, current: value, date: e.target.date.value };
    setMyMeasures(prev => ({
      ...prev,
      [growthType]: [...prev[growthType], newEntry].sort((a, b) => a.month - b.month)
    }));
    e.target.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-gray-900">
      <nav className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-5 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Baby className="w-10 h-10" />
            <h1 className="text-2xl font-bold">Éléonore Growth Tracker</h1>
          </div>
          <span className="text-sm opacity-90">Famille seulement</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-full shadow-md p-1">
            <button
              onClick={() => setActiveTab('growth')}
              className={`px-8 py-3 rounded-full font-semibold transition ${activeTab === 'growth' ? 'bg-pink-600 text-white shadow' : 'text-gray-600 hover:bg-pink-50'}`}
            >
              Croissance
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-8 py-3 rounded-full font-semibold transition ${activeTab === 'nutrition' ? 'bg-pink-600 text-white shadow' : 'text-gray-600 hover:bg-pink-50'}`}
            >
              Nutrition
            </button>
          </div>
        </div>

        {activeTab === 'growth' ? (
          <div className="space-y-8">
            <select
              value={chartStandard}
              onChange={e => setChartStandard(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm mx-auto block"
            >
              <option value="oms">OMS (recommandé 0-2 ans)</option>
              <option value="cdc">CDC</option>
            </select>

            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => setGrowthType('weight')} className={`p-6 rounded-xl shadow-lg ${growthType === 'weight' ? 'bg-pink-100 border-2 border-pink-500' : 'bg-white border border-gray-200'}`}>
                <Scale className="mx-auto mb-2 text-pink-600" size={32} />
                <div className="font-bold text-xl">{latest.current} kg</div>
                <div className="text-sm text-gray-600">P {percentile}</div>
              </button>
              <button onClick={() => setGrowthType('height')} className={`p-6 rounded-xl shadow-lg ${growthType === 'height' ? 'bg-green-100 border-2 border-green-500' : 'bg-white border border-gray-200'}`}>
                <Ruler className="mx-auto mb-2 text-green-600" size={32} />
                <div className="font-bold text-xl">{latest.current} cm</div>
              </button>
              <button onClick={() => setGrowthType('head')} className={`p-6 rounded-xl shadow-lg ${growthType === 'head' ? 'bg-purple-100 border-2 border-purple-500' : 'bg-white border border-gray-200'}`}>
                <Brain className="mx-auto mb-2 text-purple-600" size={32} />
                <div className="font-bold text-xl">{latest.current} cm</div>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-center">
                Courbe {growthType === 'weight' ? 'Poids' : growthType === 'height' ? 'Taille' : 'Périmètre crânien'}
              </h2>
              <div className="h-80">
                <ResponsiveContainer>
                  <ComposedChart data={combinedGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" label={{ value: 'Âge (mois)', position: 'insideBottom', offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Area dataKey="p97" fill="#fecaca" fillOpacity={0.3} stroke="none" name="P97" />
                    <Area dataKey="p50" fill="#86efac" fillOpacity={0.4} stroke="none" name="Médiane" />
                    <Area dataKey="p3" fill="#fecaca" fillOpacity={0.3} stroke="none" name="P3" />
                    <Line type="monotone" dataKey="current" stroke="#ec4899" strokeWidth={5} dot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} name="Éléonore" connectNulls />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Ajouter une mesure
              </h3>
              <form onSubmit={addMeasure} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="date" name="date" required className="p-3 border rounded-lg" />
                <input type="number" name="value" step="0.1" placeholder="Valeur" required className="p-3 border rounded-lg" />
                <button type="submit" className="bg-pink-600 text-white font-semibold py-3 rounded-lg hover:bg-pink-700 transition">
                  Enregistrer
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <Droplets className="text-blue-500" /> Nutrition quotidienne
            </h2>
            {dailyNutrition.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer>
                  <AreaChart data={dailyNutrition} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} interval={3} tick={{ fontSize: 12 }} />
                    <YAxis unit=" ml" />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="sein" stackId="1" fill="#ec4899" name="Tétées / Sein" />
                    <Area type="monotone" dataKey="maternelBib" stackId="1" fill="#f472b6" name="Bib Maternel" />
                    <Area type="monotone" dataKey="kabrita" stackId="1" fill="#fbbf24" name="Kabrita" />
                    <Area type="monotone" dataKey="aptamil" stackId="1" fill="#64b5f6" name="Aptamil" />
                    <Area type="monotone" dataKey="kendamil" stackId="1" fill="#9575cd" name="Kendamil" />
                    <Area type="monotone" dataKey="franceLait" stackId="1" fill="#90a4ae" name="France Lait" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-10">Aucune donnée nutrition chargée ou fichier nutritionData.js vide</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;















