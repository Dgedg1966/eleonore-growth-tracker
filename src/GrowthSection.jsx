// src/GrowthSection.jsx
import React, { useEffect, useState } from "react";
import {
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
   Backend URL – fixed to the one you gave
   ----------------------------------------------------------------- */
const BACKEND_URL = "https://eleonore-backend.onrender.com";

/* -----------------------------------------------------------------
   Import reference tables (OMS & CDC) – they contain the full set of
   percentiles you posted in growthData.js
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
   Linear interpolation between two age rows
   ----------------------------------------------------------------- */
const interpolateRow = (low, high, targetAge) => {
  if (low.month === high.month) return low; // exact match
  const ratio = (targetAge - low.month) / (high.month - low.month);
  const out = { month: targetAge };
  // Interpolate every numeric field (p3, p15, p50, p85, p97)
  Object.keys(low).forEach((key) => {
    if (key === "month") return;
    const lo = low[key];
    const hi = high[key];
    if (typeof lo === "number" && typeof hi === "number") {
      out[key] = lo + (hi - lo) * ratio;
    }
  });
  return out;
};

/* -----------------------------------------------------------------
   Percentile calculator – works for both OMS (5 percentiles) and
   CDC (3 percentiles). Returns the percentile number (0‑100).
   ----------------------------------------------------------------- */
const calculatePercentile = (value, ageMonths, type, tables) => {
  if (value == null) return null;
  const data = tables[type];
  if (!data) return null;

  // Find the two rows that bound the target age
  let lower = data[0];
  let upper = data[data.length - 1];
  for (let i = 0; i < data.length; i++) {
    if (data[i].month <= ageMonths) lower = data[i];
    if (data[i].month >= ageMonths) {
      upper = data[i];
      break;
    }
  }

  // Interpolated row for the exact age
  const row = interpolateRow(lower, upper, ageMonths);

  // Build an ordered list of available percentiles for this row
  const percList = [];
  if (row.p3 != null) percList.push({ p: 3, v: row.p3 });
  if (row.p15 != null) percList.push({ p: 15, v: row.p15 });
  if (row.p50 != null) percList.push({ p: 50, v: row.p50 });
  if (row.p85 != null) percList.push({ p: 85, v: row.p85 });
  if (row.p97 != null) percList.push({ p: 97, v: row.p97 });

  // Sort by the value (just in case)
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
export default function GrowthSection({ selectedStandard }) {
  const { data, loading, error } = useGrowthData();

  const birthDate = "2025-05-14";

  // -----------------------------------------------------------------
  // 1️⃣  Enrich each row with age (months) and percentiles for each metric
  // -----------------------------------------------------------------
  const enriched = data.map((row) => ({
    ...row,
    ageMonths: getAgeInMonths(birthDate, row.date),
  }));

  // Choose the correct reference tables
  const tables = selectedStandard === "oms" ? omsTables : cdcTables;

  // Add percentile values for each measurement
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

  // -----------------------------------------------------------------
  // 2️⃣  Build series for the **reference percentiles** (each percentile = its own line)
  // -----------------------------------------------------------------
  const buildReferenceSeries = (type) => {
    // We iterate over the whole table (0‑24 mois) and output a point for each month
    const table = tables[type];
    const series = {};

    // Initialise empty arrays for each percentile we have in the table
    Object.keys(table[0]).forEach((key) => {
      if (key.startsWith("p")) series[key] = [];
    });

    table.forEach((row) => {
      const label = `${row.month} mo`;
      Object.keys(series).forEach((pKey) => {
        series[pKey].push({ month: label, value: row[pKey] });
      });
    });
    return series; // e.g. { p3: [...], p15: [...], … }
  };

  const weightRefs = buildReferenceSeries("weight");
  const heightRefs = buildReferenceSeries("height");
  const headRefs = buildReferenceSeries("head");

  // -----------------------------------------------------------------
  // 3️⃣  Build series for Éléonore’s **actual measurements**
  // -----------------------------------------------------------------
  const formatDate = (iso) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}`;
  };

  const buildChildSeries = (key) =>
    withPercentiles
      .filter((r) => r[key] != null)
      .map((r) => ({
        date: formatDate(r.date),
        value: r[key],
      }));

  const weightChild = buildChildSeries("weight");
  const heightChild = buildChildSeries("height");
  const headChild = buildChildSeries("head");

  // -----------------------------------------------------------------
  // 4️⃣  Rendering helper – one chart per metric
  // -----------------------------------------------------------------
  const renderChart = (title, refs, childSeries, yLabel, lineColor) => (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        {title === "Poids" && <Scale size={24} />}
        {title === "Taille" && <Ruler size={24} />}
        {title === "Tour de tête" && <Brain size={24} />}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={childSeries}>
          {/* Axes */}
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
          {/* Right axis for percentiles (0‑100) */}
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

          {/* ----- Reference percentile lines (each on its own colour) ----- */}
          {Object.entries(refs).map(([pKey, pts]) => (
            <Line
              key={pKey}
              yAxisId="right"
              type="monotone"
              data={pts}
              dataKey="value"
              stroke={
                // Assign distinct colours per percentile
                pKey === "p3"
                  ? "#a3a3a3"
                  : pKey === "p15"
                  ? "#7c7c7c"
                  : pKey === "p50"
                  ? "#4b5563"
                  : pKey === "p85"
                  ? "#374151"
                  : "#1f2937"
              }
              strokeDasharray="5 5"
              dot={false}
              name={`OMS ${pKey.toUpperCase()}`}
            />
          ))}

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
    </section>
  );

  // -----------------------------------------------------------------
  // 5️⃣  UI (loading / error / main render)
  // -----------------------------------------------------------------
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
      {/* ---- Summary cards (latest values) ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Weight card */}
        <div className="bg-pink-100 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-2">Poids</h3>
          <p className="text-2xl font-semibold">
            {weightChild[weightChild.length - 1]?.value ?? "–"} kg
          </p>
          <p className="text-sm text-gray-600">
            P{" "}
            {withPercentiles[withPercentiles.length - 1]?.weightPercentile ??
              "–"}
          </p>
        </div>

        {/* Height card */}
        <div className="bg-green-100 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-2">Taille</h3>
          <p className="text-2xl font-semibold">
            {heightChild[heightChild.length - 1]?.value ?? "–"} cm
          </p>
          <p className="text-sm text-gray-600">
            P{" "}
            {withPercentiles[withPercentiles.length - 1]?.heightPercentile ??
              "–"}
          </p>
        </div>

        {/* Head circumference card */}
        <div className="bg-purple-100 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-2">Tour de tête</h3>
          <p className="text-2xl font-semibold">
            {headChild[headChild.length - 1]?.value ?? "–"} cm
          </p>
          <p className="text-sm text-gray-600">
            P{" "}
            {withPercentiles[withPercentiles.length - 1]?.headPercentile ??
              "–"}
          </p>
        </div>
      </div>

      {/* ---- Charts (one per metric) ---- */}
      {renderChart(
        "Poids",
        weightRefs,
        weightChild,
        "Poids (kg)",
        "#ec4899"
      )}
      {renderChart(
        "Taille",
        heightRefs,
        heightChild,
        "Taille (cm)",
        "#10b981"
      )}
      {renderChart(
        "Tour de tête",
        headRefs,
        headChild,
        "Tour de tête (cm)",
        "#6366f1"
      )}
    </div>
  );
}
