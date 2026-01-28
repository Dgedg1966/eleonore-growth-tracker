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
import { Scale, Ruler, Brain } from "lucide-react";

/* -----------------------------------------------------------------
   Backend URL – fixed to the one you gave
   ----------------------------------------------------------------- */
const BACKEND_URL =
  "https://eleonore-backend.onrender.com";

/* -----------------------------------------------------------------
   Import the reference tables (OMS & CDC) – they contain the full
   percentile sets you posted in growthData.js
   ----------------------------------------------------------------- */
import { omsTables, cdcTables } from "./growthData";

/* -----------------------------------------------------------------
   Helper – age in months (fractional) from birth date
   ----------------------------------------------------------------- */
const getAgeInMonths = (birthDate, currentDate) => {
  const birth = new Date(birthDate);
  const cur = new Date(currentDate);
  const years = cur.getFullYear() - birth.getFullYear();
  const months = cur.getMonth() - birth.getMonth();
  const days = cur.getDate() - birth.getDate();

  // Approximate month length = 30.44 days (average Gregorian month)
  const age = years * 12 + months + days / 30.44;
  return Math.max(0, age);
};

/* -----------------------------------------------------------------
   Percentile calculator – works for both OMS (p3,p15,p50,p85,p97)
   and CDC (p3,p50,p97).  It interpolates linearly between the two
   nearest age rows and then linearly between the two nearest
   percentile values.
   ----------------------------------------------------------------- */
const calculatePercentile = (value, ageMonths, type, tables) => {
  if (value == null || ageMonths == null) return null;
  const data = tables[type];
  if (!data) return null;

  // Find surrounding age rows
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
  const interp = (key) => {
    const lo = lower[key];
    const hi = upper[key];
    if (lo == null || hi == null) return null;
    if (lower.month === upper.month) return lo; // exact age match
    const ratio = (ageMonths - lower.month) / (upper.month - lower.month);
    return lo + (hi - lo) * ratio;
  };

  // Build the list of available percentiles for this age
  const percList = [];
  if (lower.p3 != null) percList.push({ p: 3, v: interp("p3") });
  if (lower.p15 != null) percList.push({ p: 15, v: interp("p15") });
  if (lower.p50 != null) percList.push({ p: 50, v: interp("p50") });
  if (lower.p85 != null) percList.push({ p: 85, v: interp("p85") });
  if (lower.p97 != null) percList.push({ p: 97, v: interp("p97") });

  // Sort by value (just in case)
  percList.sort((a, b) => a.v - b.v);

  // Clamp to extremes
  if (value <= percList[0].v) return percList[0].p;
  if (value >= percList[percList.length - 1].v)
    return percList[percList.length - 1].p;

  // Find the interval where the value lies and interpolate the percentile
  for (let i = 0; i < percList.length - 1; i++) {
    const cur = percList[i];
    const nxt = percList[i + 1];
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

  const birthDate = "2025-05-14";

  // Enrich each row with age (months) and percentiles for each metric
  const enriched = data.map((row) => ({
    ...row,
    ageMonths: getAgeInMonths(birthDate, row.date),
  }));

  // Choose the reference tables according to the selected standard
  const tables = selectedStandard === "oms" ? omsTables : cdcTables;

  // Add percentile values to each measurement
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

  // Build series for each metric (value + percentile)
  const buildSeries = (key) =>
    withPercentiles
      .filter((r) => r[key] != null)
      .map((r) => ({
        date: formatDate(r.date),
        value: r[key],
        percentile: r[`${key}Percentile`],
      }));

  const weightSeries = buildSeries("weight");
  const heightSeries = buildSeries("height");
  const headSeries = buildSeries("head");

  /* -----------------------------------------------------------------
     Rendering helpers – one chart per metric
     ----------------------------------------------------------------- */
  const renderChart = (title, series, yLabel, lineColor) => (
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
            {/* Grid & axes */}
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#4a5568", fontSize: 12 }}
              axisLine={{ stroke: "#cbd5e0" }}
            />
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
            {/* Percentile axis (right) */}
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

            {/* Tooltip */}
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", borderRadius: "4px" }}
              formatter={(val, name) => [
                typeof val === "number" ? val.toFixed(2) : val,
                name,
              ]}
            />
            <Legend />

            {/* ----- Percentile areas (light background) ----- */}
            {/* We draw the five percentile curves as separate Areas.
                The fill colour is very light so the child’s line stays prominent. */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="percentile"
              stroke="#6b7280"
              fill="#6b7280"
              fillOpacity={0.1}
              name={`Percentile (${selectedStandard.toUpperCase()})`}
            />

            {/* ----- Child’s actual measurements (bold line) ----- */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={4}
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

  /* -----------------------------------------------------------------
     UI rendering
     ----------------------------------------------------------------- */
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

  return (
    <div className="mt-6">
      {/* ---- Metric cards (summary) ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Weight */}
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

        {/* Height */}
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

        {/* Head circumference */}
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

      {/* ---- Charts ---- */}
      {renderChart("Poids", weightSeries, "Poids (kg)", "#ec4899")}
      {renderChart("Taille", heightSeries, "Taille (cm)", "#10b981")}
      {renderChart("Tour de tête", headSeries, "Tour de tête (cm)", "#6366f1")}
    </div>
  );
};

export default GrowthSection;
