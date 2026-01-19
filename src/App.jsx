// Ce code contient les corrections pour Éléonore
import React, { useState } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { omsTables } from './omsData'; // Assure-toi que ce fichier contient p3, p15, p50, p85, p97
import { nutritionData } from './nutritionData';
import NutritionDashboard from './NutritionDashboard';

const BabyDashboard = () => {
  const [view, setView] = useState('weight');

  return (
    <div className="p-4 bg-white rounded-3xl shadow-xl">
      <h2 className="text-2xl font-black mb-6 text-slate-800 uppercase tracking-tighter">
        Courbe de {view === 'weight' ? 'Poids' : view === 'height' ? 'Taille' : 'Périmètre'} (OMS)
      </h2>
      
      <div className="h-[500px] w-full">
        <ResponsiveContainer>
          <ComposedChart data={omsTables[view]}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" label={{ value: 'Mois', position: 'insideBottom', offset: -5 }} />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Legend verticalAlign="top" />
            
            {/* Couloirs OMS - Percentiles réels */}
            <Line type="monotone" dataKey="p97" stroke="#fee2e2" strokeDasharray="5 5" dot={false} name="P97" />
            <Line type="monotone" dataKey="p85" stroke="#fecaca" strokeDasharray="3 3" dot={false} name="P85" />
            <Line type="monotone" dataKey="p50" stroke="#bbf7d0" strokeWidth={2} dot={false} name="P50 (Médiane)" />
            <Line type="monotone" dataKey="p15" stroke="#fecaca" strokeDasharray="3 3" dot={false} name="P15" />
            <Line type="monotone" dataKey="p3" stroke="#fee2e2" strokeDasharray="5 5" dot={false} name="P3" />
            
            {/* Mesures Éléonore */}
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="#2563eb" 
              strokeWidth={4} 
              dot={{ r: 6, fill: '#2563eb' }} 
              name="Éléonore" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique Nutrition Granulaire */}
      <h2 className="text-2xl font-black mt-12 mb-6 text-slate-800 uppercase tracking-tighter">
        Consommation Détaillée
      </h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer>
          <AreaChart data={nutritionData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{fontSize: 10}} />
            <YAxis unit="ml" />
            <Tooltip />
            <Legend />
            {/* Distinction demandée */}
            <Area type="monotone" dataKey="sein" stackId="1" stroke="#D81B60" fill="#D81B60" name="Maternel (Sein)" />
            <Area type="monotone" dataKey="bibMaternel" stackId="1" stroke="#F06292" fill="#F06292" name="Maternel (Biberon)" />
            <Area type="monotone" dataKey="chevre" stackId="1" stroke="#0000FF" fill="#0000FF" name="Lait de Chèvre" />
            <Area type="monotone" dataKey="vache" stackId="1" stroke="#333333" fill="#333333" name="Lait de Vache" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};









