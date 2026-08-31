import { useState, useMemo } from "react";
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine,
    AreaChart, Area,
} from "recharts";
import {
    FiTrendingUp, FiDroplet, FiArrowUp, FiCalendar,
    FiAlertTriangle, FiCheckCircle, FiAlertOctagon, FiInfo,
} from "react-icons/fi";
import { StaggerGrid, StaggerItem } from "../../Components/SharedComponents/Motion.jsx";
import { useChartTheme } from "../../Components/SharedComponents/chartTheme.js";
import {
    ALL_MONTHS, ZONE_DATA, HOUSEHOLD_DATA, ZONE_HOUSEHOLDS,
    TIME_PERIODS, ZONE_COMPARISON,
} from "../../lib/demandForecastData.js";

// ─── Risk tokens (same palette as DigitalTwin) ────────────────────────────────
const R = {
    Low:    { badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400", dot: "bg-emerald-500", hex: "#10b981", Icon: FiCheckCircle },
    Medium: { badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",         dot: "bg-amber-500",  hex: "#f59e0b", Icon: FiAlertTriangle },
    High:   { badge: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",                 dot: "bg-red-500",   hex: "#ef4444", Icon: FiAlertOctagon  },
};

// Historical bar colour and predicted line colour
const HIST_COLOR = "#38bdf8";   // sky-400
const PRED_COLOR = "#f97316";   // orange-500
const HIST_AREA  = "#bae6fd";   // sky-200

// ─── Small components ─────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon: Icon, tone }) => {
    const tones = {
        sky:     "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
        amber:   "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
        orange:  "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400",
    };
    return (
        <div className="flex flex-col rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <span className={`flex h-7 w-7 items-center justify-center rounded-md ${tones[tone]}`}>
                    <Icon className="h-4 w-4" />
                </span>
            </div>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
            {sub && <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{sub}</p>}
        </div>
    );
};

/** Custom tooltip for the main chart */
const MainTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md border border-slate-200 bg-white p-3 shadow-lg text-xs dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 font-semibold text-slate-700 dark:text-slate-300">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                        {Number(p.value).toLocaleString()} L
                    </span>
                </div>
            ))}
        </div>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const DemandForecast = () => {
    const t = useChartTheme();

    const [selectedZone,      setSelectedZone]      = useState("A");
    const [selectedHousehold, setSelectedHousehold] = useState("All");
    const [selectedPeriod,    setSelectedPeriod]    = useState(1); // index into TIME_PERIODS

    const period = TIME_PERIODS[selectedPeriod];

    // Build chart data from zone or household
    const chartData = useMemo(() => {
        const isAll = selectedHousehold === "All";
        const src   = isAll
            ? ZONE_DATA[selectedZone]
            : HOUSEHOLD_DATA[selectedHousehold];

        const histSlice = src.historical.slice(-period.histCount);
        const predSlice = src.predicted.slice(0, period.predCount);
        const histMonths = ALL_MONTHS.slice(0, 6).slice(-period.histCount);
        const predMonths = ALL_MONTHS.slice(6, 6 + period.predCount);

        return [
            ...histSlice.map((v, i) => ({ month: histMonths[i], historical: v, predicted: null, type: "hist" })),
            ...predSlice.map((v, i) => ({ month: predMonths[i], historical: null, predicted: v, type: "pred" })),
        ];
    }, [selectedZone, selectedHousehold, selectedPeriod]);

    // Prediction summary values
    const currentDemand   = chartData.find((d) => d.historical)
        ? [...chartData].reverse().find((d) => d.historical)?.historical ?? 0
        : 0;
    const predictedDemand = chartData.find((d) => d.predicted)?.predicted ?? 0;
    const changePct       = currentDemand
        ? (((predictedDemand - currentDemand) / currentDemand) * 100).toFixed(1)
        : "0.0";
    const forecastMonths  = period.predCount;

    // Households to show in select
    const householdsForZone = ZONE_HOUSEHOLDS[selectedZone] ?? [];

    // Determine split index — where predicted starts
    const splitIdx = chartData.findIndex((d) => d.type === "pred");

    // Zone comparison area chart data — always zone-level 6 historical months
    const comparisonData = ALL_MONTHS.slice(0, 6).map((month, i) => ({
        month,
        "Zone A": ZONE_DATA.A.historical[i],
        "Zone B": ZONE_DATA.B.historical[i],
        "Zone C": ZONE_DATA.C.historical[i],
    }));

    const lastUpdated = new Date().toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

    return (
        <div>
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Demand Forecast
                        </h1>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        Analyse historical consumption and predicted water demand.
                    </p>
                </div>
                <p className="pt-1 text-xs text-slate-400 dark:text-slate-500">
                    Last updated: {lastUpdated}
                </p>
            </div>

            {/* ── Filters ──────────────────────────────────────────────────── */}
            <div className="mt-4 flex flex-wrap items-end gap-3">
                {/* Zone */}
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Select Zone
                    </label>
                    <select
                        value={selectedZone}
                        onChange={(e) => {
                            setSelectedZone(e.target.value);
                            setSelectedHousehold("All");
                        }}
                        className="rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        {Object.entries(ZONE_DATA).map(([id, z]) => (
                            <option key={id} value={id}>{z.label}</option>
                        ))}
                    </select>
                </div>

                {/* Household */}
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Select Household
                    </label>
                    <select
                        value={selectedHousehold}
                        onChange={(e) => setSelectedHousehold(e.target.value)}
                        className="rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="All">All Households (Zone Level)</option>
                        {householdsForZone.map((hid) => (
                            <option key={hid} value={hid}>{hid}</option>
                        ))}
                    </select>
                </div>

                {/* Time period */}
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Time Period
                    </label>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                        className="rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        {TIME_PERIODS.map((p, i) => (
                            <option key={i} value={i}>{p.label}</option>
                        ))}
                    </select>
                </div>

                {/* Active selection pill */}
                <div className="flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400">
                    <FiDroplet className="h-3.5 w-3.5" />
                    {ZONE_DATA[selectedZone].label}
                    {selectedHousehold !== "All" ? ` · ${selectedHousehold}` : " · Zone Total"}
                </div>
            </div>

            {/* ── Prediction summary cards ──────────────────────────────────── */}
            <StaggerGrid className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StaggerItem className="h-full">
                    <StatCard
                        label="Current Demand"
                        value={`${currentDemand.toLocaleString()} L`}
                        sub="Latest historical month"
                        icon={FiDroplet}
                        tone="sky"
                    />
                </StaggerItem>
                <StaggerItem className="h-full">
                    <StatCard
                        label="Predicted Demand"
                        value={`${predictedDemand.toLocaleString()} L`}
                        sub="Next forecast month"
                        icon={FiTrendingUp}
                        tone="orange"
                    />
                </StaggerItem>
                <StaggerItem className="h-full">
                    <StatCard
                        label="Demand Change"
                        value={`${changePct > 0 ? "+" : ""}${changePct}%`}
                        sub="vs. latest historical month"
                        icon={FiArrowUp}
                        tone={Number(changePct) < 5 ? "emerald" : Number(changePct) < 10 ? "amber" : "orange"}
                    />
                </StaggerItem>
                <StaggerItem className="h-full">
                    <StatCard
                        label="Forecast Period"
                        value={`${forecastMonths} months`}
                        sub="Simulated ahead horizon"
                        icon={FiCalendar}
                        tone="sky"
                    />
                </StaggerItem>
            </StaggerGrid>

            {/* ── Main demand chart ─────────────────────────────────────────── */}
            <div className="mt-3 rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            Historical Consumption & Predicted Demand
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {ZONE_DATA[selectedZone].label}
                            {selectedHousehold !== "All" ? ` · ${selectedHousehold}` : " · Zone Total"} · Simulated data
                        </p>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="h-3 w-3 rounded-sm" style={{ background: HIST_COLOR }} />
                            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Historical Data</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="h-3 w-3 rounded-sm" style={{ background: PRED_COLOR }} />
                            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Predicted Demand</span>
                        </div>
                    </div>
                </div>

                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 11, fill: t.tick }}
                                axisLine={false} tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: t.tick }}
                                axisLine={false} tickLine={false}
                                tickFormatter={(v) =>
                                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                                }
                            />
                            <Tooltip content={<MainTooltip />} />

                            {/* Divider between historical and predicted */}
                            {splitIdx > 0 && (
                                <ReferenceLine
                                    x={chartData[splitIdx]?.month}
                                    stroke="#94a3b8"
                                    strokeDasharray="4 3"
                                    label={{
                                        value: "Forecast →",
                                        position: "insideTopRight",
                                        fontSize: 10,
                                        fill: "#94a3b8",
                                    }}
                                />
                            )}

                            {/* Historical bars */}
                            <Bar
                                dataKey="historical"
                                name="Historical Data"
                                fill={HIST_COLOR}
                                radius={[3, 3, 0, 0]}
                                maxBarSize={40}
                            />

                            {/* Predicted line */}
                            <Line
                                dataKey="predicted"
                                name="Predicted Demand"
                                stroke={PRED_COLOR}
                                strokeWidth={2.5}
                                strokeDasharray="5 3"
                                dot={{ r: 5, fill: PRED_COLOR, strokeWidth: 2, stroke: "white" }}
                                activeDot={{ r: 7 }}
                                connectNulls
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Zone comparison chart ─────────────────────────────────────── */}
            <div className="mt-3 rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Zone Comparison</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            Historical consumption across all zones (simulated)
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {Object.entries(ZONE_DATA).map(([id, z]) => (
                            <div key={id} className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ background: R[z.risk].hex }} />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{z.label}</span>
                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${R[z.risk].badge}`}>
                                    {z.risk}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={comparisonData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                            <defs>
                                {Object.entries(ZONE_DATA).map(([id, z]) => (
                                    <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={R[z.risk].hex} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={R[z.risk].hex} stopOpacity={0.0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: t.tick }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: t.tick }} axisLine={false} tickLine={false}
                                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                {...t.tooltip}
                                formatter={(v, name) => [`${Number(v).toLocaleString()} L`, name]}
                            />
                            {Object.entries(ZONE_DATA).map(([id, z]) => (
                                <Area
                                    key={id}
                                    type="monotone"
                                    dataKey={z.label}
                                    stroke={R[z.risk].hex}
                                    strokeWidth={2}
                                    fill={`url(#grad-${id})`}
                                    dot={{ r: 3, fill: R[z.risk].hex }}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary row */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                    {ZONE_COMPARISON.map((z) => {
                        const s = R[z.risk];
                        return (
                            <div key={z.id} className="rounded-sm border border-slate-100 p-3 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{z.label}</span>
                                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${s.badge}`}>{z.risk}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Current: <span className="font-medium text-slate-800 dark:text-slate-200">{z.current.toLocaleString()} L</span>
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Predicted: <span className="font-medium text-slate-800 dark:text-slate-200">{z.predicted.toLocaleString()} L</span>
                                </p>
                                <p className={`mt-1 text-[11px] font-semibold ${z.changePct > 0 ? "text-orange-500" : "text-emerald-500"}`}>
                                    {z.changePct > 0 ? "▲" : "▼"} {Math.abs(z.changePct)}% forecast change
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DemandForecast;
