// src/GrowthSection.jsx
import React, { useEffect, useState } from "react";
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
import { Scale, Ruler, Brain, Plus } from "lucide-react";
import { omsTables, cdcTables } from "./growthData";

// Backend URL (déjà configuré dans App.jsx ou via .env)
const BACKEND_URL = "https://eleonore-backend.onrender.com";

/* ---------------------------------------------------------------
   Fonction utilitaire : âge en mois (fractionnaire) à partir de la date de naissance
   --------------------------------------------------------------- */
const getAgeInMonths = (birthDate, currentDate) => {
  const birth = new Date(birthDate);
  const cur = new Date(currentDate);
  const years = cur.getFullYear() - birth.getFullYear();
  const months = cur.getMonth() - birth.getMonth();
  const days = cur.getDate() - birth.getDate();

  let age = years * 12 + months + days / 30.4; // approx. month length
  return Math.max(0, age);
};

/* ---------------------------------------------------------------
   Calcul du percentile (fonction fiable)
   --------------------------------------------------------------- */
const calculatePercentile = (value, ageMonths, type, standard) => {
  if (value == null || ageMonths == null) return null;

  // Choix du tableau
  const tables = standard === "oms" ? omsTables : cdcTables;
  const data = tables[type];
  if (!data) return null;

  // Trouver les deux points d’âge autour de ageMonths
  let lower = data[0];
  let upper = data[data.length - 1];

  for (let i = 0; i < data.length; i++) {
    if (data[i].month <= ageMonths) lower = data[i];
    if (data[i].month >= ageMonths) {
      upper = data[i];
      break;
    }
  }

  // Interpolation d’âge (si besoin)
  const interpolate = (key) => {
    const loVal = lower[key];
    const upVal = upper[key];
    if (loVal == null || upVal == null) return null;
    if (lower.month === upper.month) return loVal; // même point
    const ratio = (ageMonths - lower.month) / (upper.month - lower.month);
    return loVal + (upVal - loVal) * ratio;
  };

  // Construire la liste des percentiles disponibles pour ce point d’âge
  const percentiles = [];
  if (lower.p3 != null) percentiles.push({ p: 3, v: interpolate("p3") });
  if (lower.p15 != null) percentiles.push({ p: 15, v: interpolate("p15") });
  if (lower.p50 != null) percentiles.push({ p: 50, v: interpolate("p50") });
  if (lower.p85 != null) percentiles.push({ p: 85, v: interpolate("p85") });
  if (lower.p97 != null) percentiles.push({ p: 97, v: interpolate("p97") });

  // Trier par valeur (au cas où l’ordre serait inversé)
  percentiles.sort((a, b) => a.v - b.v);

  // Gestion des limites
  if (value <= percentiles[0].v) return percentiles[0].p;
  if (value >= percentiles[percentiles.length - 1].v)
    return percentiles[percentiles.length - 1].p;

  // Recherche du segment où se situe la valeur
  for (let i = 0; i < percentiles.length - 1; i++) {
    const cur = percentiles[i];
    const nxt = percentiles[i + 1];
    if (value >= cur.v && value <= nxt.v) {
      const ratio = (value - cur.v) / (nxt.v - cur.v);
      return Math.round(cur.p + (nxt.p - cur.p) * ratio);
    }
  }

  return null; // fallback
};

/* ---------------------------------------------------------------
   Hook personnalisé pour récupérer les mesures de croissance
   --------------------------------------------------------------- */
const useGrowth = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrowth = async () => {
      try {
        const resp = await fetch(`${BACKEND_URL}/growth`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        setData(json);
        setError(null);
      } catch (e) {
        console.error(e);
        setError(e.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGrowth();
  }, []);

  return { data, loading, error };
};

/* ---------------------------------------------------------------
   GrowthSection component
   --------------------------------------------------------------- */
const GrowthSection = ({ selectedStandard }) => {
  const { data, loading, error } = useGrowth();

  // Date de naissance d'Éléonore (fixe dans le projet)
  const birthDate = "2025-05-14";

  // Enrichir les données avec âge et percentiles
  const enriched = data.map((item) => {
    const ageMonths = getAgeInMonths(birthDate, item.date);
    return {
      ...item,
      ageMonths: Number(ageMonths.toFixed(2)),
      weightPercentile:
        item.weight != null
          ? calculatePercentile(item.weight, ageMonths, "weight", selectedStandard)
          : null,
      heightPercentile:
        item.height != null
          ? calculatePercentile(item.height, ageMonths, "height", selectedStandard)
          : null,
      headPercentile:
        item.head != null
          ? calculatePercentile(item.head, ageMonths, "head", selectedStandard)
          : null,
    };
  });

  // Préparer les datasets pour les graphiques
  const prepareDataset = (key, label) =>
    enriched
      .filter((d) => d[key] != null)
      .map((d) => ({
        date: new Date(d.date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        }),
        value: d[key],
        percentile: d[`${key}Percentile`],
        label,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

  const weightData = prepareDataset("weight", "Poids (kg)");
  const heightData = prepareDataset("height", "Taille (cm)");
  const headData = prepareDataset("head", "Tour de tête (cm)");

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-600 mr-3"></div>
        <span>Chargement des mesures…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 text-red-800 rounded">
        <h2 className="font-bold mb-2">Erreur de chargement</h2>
        <p>{error}</p>
        <p>
          Vérifiez que le backend est accessible :
          <a
            href={`${BACKEND_URL}/growth`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-pink-600 ml-2"
          >
            {BACKEND_URL}/growth
          </a>
        </p>
      </div>
    );
  }

  // -------------------------------------------------
  // Fonction de rendu d’un graphique (réutilisable)
  // -------------------------------------------------
  const renderChart = (title, data, yKey, color, percentileColor) => (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        {title === "Poids" && <Scale size={24} />}
        {title === "Taille" && <Ruler size={24} />}
        {title === "Tour de tête" && <Brain size={24} />}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-600">Aucune donnée disponible.</p>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fill: "#4a5568", fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              label={{
                value: title,
                angle: -90,
                position: "insideLeft",
                fill: "#4a5568",
                fontSize: 12,
              }}
              tick={{ fill: "#4a5568" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{
                value: "Percentile",
                angle: 90,
                position: "insideRight",
                fill: "#4a5568",
                fontSize: 12,
              }}
              tick={{ fill: "#4a5568" }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", borderRadius: "4px" }}
              formatter={(value, name) => [
                typeof value === "number" ? value.toFixed(2) : value,
                name,
              ]}
            />
            <Legend />
            {/* Percentile line (right axis) */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="percentile"
              stroke={percentileColor}
              fill={percentileColor}
              fillOpacity={0.2}
              name={`Percentile ${selectedStandard.toUpperCase()}`}
            />
            {/* Valeur principale (left axis) */}
            <Line
              yAxisId="left"
              type="monotone
