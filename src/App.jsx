// Ce code contient les corrections pour Éléonore
// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  Baby,
  Scale,
  Ruler,
  Brain,
  Droplets,
  Plus,
} from "lucide-react";
import "./App.css";

// Importer les données de percentiles OMS/CDC depuis votre fichier
// Note: Si le fichier est dans un autre dossier, ajustez le chemin
import { weightData, heightData, headData } from "./growthData";

// Configuration du backend
const BACKEND_URL = "https://eleonore-backend.onrender.com";

// Hook personnalisé pour fetch les données
const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

// Fonction pour calculer le percentile basé sur les données OMS/CDC
const calculatePercentile = (value, ageInMonths, type) => {
  if (!value || ageInMonths === null || ageInMonths === undefined) {
    return null;
  }

  // Sélectionner les données appropriées selon le type
  let referenceData;
  switch (type) {
    case "weight":
      referenceData = weightData;
      break;
    case "height":
      referenceData = heightData;
      break;
    case "head":
      referenceData = headData;
      break;
    default:
      return null;
  }

  // Trouver les données pour l'âge le plus proche
  const ageRounded = Math.round(ageInMonths * 2) / 2; // Arrondir à 0.5 mois près
  const ageKey = Math.max(0, Math.min(24, ageRounded)).toFixed(1);
  
  // Chercher les percentiles pour cet âge
  const ageData = referenceData.find(d => d.age === parseFloat(ageKey));
  
  if (!ageData) {
    // Si pas de données exactes, utiliser l'interpolation
    const lowerAge = Math.floor(ageInMonths);
    const upperAge = Math.ceil(ageInMonths);
    const lowerData = referenceData.find(d => d.age === lowerAge);
    const upperData = referenceData.find(d => d.age === upperAge);
    
    if (!lowerData || !upperData) {
      return null;
    }
    
    // Interpolation linéaire des percentiles
    const fraction = ageInMonths - lowerAge;
    
    // Vérifier chaque percentile
    const percentiles = [3, 15, 50, 85, 97];
    let lowerPercentile = 50;
    let upperPercentile = 50;
    
    for (let i = 0; i < percentiles.length; i++) {
      const p = percentiles[i];
      const lowerVal = lowerData[`p${p}`];
      const upperVal = upperData[`p${p}`];
      
      if (value >= lowerVal && value <= upperVal) {
        return p; // Le percentile exact
      }
      
      if (value < lowerVal && i === 0) return 3; // En dessous du 3ème
      if (value > upperVal && i === percentiles.length - 1) return 97; // Au-dessus du 97ème
      
      if (value >= lowerData[`p${p}`] && value <= lowerData[`p${percentiles[i+1]}`]) {
        lowerPercentile = p;
      }
      if (value >= upperData[`p${p}`] && value <= upperData[`p${percentiles[i+1]}`]) {
        upperPercentile = p;
      }
    }
    
    // Interpolation du percentile
    return Math.round(lowerPercentile + (upperPercentile - lowerPercentile) * fraction);
  }

  // Si on a des données exactes pour cet âge
  const percentiles = [3, 15, 50, 85, 97];
  
  // Vérifier les bornes
  if (value < ageData.p3) return 3;
  if (value > ageData.p97) return 97;
  
  // Trouver entre quels percentiles se situe la valeur
  for (let i = 0; i < percentiles.length - 1; i++) {
    const currentP = percentiles[i];
    const nextP = percentiles[i + 1];
    
    if (value >= ageData[`p${currentP}`] && value <= ageData[`p${nextP}`]) {
      // Interpolation entre les deux percentiles
      const range = ageData[`p${nextP}`] - ageData[`p${currentP}`];
      const position = (value - ageData[`p${currentP}`]) / range;
      return Math.round(currentP + (nextP - currentP) * position);
    }
  }
  
  return 50; // Par défaut
};

// Fonction pour obtenir l'âge en mois
const getAgeInMonths = (birthDate, currentDate) => {
  if (!birthDate || !currentDate) return 0;
  
  try {
    const birth = new Date(birthDate);
    const current = new Date(currentDate);
    
    if (isNaN(birth.getTime()) || isNaN(current.getTime())) {
      return 0;
    }
    
    const months = (current.getFullYear() - birth.getFullYear()) * 12 + 
                   (current.getMonth() - birth.getMonth());
    
    // Ajouter la fraction du mois
    const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    const dayFraction = current.getDate() / daysInMonth;
    
    return Math.max(0, months + dayFraction);
  } catch (error) {
    console.error("Error calculating age:", error);
    return 0;
  }
};

// Composant principal
function App() {
  // Date de naissance d'Éléonore - À AJUSTER SELON VOTRE CAS
  const birthDate = "2025-05-14";
  
  // Fetch des données du backend
  const { 
    data: growthData, 
    loading: growthLoading, 
    error: growthError 
  } = useApi(`${BACKEND_URL}/growth`);

  const { 
    data: nutritionData, 
    loading: nutritionLoading, 
    error: nutritionError 
  } = useApi(`${BACKEND_URL}/nutrition`);

  // Vérifier que les données sont valides
  const safeGrowthData = Array.isArray(growthData) ? growthData : [];
  const safeNutritionData = nutritionData && nutritionData.entries && Array.isArray(nutritionData.entries) 
    ? nutritionData.entries 
    : [];

  // Calculer les percentiles pour chaque mesure
  const growthDataWithPercentiles = safeGrowthData.map(item => {
    if (!item.date) return { ...item, ageMonths: 0 };
    
    const ageMonths = getAgeInMonths(birthDate, item.date);
    
    return {
      ...item,
      ageMonths,
      weightPercentile: item.weight ? calculatePercentile(item.weight, ageMonths, "weight") : null,
      heightPercentile: item.height ? calculatePercentile(item.height, ageMonths, "height") : null,
      headPercentile: item.head ? calculatePercentile(item.head, ageMonths, "head") : null
    };
  });

  // Dernière mesure
  const lastMeasurement = growthDataWithPercentiles.length > 0 
    ? growthDataWithPercentiles[growthDataWithPercentiles.length - 1] 
    : null;

  // Préparer les données pour les graphiques
  const prepareChartData = (type) => {
    return growthDataWithPercentiles
      .filter(item => item[type] && item.date)
      .map(item => {
        // Format de date plus lisible
        const date = new Date(item.date);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        return {
          date: `${day}/${month}`,
          [type]: item[type],
          percentile: item[`${type}Percentile`],
          ageMonths: item.ageMonths?.toFixed(1)
        };
      });
  };

  const weightChartData = prepareChartData("weight");
  const heightChartData = prepareChartData("height");
  const headChartData = prepareChartData("head");

  // Regrouper la nutrition par jour
  const nutritionByDay = {};
  safeNutritionData.forEach(entry => {
    if (entry.date && entry.ml) {
      const dateKey = entry.date.split("T")[0];
      if (!nutritionByDay[dateKey]) {
        nutritionByDay[dateKey] = 0;
      }
      nutritionByDay[dateKey] += entry.ml;
    }
  });

  const nutritionChartData = Object.entries(nutritionByDay)
    .map(([date, totalMl]) => {
      const dateObj = new Date(date);
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      
      return {
        date: `${day}/${month}`,
        totalMl
      };
    })
    .sort((a, b) => {
      // Trier par date
      const [dayA, monthA] = a.date.split("/").map(Number);
      const [dayB, monthB] = b.date.split("/").map(Number);
      return monthA === monthB ? dayA - dayB : monthA - monthB;
    });

  // Loading state
  if (growthLoading || nutritionLoading) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1><Baby size={32} /> Éléonore Growth Tracker</h1>
        </header>
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (growthError) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1><Baby size={32} /> Éléonore Growth Tracker</h1>
        </header>
        <div className="error-message">
          <h2>Erreur de chargement</h2>
          <p>{growthError}</p>
          <p>Vérifiez que le backend est accessible :</p>
          <a href={`${BACKEND_URL}/growth`} target="_blank" rel="noopener noreferrer">
            {BACKEND_URL}/growth
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1><Baby size={32} /> Éléonore Growth Tracker</h1>
        <div className="stats-summary">
          {lastMeasurement && lastMeasurement.weight && (
            <div className="stat">
              <Scale size={20} />
              <span className="stat-label">Poids</span>
              <span className="stat-value">{lastMeasurement.weight} kg</span>
              {lastMeasurement.weightPercentile && (
                <span className={`stat-percentile percentile-${Math.floor(lastMeasurement.weightPercentile/25)}`}>
                  {lastMeasurement.weightPercentile}ᵉ
                </span>
              )}
            </div>
          )}
          
          {lastMeasurement && lastMeasurement.height && (
            <div className="stat">
              <Ruler size={20} />
              <span className="stat-label">Taille</span>
              <span className="stat-value">{lastMeasurement.height} cm</span>
              {lastMeasurement.heightPercentile && (
                <span className={`stat-percentile percentile-${Math.floor(lastMeasurement.heightPercentile/25)}`}>
                  {lastMeasurement.heightPercentile}ᵉ
                </span>
              )}
            </div>
          )}
          
          {lastMeasurement && lastMeasurement.head && (
            <div className="stat">
              <Brain size={20} />
              <span className="stat-label">Périmètre crânien</span>
              <span className="stat-value">{lastMeasurement.head} cm</span>
              {lastMeasurement.headPercentile && (
                <span className={`stat-percentile percentile-${Math.floor(lastMeasurement.headPercentile/25)}`}>
                  {lastMeasurement.headPercentile}ᵉ
                </span>
              )}
            </div>
          )}
          
          <div className="stat">
            <Droplets size={20} />
            <span className="stat-label">Prises</span>
            <span className="stat-value">{safeNutritionData.length}</span>
          </div>
        </div>
      </header>

      <main className="dashboard">
        {/* Section Poids avec percentiles */}
        <section className="dashboard-section">
          <h2><Scale size={24} /> Évolution du Poids (OMS/CDC)</h2>
          {weightChartData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ 
                      value: "Poids (kg)", 
                      angle: -90, 
                      position: "insideLeft",
                      fill: '#6b7280'
                    }}
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    label={{ 
                      value: "Percentile", 
                      angle: 90, 
                      position: "insideRight",
                      fill: '#6b7280'
                    }}
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => {
                      if (name === "weight") return [`${value} kg`, "Poids"];
                      if (name === "percentile") return [`${value}ᵉ percentile`, "Percentile"];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Area 
                    yAxisId="right"
                    type="monotone"
                    dataKey="percentile"
                    fill="#8884d8"
                    stroke="#8884d8"
                    fillOpacity={0.3}
                    name="Percentile OMS/CDC"
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    stroke="#f59e0b"
                    name="Poids (kg)"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#f59e0b" }}
                    activeDot={{ r: 8, fill: "#d97706" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                <p><strong>Sources:</strong> Courbes de croissance OMS (0-2 ans) et CDC (2+ ans)</p>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>Aucune donnée de poids disponible</p>
            </div>
          )}
        </section>

        {/* Section Taille */}
        <section className="dashboard-section">
          <h2><Ruler size={24} /> Évolution de la Taille</h2>
          {heightChartData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={heightChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ 
                      value: "Taille (cm)", 
                      angle: -90, 
                      position: "insideLeft",
                      fill: '#6b7280'
                    }}
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone"
                    dataKey="percentile"
                    fill="#10b981"
                    stroke="#10b981"
                    fillOpacity={0.2}
                    name="Percentile"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone"
                    dataKey="height"
                    stroke="#3b82f6"
                    name="Taille (cm)"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="no-data">Aucune donnée de taille disponible</p>
          )}
        </section>

        {/* Section Nutrition */}
        <section className="dashboard-section">
          <h2><Droplets size={24} /> Consommation Journalière de Lait</h2>
          {nutritionChartData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={nutritionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    label={{ 
                      value: "Volume total (ml)", 
                      angle: -90, 
                      position: "insideLeft",
                      fill: '#6b7280'
                    }}
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} ml`, "Volume total"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="totalMl" 
                    fill="#8b5cf6" 
                    name="Lait total (ml)"
                    radius={[4, 4, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="no-data">
              <p>Aucune donnée nutritionnelle disponible</p>
              {nutritionError && <p className="error-text">Erreur: {nutritionError}</p>}
            </div>
          )}
        </section>

        {/* Tableau des données */}
        <section className="dashboard-section">
          <h2>📊 Tableau des Mesures Détaillées</h2>
          <div className="data-table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Âge</th>
                  <th>Poids</th>
                  <th>%tile</th>
                  <th>Taille</th>
                  <th>%tile</th>
                  <th>PC</th>
                  <th>%tile</th>
                </tr>
              </thead>
              <tbody>
                {growthDataWithPercentiles.slice(-10).reverse().map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.ageMonths?.toFixed(1)} mois</td>
                    <td>{item.weight ? `${item.weight} kg` : "-"}</td>
                    <td>
                      {item.weightPercentile ? (
                        <span className={`percentile-badge percentile-${Math.floor(item.weightPercentile/25)}`}>
                          {item.weightPercentile}ᵉ
                        </span>
                      ) : "-"}
                    </td>
                    <td>{item.height ? `${item.height} cm` : "-"}</td>
                    <td>
                      {item.heightPercentile ? (
                        <span className={`percentile-badge percentile-${Math.floor(item.heightPercentile/25)}`}>
                          {item.heightPercentile}ᵉ
                        </span>
                      ) : "-"}
                    </td>
                    <td>{item.head ? `${item.head} cm` : "-"}</td>
                    <td>
                      {item.headPercentile ? (
                        <span className={`percentile-badge percentile-${Math.floor(item.headPercentile/25)}`}>
                          {item.headPercentile}ᵉ
                        </span>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section informations */}
        <section className="info-section">
          <h3>ℹ️ Informations</h3>
          <div className="info-grid">
            <div className="info-card">
              <h4>Sources des Percentiles</h4>
              <ul>
                <li><strong>OMS:</strong> Standards de croissance 0-2 ans</li>
                <li><strong>CDC:</strong> Courbes de croissance 2+ ans</li>
                <li>Méthode LMS pour le calcul des percentiles</li>
              </ul>
            </div>
            <div className="info-card">
              <h4>Définition des Percentiles</h4>
              <ul>
                <li><span className="percentile-example percentile-0">3ᵉ</span>: Au-dessus de 3% des enfants</li>
                <li><span className="percentile-example percentile-1">25ᵉ</span>: Au-dessus de 25% des enfants</li>
                <li><span className="percentile-example percentile-2">50ᵉ</span>: Moyenne</li>
                <li><span className="percentile-example percentile-3">75ᵉ</span>: Au-dessus de 75% des enfants</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Éléonore Growth Tracker - Données OMS/CDC - {new Date().getFullYear()}</p>
        <p className="debug-info">
          Backend: <a href={BACKEND_URL} target="_blank" rel="noopener noreferrer">{BACKEND_URL}</a> | 
          {safeGrowthData.length} mesures | {safeNutritionData.length} prises
        </p>
      </footer>
    </div>
  );
}

export default App;





















