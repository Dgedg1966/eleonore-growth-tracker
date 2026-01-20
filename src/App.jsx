// Ce code contient les corrections pour Éléonore
import React, { useState, useEffect } from 'react';
import { Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { Baby, Scale, Ruler, Brain, Droplets, Plus } from 'lucide-react';
import { omsTables, cdcTables } from './omsData';
import { nutritionData } from './nutritionData';

const App = () => {
  const [tab, setTab] = useState('growth');
  const [type, setType] = useState('weight');
  const [standard, setStandard] = useState('oms'); // 'oms' ou 'cdc'
  const [measures, setMeasures] = useState(() => {
    const saved = localStorage.getItem('eleonoreMeasures');
    return saved ? JSON.parse(saved) : {
      weight: [{ month: 0, value: 3.3, date: '2025-07-29' }, { month: 6, value: 7.8, date: '2026-01-20' }],
      height: [{ month: 0, value: 50, date: '2025-07-29' }, { month: 6, value: 70, date: '2026-01-20' }],
      head:   [{ month: 0, value: 34, date: '2025-07-29' }, { month: 6, value: 43.8, date: '2026-01-20' }]
    };
  });

  useEffect(() => {
    localStorage.setItem('eleonoreMeasures', JSON.stringify(measures));
  }, [measures]);

  const tables = standard === 'oms' ? omsTables : cdcTables;
  const data = tables[type].map(row => ({
    ...row,
    eleonore: measures[type].find(m => m.month === row.month)?.value || null
  }));

  const latest = measures[type][measures[type].length - 1];
  const currentValue = latest?.value || '—';
  const currentMonth = latest?.month || '—';

  const approxPercentile = (val, month) => {
    const row = tables[type].find(r => r.month === month) || tables[type][0];
    const diff97 = row.p97 - row.p50;
    const z = (val - row.p50) / (diff97 / 1.88);
    const p = 50 + 50 * Math.tanh(z * 0.8); // approximation simple
    return Math.max(1, Math.min(99, Math.round(p)));
  };

  const percentile = latest ? approxPercentile(currentValue, currentMonth) : '—';

  const addMeasure = (e) => {
    e.preventDefault();
    const form = e.target;
    const date = form.date.value;
    const val = parseFloat(form.value.value);
    const birth = new Date('2025-07-29');
    const measureDate = new Date(date);
    const months = Math.round((measureDate - birth) / (1000 * 60 * 60 * 24 * 30.4));
    const newEntry = { month: months, value: val, date };
    setMeasures(prev => ({
      ...prev,
      [type]: [...prev[type], newEntry].sort((a,b) => a.month - b.month)
    }));
    form.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white text-gray-900 font-sans">
      <nav className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-5 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Baby className="w-10 h-10" />
            <h1 className="text-2xl font-bold">Éléonore Growth</h1>
          </div>
          <span className="text-sm opacity-90">Famille seulement</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* Onglets */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-full shadow-md p-1">
            <button
              onClick={() => setTab('growth')}
              className={`px-8 py-3 rounded-full font-semibold transition ${tab === 'growth' ? 'bg-pink-600 text-white shadow' : 'text-gray-600 hover:bg-pink-50'}`}
            >
              Croissance
            </button>
            <button
              onClick={() => setTab('nutrition')}
              className={`px-8 py-3 rounded-full font-semibold transition ${tab === 'nutrition' ? 'bg-pink-600 text-white shadow' : 'text-gray-600 hover:bg-pink-50'}`}
            >
              Nutrition
            </button>
          </div>
        </div>

        {tab === 'growth' && (
          <div className="space-y-8">
            {/* Sélecteurs */}
            <div className="flex flex-wrap gap-4 justify-center">
              <select
                value={standard}
                onChange={e => setStandard(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm"
              >
                <option value="oms">OMS (recommandé 0-2 ans)</option>
                <option value="cdc">CDC</option>
              </select>

              <div className="flex gap-3">
                <button onClick={() => setType('weight')} className={`flex-1 p-4 rounded-xl shadow ${type==='weight' ? 'bg-pink-100 border-2 border-pink-500' : 'bg-white'}`}>
                  <Scale className="mx-auto mb-2 text-pink-600" />
                  <div className="font-bold">{currentValue} kg</div>
                  <div className="text-sm text-gray-600">P {percentile}</div>
                </button>
                <button onClick={() => setType('height')} className={`flex-1 p-4 rounded-xl shadow ${type==='height' ? 'bg-green-100 border-2 border-green-500' : 'bg-white'}`}>
                  <Ruler className="mx-auto mb-2 text-green-600" />
                  <div className="font-bold">{currentValue} cm</div>
                </button>
                <button onClick={() => setType('head')} className={`flex-1 p-4 rounded-xl shadow ${type==='head' ? 'bg-purple-100 border-2 border-purple-500' : 'bg-white'}`}>
                  <Brain className="mx-auto mb-2 text-purple-600" />
                  <div className="font-bold">{currentValue} cm</div>
                </button>
              </div>
            </div>

            {/* Graphique */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-center">
                Courbe {type === 'weight' ? 'Poids' : type === 'height' ? 'Taille' : 'Périmètre crânien'}
              </h2>
              <div className="h-80">
                <ResponsiveContainer>
                  <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" label={{ value: 'Âge (mois)', position: 'insideBottom', offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Area dataKey="p97" fill="#fecaca" fillOpacity={0.3} stroke="none" name="P97" />
                    <Area dataKey="p50" fill="#86efac" fillOpacity={0.4} stroke="none" name="Médiane" />
                    <Area dataKey="p3"  fill="#fecaca" fillOpacity={0.3} stroke="none" name="P3" />
                    <Line type="monotone" dataKey="eleonore" stroke="#ec4899" strokeWidth={4} dot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} name="Éléonore" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ajouter mesure */}
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
        )}

        {tab === 'nutrition' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <Droplets className="text-blue-500" /> Nutrition quotidienne
            </h2>
            <div className="h-96">
              <ResponsiveContainer>
                <ComposedChart data={dailyNutrition.slice(-60)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} interval={3} tick={{ fontSize: 12 }} />
                  <YAxis unit=" ml" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="sein" stackId="1" fill="#ec4899" stroke="#db2777" name="Sein" />
                  <Area type="monotone" dataKey="maternelBib" stackId="1" fill="#f472b6" stroke="#db2777" name="Bib maternel" />
                  <Area type="monotone" dataKey="kabrita" stackId="1" fill="#fbbf24" stroke="#d97706" name="Kabrita" />
                  <Area type="monotone" dataKey="kendamil" stackId="1" fill="#60a5fa" stroke="#2563eb" name="Kendamil" />
                  <Area type="monotone" dataKey="franceLait" stackId="1" fill="#9ca3af" stroke="#4b5563" name="France Lait" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center mt-4 text-gray-600">
              Données du {dailyNutrition[0]?.date} au {dailyNutrition[dailyNutrition.length-1]?.date}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;















