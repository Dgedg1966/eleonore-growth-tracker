// Ce code contient les corrections pour Éléonore
import { useState } from 'react'

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
      <h1 style={{ color: '#2e7d32' }}>Suivi d'Éléonore (Données Corrigées)</h1>
      
      <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <p><strong>Statut :</strong> Croissance Excellente (Moyenne Haute OMS)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px' }}>
          <h3>Dernières Mesures (Novembre)</h3>
          <ul>
            <li><strong>Poids :</strong> 7,8 kg (Parfaitement dans la courbe)</li>
            <li><strong>Taille :</strong> 70 cm (Unité corrigée)</li>
            <li><strong>Tête :</strong> 43,8 cm</li>
          </ul>
        </div>

        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px' }}>
          <h3>Nutrition depuis le 29 Juillet</h3>
          <p>Total : 119 jours d'historique analysés.</p>
          <p>Moyenne : 840 ml / jour (100% Kendamil chèvre actuellement).</p>
        </div>
      </div>
      
      <button onClick={() => window.print()} style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}>
        Exporter le Rapport en PDF
      </button>
    </div>
  )
}

export default App