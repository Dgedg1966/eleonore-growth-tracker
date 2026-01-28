// src/GrowthSection.jsx
//Eleonore
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

/* -----------------------------------------------------------------
   Backend URL – can be overridden with REACT_APP_BACKEND_URL
   ----------------------------------------------------------------- */
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://YOUR_BACKEND_URL_ON_RENDER.com";

/* -----------------------------------------------------------------
   Helper – calculate age in months (fractional) from birth date
   ----------------------------------------------------------------- */
const getAgeInMonths = (birthDate, currentDate) => {
  const birth = new Date(birthDate);
  const cur = new Date(currentDate);
  const years = cur.getFullYear() - birth.getFullYear();
  const months = cur.getMonth() - birth.getMonth();
  const days = cur.getDate() - birth.getDate();

  // Approximate month length = 30.4 days (average Gregorian month)
  const age = years * 12 + months + days / 30.4;
  return Math.max(0, age);
};

/* -----------------------------------------------------------------
   Percentile calculation – works for both OMS (full set) and CDC
   ----------------------------------------------------------------- */
const calculatePercentile = (value, ageMonths, type, tables) => {
  if (value == null || ageMonths == null) return null;

  const data = tables[type];
  if (!data) return null;

  // Find the two surrounding age points
  let lower = data[0];
  let upper = data[data.length - 1];

  for (let i = 0; i < data.length; i++) {
    if (data[i].month <= ageMonths) lower = data[i];
    if (data[i].month >= ageMonths) {
      upper = data[i];
      break;
    }
  }

  // Linear interpolation of each percentile between lower & upper ages
  const interpolate = (key) => {
    const lo = lower[key];
    const hi = upper[key];
    if (lo == null || hi == null) return null;
    if (lower.month === upper.month) return lo; // exact match
    const ratio = (ageMonths - lower.month) / (upper.month - lower.month);
    return lo + (hi - lo) * ratio;
  };

  // Build the list of available percentiles for this age
  const percentiles = [];
  if (lower.p3 != null) percentiles.push({ p: 3, v: interpolate("p3") });
  if (lower.p15 != null) percentiles.push({ p: 15, v: interpolate("p15") });
  if (lower.p50 != null) percentiles.push({ p: 50, v: interpolate("p50") });
  if (lower.p85 != null) percentiles.push({ p: 85, v: interpolate("p85") });
  if (lower.p97 != null) percentiles.push({ p: 97, v: interpolate("p97") });

  // Sort by value (just in case)
  percentiles.sort((a, b) => a.v - b.v);

  // Clamp to extremes
  if (value <= percentiles[0].v) return percentiles[0].p;
  if (value >= percentiles[percentiles.length - 1].v)
    return percentiles[percentiles.length - 1].p;

  // Find the interval where the value sits and interpolate the percentile
  for (let i = 0; i < percentiles.length - 1; i++) {
    const cur = percentiles[i];
    const nxt = percentiles[i + 1];
    if (value >= cur.v && value <= nxt.v) {
      const ratio = (value - cur.v) / (nxt.v - cur.v);
      return Math.round(cur.p + (nxt.p - cur.p) * ratio);
    }
  }

  return null; // safety fallback
};

/* -----------------------------------------------------------------
   Hook – fetch growth data from the backend
   ----------------------------------------------------------------- */
const useGrowthData = () => {
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

/* -----------------------------------------------------------------
   GrowthSection component
   ----------------------------------------------------------------- */
const GrowthSection = ({ selectedStandard }) => {
  const { data, loading, error } = useGrowthData();

  // Birth date of Éléonore (fixed in the original workbook)
  const birthDate = "2025-05-14";

  // Enrich each row with age (months) and percentiles for each metric
  const enriched = data.map((row) => {
    const ageMonths = getAgeInMonths(birthDate, row.date);
    return {
      ...row,
      ageMonths: Number(ageMonths.toFixed(2)),
    };
  });

  // Choose the correct reference tables (OMS or CDC) – they are imported
  // from growthData.js in the parent component (App.jsx) and passed
  // via context or props. Here we import them directly for simplicity.
  // If you prefer to pass them as props, adjust accordingly.
  // --------------------------------------------------------------
  // NOTE: In the final project `growthData.js` exports `omsTables` &
  // `cdcTables`. We import them here.
  // --------------------------------------------------------------
  // eslint-disable-next-line import/no-unresolved

  const tables = selectedStandard === "oms" ? { weight: omsTables.weight, height: omsTables.height, head: omsTables.head } : { weight: cdcTables.weight, height: cdcTables.height, head: cdcTables.head };

  // Compute percentiles for each measurement
  const withPercentiles = enriched.map((row) => ({
    ...row,
    weightPercentile:
      row.weight != null
        ? calculatePercentile(row.weight, row.ageMonths, "weight", tables)
        : null,
    heightPercentile:
      row.height != null
        ? calculatePercentile(row.height, row.ageMonths, "height", tables)
        : null,
    headPercentile:
      row.head != null
        ? calculatePercentile(row.head, row.ageMonths, "head", tables)
        : null,
  }));

  // Helper to format dates for the X‑axis (dd/mm)
  const formatDate = (iso) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}`;
  };

  // Prepare data series for each metric
  const weightSeries = withPercentiles
    .filter((r) => r.weight != null)
    .map((r) => ({
      date: formatDate(r.date),
      value: r.weight,
      percentile: r.weightPercentile,
    }));
  const heightSeries = withPercentiles
    .filter((r) => r.height != null)
    .map((r) => ({
      date: formatDate(r.date),
      value: r.height,
      percentile: r.heightPercentile,
    }));
  const headSeries = withPercentiles
    .filter((r) => r.head != null)
    .map((r) => ({
      date: formatDate(r.date),
      value: r.head,
      percentile: r.headPercentile,
    }));

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

  /* -----------------------------------------------------------------
     Render helper – generic chart for a given series
     ----------------------------------------------------------------- */
  const renderMetricChart = (title, series, yLabel, lineColor) => (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        {title === "Poids" && <Scale size={24} />}
        {title === "Taille" && <Ruler size={24} />}
        {title === "Tour de tête" && <Brain size={24} />}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      {series.length === 0 ? (
        <p className="text-gray-600">Aucune donnée disponible.</p>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fill: "#4a5568", fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              label={{
                value: yLabel,
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
              formatter={(val, name) => [
                typeof val === "number" ? val.toFixed(2) : val,
                name,
              ]}
            />
            <Legend />
            {/* Percentile line (right axis) */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="percentile"
              stroke="#6b7280"
              fill="#6b7280"
              fillOpacity={0.2}
              name={`Percentile ${selectedStandard.toUpperCase()}`}
            />
            {/* Main value line (left axis) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={5}
              dot={{
                r: 6,
                stroke: "#fff",
                strokeWidth: 2,
              }}
              name={title}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </section>
  );

  return (
    <div className="mt-6">
      {/* ------------------- METRIC CARDS ------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Weight card */}
        <div className="bg-pink-100 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-2">Poids</h3>
          <p className="text-2xl font-semibold">
            {weightSeries[weightSeries.length - 1]?.value ?? "–"} kg
          </p>
          <p className="text-sm text-gray-600">
            P{" "}
            {weightSeries[weightSeries.length - 1]?.percentile != null
              ? weightSeries[weightSeries.length - 1].percentile
              : "–"}
          </p>
        </div>

        {/* Height card */}
        <div className="bg-green-100 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-2">Taille</h3>
          <p className="text-2xl font-semibold">
            {heightSeries[heightSeries.length - 1]?.value ?? "–"} cm
          </p>
          <p className="text-sm text-gray-600">
            P{" "}
            {heightSeries[heightSeries.length - 1]?.percentile != null
              ? heightSeries[heightSeries.length - 1].percentile
              : "–"}
          </p>
        </div>

        {/* Head circumference card */}
        <div className="bg-purple-100 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-2">Tour de tête</h3>
          <p className="text-2xl font-semibold">
            {headSeries[headSeries.length - 1]?.value ?? "–"} cm
          </p>
          <p className="text-sm text-gray-600">
            P{" "}
            {headSeries[headSeries.length - 1]?.percentile != null
              ? headSeries[headSeries.length - 1].percentile
              : "–"}
          </p>
        </div>
      </div>

      {/* ------------------- CHARTS ------------------- */}
      {renderMetricChart(
        "Poids",
        weightSeries,
        "Poids (kg)",
        "#ec4899"
      )}
      {renderMetricChart(
        "Taille",
        heightSeries,
        "Taille (cm)",
        "#10b981"
      )}
      {renderMetricChart(
        "Tour de tête",
        headSeries,
        "Tour de tête (cm)",
        "#6366f1"
      )}
    </div>
  );
};

export default GrowthSection;
