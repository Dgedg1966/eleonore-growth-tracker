import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { nutritionData } from './nutritionData';

const NutritionDashboard = () => {
  return (
    <div style={{ width: '100%', height: 500, backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>Suivi Nutritionnel Éléonore</h2>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={nutritionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            minTickGap={40} 
            tickFormatter={(str) => {
              const d = new Date(str);
              return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            }}
            style={{ fontSize: '12px' }}
          />
          <YAxis unit="ml" style={{ fontSize: '12px' }} />
          <Tooltip 
            labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          />
          <Legend />

          {/* Allaitement : Apparaît uniquement si la donnée existe dans l'objet */}
          <Area type="monotone" dataKey="sein" stackId="1" stroke="#e91e63" fill="#f06292" name="Allaitement (Sein)" connectNulls />
          <Area type="monotone" dataKey="maternelBib" stackId="1" stroke="#388e3c" fill="#81c784" name="Lait Maternel (Bib)" connectNulls />
          
          {/* Laits Infantiles */}
          <Area type="monotone" dataKey="kabrita" stackId="1" stroke="#ffa000" fill="#ffca28" name="Kabrita" connectNulls />
          <Area type="monotone" dataKey="aptamil" stackId="1" stroke="#1976d2" fill="#64b5f6" name="Aptamil" connectNulls />
          <Area type="monotone" dataKey="kendamil" stackId="1" stroke="#673ab7" fill="#9575cd" name="Kendamil" connectNulls />
          <Area type="monotone" dataKey="franceLait" stackId="1" stroke="#455a64" fill="#90a4ae" name="France Lait" connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NutritionDashboard;
