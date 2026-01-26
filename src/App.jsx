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
  Bar,
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

// Importer VOS données OMS/CDC depuis votre fichier
import { omsTables, cdcTables } from "./growthData";

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

// Ajoutez ceci dans votre fichier App.jsx actuel, dans la partie Growth
const [selectedStandard, setSelectedStandard] = useState('oms'); // 'oms' ou 'cdc'

// Dans le JSX, ajoutez ce sélecteur :
<div className="standard-selector">
  <h3>Choisir la référence :</h3>
  <div className="standard-buttons">
    <button 
      className={`standard-btn ${selectedStandard === 'oms' ? 'active' : ''}`}
      onClick={() => setSelectedStandard('oms')}
    >
      OMS (Organisation Mondiale de la Santé)
    </button>
    <button 
      className={`standard-btn ${selectedStandard === 'cdc' ? 'active' : ''}`}
      onClick={() => setSelectedStandard('cdc')}
    >
      CDC (Centers for Disease Control)
    </button>
  </div>
  <p className="standard-info">
    {selectedStandard === 'oms' 
      ? "Référence internationale pour les enfants de 0 à 24 mois" 
      : "Référence américaine utilisée au-delà de 24 mois"}
  </p>
</div>

// Fonction pour calculer le percentile basé sur vos données OMS/CDC
const calculatePercentile = (value, ageInMonths, type) => {
  if (!value || ageInMonths === null || ageInMonths === undefined) {
    return null;
  }

  // Choisir la table appropriée (OMS pour 0-24 mois, CDC pour plus précis ou >24 mois)
  const useOMS = ageInMonths <= 24;
  const tables = useOMS ? omsTables : cdcTables;
  const tableData = tables[type];
  
  if (!tableData || tableData.length === 0) {
    return null;
  }

  // Trouver les entrées d'âge les plus proches
  let lowerEntry = null;
  let upperEntry = null;
  
  for (const entry of tableData) {
    if (entry.month <= ageInMonths) {
      lowerEntry = entry;
    }
    if (entry.month >= ageInMonths) {
      upperEntry = entry;
      break;
    }
  }

  // Si on a une correspondance exacte
  if (lowerEntry && lowerEntry.month === ageInMonths) {
    return getExactPercentile(value, lowerEntry);
  }

  // Si on a deux entrées pour interpolation
  if (lowerEntry && upperEntry && lowerEntry.month !== upperEntry.month) {
    return interpolatePercentile(value, ageInMonths, lowerEntry, upperEntry);
  }

  // Si on n'a qu'une seule entrée (âge hors des bornes)
  if (lowerEntry) {
    return getExactPercentile(value, lowerEntry);
  }
  if (upperEntry) {
    return getExactPercentile(value, upperEntry);
  }

  return null;
};

// Fonction pour obtenir le percentile exact à partir d'une entrée
const getExactPercentile = (value, entry) => {
  // Vérifier les percentiles disponibles (OMS a p3, p15, p50, p85, p97, CDC a p3, p50, p97)
  const percentiles = [];
  
  if (entry.p3 !== undefined) percentiles.push({ value: entry.p3, percentile: 3 });
  if (entry.p15 !== undefined) percentiles.push({ value: entry.p15, percentile: 15 });
  if (entry.p50 !== undefined) percentiles.push({ value: entry.p50, percentile: 50 });
  if (entry.p85 !== undefined) percentiles.push({ value: entry.p85, percentile: 85 });
  if (entry.p97 !== undefined) percentiles.push({ value: entry.p97, percentile: 97 });
  
  // Trier par valeur
  percentiles.sort((a, b) => a.value - b.value);
  
  // Vérifier les bornes
  if (value <= percentiles[0].value) return percentiles[0].percentile;
  if (value >= percentiles[percentiles.length - 1].value) return percentiles[percentiles.length - 1].percentile;
  
  // Trouver entre quels percentiles se situe la valeur
  for (let i = 0; i < percentiles.length - 1; i++) {
    const current = percentiles[i];
    const next = percentiles[i + 1];
    
    if (value >= current.value && value <= next.value) {
      // Interpolation linéaire
      const range = next.value - current.value;
      const position = (value - current.value) / range;
      return Math.round(current.percentile + (next.percentile - current.percentile) * position);
    }
  }
  
  return 50; // Par défaut
};

// Fonction pour interpoler entre deux âges
const interpolatePercentile = (value, age, lowerEntry, upperEntry) => {
  // Interpolation linéaire des valeurs de percentile
  const ageRange = upperEntry.month - lowerEntry.month;
  const agePosition = (age - lowerEntry.month) / ageRange;
  
  // Fonction pour interpoler une valeur de percentile
  const interpolateValue = (percentileKey) => {
    if (lowerEntry[percentileKey] !== undefined && upperEntry[percentileKey] !== undefined) {
      const lowerValue = lowerEntry[percentileKey];
      const upperValue = upperEntry[percentileKey];
      return lowerValue + (upperValue - lowerValue) * agePosition;
    }
    return null;
  };
  
  // Créer une entrée interpolée
  const interpolatedEntry = {
    p3: interpolateValue('p3'),
    p15: interpolateValue('p15'),
    p50: interpolateValue('p50'),
    p85: interpolateValue('p85'),
    p97: interpolateValue('p97'),
  };
  
  // Obtenir le percentile à partir de l'entrée interpolée
  return getExactPercentile(value, interpolatedEntry);
};

// Fonction pour obtenir l'âge en mois (plus précise)
const getAgeInMonths = (birthDate, currentDate) => {
  if (!birthDate || !currentDate) return 0;
  
  try {
    const birth = new Date(birthDate);
    const current = new Date(currentDate);
    
    if (isNaN(birth.getTime()) || isNaN(current.getTime())) {
      return 0;
    }
    
    // Calculer la différence en mois
    let months = (current.getFullYear() - birth.getFullYear()) * 12;
    months += current.getMonth() - birth.getMonth();
    
    // Ajuster pour les jours
    if (current.getDate() < birth.getDate()) {
      months--;
    }
    
    // Ajouter la fraction du mois
    const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    const dayOfMonth = current.getDate();
    const fraction = dayOfMonth / daysInMonth;
    
    return Math.max(0, months + fraction);
  } catch (error) {
    console.error("Error calculating age:", error);
    return 0;
  }
};

// Composant Tooltip personnalisé pour les graphiques
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Date: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: <strong>{entry.value}{entry.name.includes("Percentile") ? "ᵉ" : ""}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
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
      ageMonths: parseFloat(ageMonths.toFixed(2)),
      weightPercentile: item.weight ? calculatePercentile(item.weight, ageMonths, "weight") : null,
      heightPercentile: item.height ? calculatePercentile(item.height, ageMonths, "height") : null,
      headPercentile: item.head ? calculatePercentile(item.head, ageMonths, "head") : null
    };
  });

  // Dernière mesure
  const lastMeasurement = growthDataWithPercentiles.length > 0 
    ? growthDataWithPercentiles[growthDataWithPercentiles.length - 1] 
    : null;

  // Fonction pour préparer les données de graphique
  const prepareChartData = (type, label) => {
    return growthDataWithPercentiles
      .filter(item => item[type] && item.date)
      .map(item => {
        // Formater la date
        const date = new Date(item.date);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        return {
          date: `${day}/${month}`,
          fullDate: item.date,
          [type]: item[type],
          value: item[type],
          percentile: item[`${type}Percentile`],
          ageMonths: item.ageMonths,
          label: label
        };
      })
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
  };

  const weightChartData = prepareChartData("weight", "Poids (kg)");
  const heightChartData = prepareChartData("height", "Taille (cm)");
  const headChartData = prepareChartData("head", "Périmètre crânien (cm)");

  // Regrouper la nutrition par jour
  const nutritionByDay = {};
  safeNutritionData.forEach(entry => {
    if (entry.date && entry.ml) {
      const dateKey = entry.date.split("T")[0];
      if (!nutritionByDay[dateKey]) {
        nutritionByDay[dateKey] = { totalMl: 0, count: 0 };
      }
      nutritionByDay[dateKey].totalMl += entry.ml;
      nutritionByDay[dateKey].count++;
    }
  });

  const nutritionChartData = Object.entries(nutritionByDay)
    .map(([date, data]) => {
      const dateObj = new Date(date);
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      
      return {
        date: `${day}/${month}`,
        fullDate: date,
        totalMl: data.totalMl,
        count: data.count,
        averageMl: data.totalMl / data.count
      };
    })
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  // Loading state
  if (growthLoading || nutritionLoading) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1><Baby size={32} /> Éléonore Growth Tracker</h1>
        </header>
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement des données de croissance...</p>
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
          <div className="debug-links">
            <a href={`${BACKEND_URL}/growth`} target="_blank" rel="noopener noreferrer">
              {BACKEND_URL}/growth
            </a>
            <a href={`${BACKEND_URL}/health`} target="_blank" rel="noopener noreferrer">
              /health
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1><Baby size={32} /> Éléonore Growth Tracker</h1>
        <div className="header-subtitle">
          <p>Suivi de croissance avec percentiles OMS/CDC</p>
        </div>
        <div className="stats-summary">
          {lastMeasurement && (
            <>
              {lastMeasurement.weight && (
                <div className="stat-card">
                  <div className="stat-icon">
                    <Scale size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Poids actuel</span>
                    <span className="stat-value">{lastMeasurement.weight} kg</span>
                    {lastMeasurement.weightPercentile && (
                      <span className={`stat-percentile percentile-${Math.floor(lastMeasurement.weightPercentile/25)}`}>
                        {lastMeasurement.weightPercentile}ᵉ percentile
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {lastMeasurement.height && (
                <div className="stat-card">
                  <div className="stat-icon">
                    <Ruler size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Taille actuelle</span>
                    <span className="stat-value">{lastMeasurement.height} cm</span>
                    {lastMeasurement.heightPercentile && (
                      <span className={`stat-percentile percentile-${Math.floor(lastMeasurement.heightPercentile/25)}`}>
                        {lastMeasurement.heightPercentile}ᵉ percentile
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {lastMeasurement.head && (
                <div className="stat-card">
                  <div className="stat-icon">
                    <Brain size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">PC actuel</span>
                    <span className="stat-value">{lastMeasurement.head} cm</span>
                    {lastMeasurement.headPercentile && (
                      <span className={`stat-percentile percentile-${Math.floor(lastMeasurement.headPercentile/25)}`}>
                        {lastMeasurement.headPercentile}ᵉ percentile
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="stat-card">
            <div className="stat-icon">
              <Droplets size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">Données disponibles</span>
              <span className="stat-value">{safeGrowthData.length} mesures</span>
              <span className="stat-subvalue">{safeNutritionData.length} prises</span>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard">
        {/* Section Poids */}
        <section className="dashboard-section">
          <div className="section-header">
            <Scale size={28} />
            <h2>Évolution du Poids avec Percentiles OMS/CDC</h2>
          </div>
          {weightChartData.length > 0 ? (
            <div className="chart-wrapper">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#4a5568', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e0' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      label={{ 
                        value: "Poids (kg)", 
                        angle: -90, 
                        position: "insideLeft",
                        fill: '#4a5568',
                        fontSize: 12
                      }}
                      tick={{ fill: '#4a5568' }}
                      axisLine={{ stroke: '#cbd5e0' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      label={{ 
                        value: "Percentile", 
                        angle: 90, 
                        position: "insideRight",
                        fill: '#4a5568',
                        fontSize: 12
                      }}
                      tick={{ fill: '#4a5568' }}
                      axisLine={{ stroke: '#cbd5e0' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      yAxisId="right"
                      type="monotone"
                      dataKey="percentile"
                      fill="#9f7aea"
                      stroke="#9f7aea"
                      fillOpacity={0.3}
                      name="Percentile OMS/CDC"
                      strokeWidth={1}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      stroke="#ed8936"
                      name="Poids (kg)"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#ed8936" }}
                      activeDot={{ r: 8, fill: "#dd6b20" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-info">
                <p>
                  <strong>Source des percentiles:</strong> OMS (0-24 mois) et CDC standards. 
                  Les courbes montrent la position relative par rapport aux références internationales.
                </p>
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
          <div className="section-header">
            <Ruler size={28} />
            <h2>Évolution de la Taille</h2>
          </div>
          {heightChartData.length > 0 ? (
            <div className="chart-wrapper">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={heightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#4a5568', fontSize: 12 }}
                    />
                    <YAxis 
                      label={{ 
                        value: "Taille (cm)", 
                        angle: -90, 
                        position: "insideLeft",
                        fill: '#4a5568'
                      }}
                      tick={{ fill: '#4a5568' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone"
                      dataKey="percentile"
                      fill="#48bb78"
                      stroke="#48bb78"
                      fillOpacity={0.2}
                      name="Percentile"
                    />
                    <Line 
                      type="monotone"
                      dataKey="height"
                      stroke="#4299e1"
                      name="Taille (cm)"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#4299e1" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="no-data">Aucune donnée de taille disponible</p>
          )}
        </section>

        {/* Section Nutrition */}
        <section className="dashboard-section">
          <div className="section-header">
            <Droplets size={28} />
            <h2>Consommation Journalière de Lait</h2>
          </div>
          {nutritionChartData.length > 0 ? (
            <div className="chart-wrapper">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={nutritionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#4a5568', fontSize: 12 }}
                    />
                    <YAxis 
                      label={{ 
                        value: "Volume total (ml)", 
                        angle: -90, 
                        position: "insideLeft",
                        fill: '#4a5568'
                      }}
                      tick={{ fill: '#4a5568' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} ml`, "Volume"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="totalMl" 
                      fill="#d53f8c" 
                      name="Lait total (ml)"
                      radius={[4, 4, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>Aucune donnée nutritionnelle disponible</p>
              {nutritionError && (
                <div className="error-text">
                  <p>Erreur nutrition: {nutritionError}</p>
                  <a href={`${BACKEND_URL}/nutrition`} target="_blank" rel="noopener noreferrer">
                    Vérifier l'endpoint /nutrition
                  </a>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Tableau des données détaillées */}
        <section className="dashboard-section table-section">
          <div className="section-header">
            <Plus size={28} />
            <h2>Détail des Mesures avec Percentiles</h2>
          </div>
          <div className="data-table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Âge (mois)</th>
                  <th>Poids (kg)</th>
                  <th>%tile</th>
                  <th>Taille (cm)</th>
                  <th>%tile</th>
                  <th>PC (cm)</th>
                  <th>%tile</th>
                </tr>
              </thead>
              <tbody>
                {growthDataWithPercentiles.slice(-15).reverse().map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.ageMonths.toFixed(1)}</td>
                    <td>{item.weight ? `${item.weight.toFixed(2)}` : "-"}</td>
                    <td>
                      {item.weightPercentile ? (
                        <span className={`percentile-badge percentile-${Math.floor(item.weightPercentile/25)}`}>
                          {item.weightPercentile}ᵉ
                        </span>
                      ) : "-"}
                    </td>
                    <td>{item.height ? `${item.height.toFixed(1)}` : "-"}</td>
                    <td>
                      {item.heightPercentile ? (
                        <span className={`percentile-badge percentile-${Math.floor(item.heightPercentile/25)}`}>
                          {item.heightPercentile}ᵉ
                        </span>
                      ) : "-"}
                    </td>
                    <td>{item.head ? `${item.head.toFixed(1)}` : "-"}</td>
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

        {/* Section d'information */}
        <section className="info-section">
          <h3>À propos des Percentiles OMS/CDC</h3>
          <div className="info-grid">
            <div className="info-card">
              <h4><Scale size={20} /> Interprétation des Percentiles</h4>
              <ul>
                <li><span className="percentile-example percentile-0">3ᵉ-24ᵉ</span>: Inférieur à la moyenne</li>
                <li><span className="percentile-example percentile-1">25ᵉ-49ᵉ</span>: Moyenne basse</li>
                <li><span className="percentile-example percentile-2">50ᵉ-74ᵉ</span>: Moyenne haute</li>
                <li><span className="percentile-example percentile-3">75ᵉ-97ᵉ</span>: Supérieur à la moyenne</li>
              </ul>
            </div>
            <div className="info-card">
              <h4><Ruler size={20} /> Sources des Données</h4>
              <ul>
                <li><strong>OMS:</strong> Standards internationaux 0-24 mois</li>
                <li><strong>CDC:</strong> Courbes américaines de référence</li>
                <li>Les deux systèmes utilisent la méthode LMS</li>
              </ul>
            </div>
            <div className="info-card">
              <h4><Brain size={20} /> Notes Importantes</h4>
              <ul>
                <li>Les percentiles sont des références, pas des objectifs</li>
                <li>La régularité de la croissance est plus importante</li>
                <li>Consulter un pédiatre pour interprétation médicale</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>Éléonore Growth Tracker</strong> - Système de suivi de croissance avec références OMS/CDC
          </p>
          <div className="footer-links">
            <a href={`${BACKEND_URL}/health`} target="_blank" rel="noopener noreferrer">
              Vérifier l'état du backend
            </a>
            <span className="separator">•</span>
            <span>{safeGrowthData.length} mesures de croissance</span>
            <span className="separator">•</span>
            <span>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;























