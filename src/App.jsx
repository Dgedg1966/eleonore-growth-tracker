// Ce code contient les corrections pour Éléonore
import React from 'react';
import NutritionDashboard from './NutritionDashboard';
// Si tu décides de créer le graphique de croissance plus tard, tu l'importeras ici

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Affichage du graphique de nutrition */}
      <NutritionDashboard />
    </div>
  );
}

export default App;









