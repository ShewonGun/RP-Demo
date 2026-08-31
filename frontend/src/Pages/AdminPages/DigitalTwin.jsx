import { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
    FiDroplet, FiAlertTriangle, FiCheckCircle, FiAlertOctagon,
    FiMapPin, FiHome, FiActivity, FiRefreshCw, FiPlay, FiPause,
    FiCalendar, FiChevronRight, FiChevronLeft, FiInfo,
} from "react-icons/fi";
import { StaggerGrid, StaggerItem } from "../../Components/SharedComponents/Motion.jsx";
import { useChartTheme } from "../../Components/SharedComponents/chartTheme.js";
import ZoneDetailModal from "../../Components/AdminComponents/ZoneDetailModal.jsx";
import HouseholdDetailModal from "../../Components/AdminComponents/HouseholdDetailModal.jsx";
import { ZONES as initialZones, HOUSEHOLDS as initialHouseholds, SUMMARY as initialSummary, NETWORK } from "../../lib/digitalTwinData.js";

// ─── Monthly Data Profiles for Panel Demonstration ───────────────────────────
// Simulates Water Board monthly supply & consumption cycles (Jan – Sep)

const MONTHLY_PROFILES = [
    {
        month: "Jan",
        label: "January (Normal Supply)",
        type: "Historical",
        zoneA: 78, zoneB: 58, zoneC: 45,
        summaryNote: "Water Board distribution complete. Storage levels optimal across all zones.",
        demands: { A: 42000, B: 49000, C: 55000 },
    },
    {
        month: "Feb",
        label: "February (Dry Spell Start)",
        type: "Historical",
        zoneA: 74, zoneB: 52, zoneC: 38,
        summaryNote: "Moderate reduction in Zone C storage due to increased dry season usage.",
        demands: { A: 45000, B: 52000, C: 58000 },
    },
    {
        month: "Mar",
        label: "March (Peak Dry Season)",
        type: "Historical",
        zoneA: 69, zoneB: 44, zoneC: 31,
        summaryNote: "Zone C storage drops to Critical (31%). Priority reordered to Zone C rank #1.",
        demands: { A: 47000, B: 55000, C: 62000 },
    },
    {
        month: "Apr",
        label: "April (Water Board Tank Refill)",
        type: "Historical",
        zoneA: 82, zoneB: 65, zoneC: 55,
        summaryNote: "Water Board bulk distribution cycle executed. Tank storage replenished across network.",
        demands: { A: 46000, B: 50000, C: 54000 },
    },
    {
        month: "May",
        label: "May (Moderate Consumption)",
        type: "Historical",
        zoneA: 76, zoneB: 54, zoneC: 42,
        summaryNote: "Post-refill consumption steady. Zone B and C in normal-caution range.",
        demands: { A: 50000, B: 53000, C: 57000 },
    },
    {
        month: "Jun",
        label: "June (Current Month)",
        type: "Current",
        zoneA: 72, zoneB: 48, zoneC: 31,
        summaryNote: "Current active month. Zone C enters High Risk status (< 35% storage threshold).",
        demands: { A: 52000, B: 56000, C: 65000 },
    },
    {
        month: "Jul",
        label: "July (Demand Forecast)",
        type: "Forecast",
        zoneA: 65, zoneB: 40, zoneC: 24,
        summaryNote: "Forecasted demand indicates severe deficit in Zone C unless Water Board triggers early refill.",
        demands: { A: 54000, B: 58000, C: 68000 },
    },
    {
        month: "Aug",
        label: "August (Forecasted Water Board Distribution)",
        type: "Forecast",
        zoneA: 85, zoneB: 70, zoneC: 60,
        summaryNote: "Forecasted scheduled bulk distribution cycle. Restores adequate storage reserves.",
        demands: { A: 55000, B: 60000, C: 70000 },
    },
];

// ─── Risk colour tokens ───────────────────────────────────────────────────────

const R = {
    Low: {
        badge:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
        border:  "border-emerald-200 dark:border-emerald-800",
        bar:     "bg-emerald-500",
        hex:     "#10b981",
        wave:    "#10b981",
        waveLt:  "#34d399",
        dot:     "bg-emerald-500",
        nodeBg:  "bg-emerald-50 dark:bg-emerald-950/20",
        iconCls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
        Icon:    FiCheckCircle,
    },
    Medium: {
        badge:   "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
        border:  "border-amber-200 dark:border-amber-800",
        bar:     "bg-amber-500",
        hex:     "#f59e0b",
        wave:    "#f59e0b",
        waveLt:  "#fbbf24",
        dot:     "bg-amber-500",
        nodeBg:  "bg-amber-50 dark:bg-amber-950/20",
        iconCls: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
        Icon:    FiAlertTriangle,
    },
    High: {
        badge:   "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
        border:  "border-red-200 dark:border-red-800",
        bar:     "bg-red-500",
        hex:     "#ef4444",
        wave:    "#ef4444",
        waveLt:  "#f87171",
        dot:     "bg-red-500",
        nodeBg:  "bg-red-50 dark:bg-red-950/20",
        iconCls: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
        Icon:    FiAlertOctagon,
    },
};

const priorityCls = {
    1: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
    2: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    3: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
};

// ─── Water Tank SVG Component ─────────────────────────────────────────────────

const WaterTank = ({ percentage, risk, label, width = 90, height = 150 }) => {
    const s = R[risk] || R.Low;
    const uid = `wt-${label?.replace(/\s+/g, "")}-${percentage}`;

    const fillH  = Math.max(0, Math.min(1, percentage / 100)) * height;
    const waterY = height - fillH;
    const capH   = 14;
    const capW   = width * 0.65;
    const waveAmp   = 5;
    const waveW     = width * 3;

    const buildWave = (yBase, amp, w) => {
        const pts = [];
        const steps = 12;
        for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * w;
            const y = yBase + Math.sin((i / steps) * Math.PI * 2) * amp;
            pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
        }
        pts.push(`L${w},${height + 4} L0,${height + 4} Z`);
        return pts.join(" ");
    };

    const textColor = fillH > height * 0.45 ? "white" : "#1e293b";

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", width: width + 12 }}>
                <svg
                    width={width + 12}
                    height={height + capH + 6}
                    viewBox={`-6 -${capH} ${width + 12} ${height + capH + 6}`}
                    overflow="visible"
                >
                    <defs>
                        <clipPath id={`clip-${uid}`}>
                            <rect x={0} y={0} width={width} height={height} rx={6} ry={6} />
                        </clipPath>
                        <linearGradient id={`shine-${uid}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%"   stopColor="white" stopOpacity="0.0" />
                            <stop offset="30%"  stopColor="white" stopOpacity="0.12" />
                            <stop offset="60%"  stopColor="white" stopOpacity="0.04" />
                            <stop offset="100%" stopColor="white" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id={`waterfade-${uid}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={s.waveLt} stopOpacity="0.9" />
                            <stop offset="100%" stopColor={s.wave}   stopOpacity="1.0" />
                        </linearGradient>
                    </defs>

                    <rect x={(width - capW) / 2} y={-capH + 4} width={capW} height={capH} rx={3} fill="#94a3b8" />
                    <rect x={width / 2 - 6} y={-capH - 2} width={12} height={10} rx={2} fill="#64748b" />

                    <rect x={0} y={0} width={width} height={height} rx={6} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={2} />

                    {[25, 50, 75].map((mark) => {
                        const my = height - (mark / 100) * height;
                        return (
                            <g key={mark}>
                                <line x1={width - 10} y1={my} x2={width - 2} y2={my} stroke="#94a3b8" strokeWidth={1} />
                                <text x={width - 13} y={my + 3} fontSize={7} fill="#94a3b8" textAnchor="end">{mark}%</text>
                            </g>
                        );
                    })}

                    <g clipPath={`url(#clip-${uid})`}>
                        {fillH > 0 && <rect x={0} y={waterY + waveAmp} width={width} height={fillH} fill={`url(#waterfade-${uid})`} />}
                        {fillH > 0 && (
                            <path d={buildWave(waterY, waveAmp, waveW)} fill={s.waveLt} opacity={0.75}>
                                <animateTransform attributeName="transform" type="translate" values={`0,0;${-width},0;${-width * 2},0`} dur="4s" repeatCount="indefinite" />
                            </path>
                        )}
                        {fillH > 0 && (
                            <path d={buildWave(waterY + 2, waveAmp * 0.7, waveW)} fill={s.wave} opacity={0.6}>
                                <animateTransform attributeName="transform" type="translate" values={`${-width},0;0,0;${-width},0`} dur="3.2s" repeatCount="indefinite" />
                            </path>
                        )}
                    </g>

                    <rect x={0} y={0} width={width} height={height} rx={6} fill={`url(#shine-${uid})`} />
                    <rect x={0} y={0} width={width} height={height} rx={6} fill="none" stroke="#64748b" strokeWidth={2} />

                    <text x={width / 2} y={height / 2 + 6} textAnchor="middle" fontSize={20} fontWeight={700} fill={textColor}>
                        {percentage}%
                    </text>
                    <text x={width / 2} y={height / 2 + 20} textAnchor="middle" fontSize={9} fill={textColor} opacity={0.7}>
                        storage
                    </text>
                    <rect x={width / 2 - 8} y={height} width={16} height={6} fill="#94a3b8" />
                </svg>
            </div>

            {label && (
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#334155", margin: 0 }}>{label}</p>
                </div>
            )}
        </div>
    );
};

// ─── Small mini tank ─────────────────────────────────────────────────────────

const MiniTank = ({ percentage, risk }) => {
    const s = R[risk] || R.Low;
    const w = 36, h = 52;
    const uid = `mini-${risk}-${percentage}`;
    const fillH  = Math.max(0, Math.min(1, percentage / 100)) * h;
    const waterY = h - fillH;
    const waveW  = w * 3;

    const buildWave = (yBase, amp, tw) => {
        const pts = [];
        const steps = 8;
        for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * tw;
            const y = yBase + Math.sin((i / steps) * Math.PI * 2) * amp;
            pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
        }
        pts.push(`L${tw},${h + 4} L0,${h + 4} Z`);
        return pts.join(" ");
    };

    return (
        <svg width={w + 4} height={h + 6} viewBox={`-2 0 ${w + 4} ${h + 6}`} overflow="visible">
            <defs>
                <clipPath id={`clip-${uid}`}>
                    <rect x={0} y={0} width={w} height={h} rx={3} />
                </clipPath>
            </defs>
            <rect x={0} y={0} width={w} height={h} rx={3} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.5} />
            <g clipPath={`url(#clip-${uid})`}>
                {fillH > 0 && <rect x={0} y={waterY + 3} width={w} height={fillH} fill={s.hex} opacity={0.85} />}
                {fillH > 0 && (
                    <path d={buildWave(waterY, 3, waveW)} fill={s.waveLt} opacity={0.7}>
                        <animateTransform attributeName="transform" type="translate" values={`0,0;${-w},0;${-w * 2},0`} dur="3.5s" repeatCount="indefinite" />
                    </path>
                )}
            </g>
            <rect x={0} y={0} width={w} height={h} rx={3} fill="none" stroke="#64748b" strokeWidth={1.5} />
            <text x={w / 2} y={h / 2 + 4} textAnchor="middle" fontSize={9} fontWeight={700} fill={fillH > h * 0.45 ? "white" : "#1e293b"}>
                {percentage}%
            </text>
        </svg>
    );
};

// ─── Reusable pieces ──────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, tone }) => {
    const tones = {
        sky:     "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
        amber:   "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
        red:     "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
    };
    return (
        <div className="flex flex-col rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <span className={`flex h-7 w-7 items-center justify-center rounded-md ${tones[tone]}`}>
                    <Icon className="h-4 w-4" />
                </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
    );
};

const NetNode = ({ label, sublabel, icon: Icon, tone = "sky" }) => {
    const cls = {
        sky:   "bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-400",
        slate: "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
    }[tone];
    return (
        <div className={`flex items-center gap-2 rounded-sm border px-4 py-2.5 ${cls}`}>
            <Icon className="h-4 w-4 shrink-0" />
            <div>
                <p className="text-xs font-semibold leading-none">{label}</p>
                {sublabel && <p className="mt-0.5 text-[10px] opacity-70">{sublabel}</p>}
            </div>
        </div>
    );
};

const Arrow = () => (
    <div className="flex flex-col items-center py-0.5">
        <div className="w-px h-5 bg-slate-300 dark:bg-slate-700" />
        <div className="h-0 w-0 border-x-[5px] border-x-transparent border-t-[7px] border-t-slate-300 dark:border-t-slate-700" />
    </div>
);

const HouseholdPill = ({ h, onClick }) => {
    const s = R[h.risk];
    return (
        <button
            type="button"
            onClick={() => onClick(h)}
            title={`${h.id} · ${h.risk} risk · ${h.storagePercentage}% storage`}
            className={`inline-flex h-6 items-center gap-1 rounded-md border px-1.5 text-[10px] font-medium transition hover:opacity-75 ${s.badge} ${s.border}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {h.id}
        </button>
    );
};

const ZoneCard = ({ zone, households, onZone, onHousehold }) => {
    const s = R[zone.risk];
    return (
        <div className={`flex flex-col overflow-hidden rounded-sm border-2 ${s.border} bg-white dark:bg-slate-900`}>
            <button
                type="button"
                onClick={() => onZone(zone)}
                className={`flex items-center justify-between gap-2 p-3 text-left transition hover:opacity-90 ${s.nodeBg}`}
            >
                <div className="flex items-center gap-2">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${s.iconCls}`}>
                        <FiMapPin className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{zone.name}</span>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${s.badge}`}>
                    {zone.risk}
                </span>
            </button>

            <div className="flex items-center gap-3 border-t border-slate-100 px-3 py-2 dark:border-slate-800">
                <div className="shrink-0">
                    <MiniTank percentage={zone.storagePercentage} risk={zone.risk} />
                </div>
                <div className="flex-1 grid grid-cols-1 gap-y-1">
                    <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Households</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{zone.households}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Predicted Demand</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {zone.predictedDemand.toLocaleString()} L / day
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-800">
                <p className="mb-1.5 text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Households ({households.length})
                </p>
                <div className="flex flex-wrap gap-1">
                    {households.map((h) => (
                        <HouseholdPill key={h.id} h={h} onClick={onHousehold} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Main Page Component ──────────────────────────────────────────────────────

const DigitalTwin = () => {
    const t = useChartTheme();
    const [selZone, setSelZone]           = useState(null);
    const [selHousehold, setSelHousehold] = useState(null);

    // Monthly Stepper State (Panel Demo Mode)
    const [selectedMonthIdx, setSelectedMonthIdx] = useState(5); // Default to June (Current)
    const [isPlayingMonthly, setIsPlayingMonthly] = useState(false);

    const currentProfile = MONTHLY_PROFILES[selectedMonthIdx];

    // Compute Zones for current selected month
    const zones = [
        {
            id: "A", name: "Zone A", households: 10,
            storagePercentage: currentProfile.zoneA,
            predictedDemand: currentProfile.demands.A,
            risk: currentProfile.zoneA >= 60 ? "Low" : currentProfile.zoneA >= 35 ? "Medium" : "High",
        },
        {
            id: "B", name: "Zone B", households: 10,
            storagePercentage: currentProfile.zoneB,
            predictedDemand: currentProfile.demands.B,
            risk: currentProfile.zoneB >= 60 ? "Low" : currentProfile.zoneB >= 35 ? "Medium" : "High",
        },
        {
            id: "C", name: "Zone C", households: 10,
            storagePercentage: currentProfile.zoneC,
            predictedDemand: currentProfile.demands.C,
            risk: currentProfile.zoneC >= 60 ? "Low" : currentProfile.zoneC >= 35 ? "Medium" : "High",
        },
    ];

    // Compute priority sorting based on storage percentage
    zones.sort((a, b) => a.storagePercentage - b.storagePercentage);
    zones.forEach((z, idx) => { z.priority = idx + 1; });

    // Compute summary stats
    const avgStoragePct = Math.round(zones.reduce((acc, z) => acc + z.storagePercentage, 0) / 3);
    const highPriorityZones = zones.filter((z) => z.risk === "High").length;
    const summary = {
        totalZones: 3,
        totalHouseholds: 30,
        averageStoragePct: avgStoragePct,
        highPriorityZones: highPriorityZones,
    };

    // Generate household storages relative to zone percentage for current month
    const households = initialHouseholds.map((h) => {
        const zoneObj = zones.find((z) => z.id === h.zone);
        const basePct = zoneObj ? zoneObj.storagePercentage : h.storagePercentage;
        // slight jitter per household (+- 4%)
        const offset = ((parseInt(h.id.replace("H", ""), 10) % 5) - 2) * 2;
        const pct = Math.max(5, Math.min(98, basePct + offset));
        return {
            ...h,
            storagePercentage: pct,
            availableWater: Math.round(1000 * pct / 100),
            risk: pct >= 60 ? "Low" : pct >= 35 ? "Medium" : "High",
        };
    });

    // Auto-play monthly stepper effect
    useEffect(() => {
        if (!isPlayingMonthly) return;
        const timer = setInterval(() => {
            setSelectedMonthIdx((prev) => (prev + 1) % MONTHLY_PROFILES.length);
        }, 2500);
        return () => clearInterval(timer);
    }, [isPlayingMonthly]);

    const householdsOf = (zoneId) => households.filter((h) => h.zone === zoneId);
    const byPriority = [...zones].sort((a, b) => a.priority - b.priority);
    const demandData = zones.map((z) => ({ name: z.name, demand: z.predictedDemand, fill: R[z.risk]?.hex || "#10b981" }));

    return (
        <div>
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Digital Twin Overview
                        </h1>
                        <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400">
                            Monthly Supply Model
                        </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        Monthly bulk distribution &amp; consumption monitoring across Zone A, Zone B, and Zone C.
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 justify-end">
                        <FiCalendar className="h-3.5 w-3.5 text-sky-500" />
                        Active Cycle: <span className="text-sky-600 dark:text-sky-400">{currentProfile.label}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Water Board Resolution: 1 Month Billing Cycle
                    </p>
                </div>
            </div>

            {/* ── Monthly Supply Cycle Stepper ──────────────────── */}
            <div className="mt-4 rounded-sm border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900 dark:bg-sky-950/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500 text-white">
                            <FiCalendar className="h-4 w-4" />
                        </span>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                                Monthly Supply Cycle Stepper
                            </p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                Select any month below to inspect Water Board bulk distribution and storage trends.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsPlayingMonthly(!isPlayingMonthly)}
                        className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition ${
                            isPlayingMonthly
                                ? "bg-amber-500 text-white hover:bg-amber-600"
                                : "bg-sky-500 text-white hover:bg-sky-600"
                        }`}
                    >
                        {isPlayingMonthly ? (
                            <>
                                <FiPause className="h-3.5 w-3.5" /> Pause Cycle Tour
                            </>
                        ) : (
                            <>
                                <FiPlay className="h-3.5 w-3.5" /> Play Cycle Tour
                            </>
                        )}
                    </button>
                </div>

                {/* Month Selector Buttons */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {MONTHLY_PROFILES.map((p, idx) => {
                        const isSelected = idx === selectedMonthIdx;
                        const isForecast = p.type === "Forecast";
                        const isCurrent  = p.type === "Current";
                        return (
                            <button
                                key={p.month}
                                type="button"
                                onClick={() => {
                                    setSelectedMonthIdx(idx);
                                    setIsPlayingMonthly(false);
                                }}
                                className={`flex items-center gap-1 rounded px-3 py-1.5 text-xs font-semibold transition ${
                                    isSelected
                                        ? "bg-slate-900 text-white shadow dark:bg-sky-500 dark:text-white"
                                        : isForecast
                                        ? "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300"
                                        : isCurrent
                                        ? "bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300"
                                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                }`}
                            >
                                <span>{p.month}</span>
                                {isForecast && <span className="text-[9px] opacity-75 font-mono">(Forecast)</span>}
                                {isCurrent && <span className="text-[9px] opacity-90 font-mono">(Current)</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Active Month Description Note */}
                <div className="mt-3 flex items-start gap-2 rounded bg-white p-2.5 text-xs text-slate-700 border border-sky-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                    <FiInfo className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" />
                    <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{currentProfile.label}: </span>
                        <span>{currentProfile.summaryNote}</span>
                    </div>
                </div>
            </div>

            {/* ── Summary cards ────────────────────────────────────────────── */}
            <StaggerGrid className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StaggerItem className="h-full">
                    <StatCard label="Total Zones"         value={summary.totalZones}              icon={FiMapPin}       tone="sky"     />
                </StaggerItem>
                <StaggerItem className="h-full">
                    <StatCard label="Total Households"    value={summary.totalHouseholds}         icon={FiHome}         tone="sky"     />
                </StaggerItem>
                <StaggerItem className="h-full">
                    <StatCard label="Average Storage"     value={`${summary.averageStoragePct}%`} icon={FiDroplet}      tone="emerald" />
                </StaggerItem>
                <StaggerItem className="h-full">
                    <StatCard label="High Priority Zones" value={summary.highPriorityZones}       icon={FiAlertOctagon} tone="red"     />
                </StaggerItem>
            </StaggerGrid>

            {/* ── Zone Water Tanks — visual storage display ─────────────────── */}
            <div className="mt-3 rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            Zone Water Storage Tanks ({currentProfile.month} Cycle)
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            Refilled monthly by Water Board bulk delivery · Depleted by monthly household consumption
                        </p>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        Threshold: &lt;35% critical · 35–60% caution · &gt;60% adequate
                    </p>
                </div>

                <div className="flex flex-wrap justify-around gap-8 py-2">
                    {zones.map((z) => (
                        <button
                            key={z.id}
                            type="button"
                            onClick={() => setSelZone(z)}
                            className="flex flex-col items-center gap-2 rounded-sm p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            title={`Click to view ${z.name} details`}
                        >
                            <WaterTank
                                percentage={z.storagePercentage}
                                risk={z.risk}
                                width={90}
                                height={160}
                            />
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{z.name}</p>
                                <span className={`mt-0.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${R[z.risk]?.badge || ""}`}>
                                    {z.risk} Risk
                                </span>
                                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                                    {z.predictedDemand.toLocaleString()} L demand · {z.households} households
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Network diagram ───────────────────────────────────────────── */}
            <div className="mt-3 rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Water Distribution Network
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        Click a zone header to view details · Click a household pill for household info
                    </p>
                </div>

                <div className="flex flex-col items-center">
                    <NetNode label={NETWORK.source.label}           sublabel={NETWORK.source.sublabel}           icon={FiDroplet}  tone="sky"   />
                    <Arrow />
                    <NetNode label={NETWORK.distributionNode.label} sublabel={NETWORK.distributionNode.sublabel} icon={FiActivity} tone="slate" />
                    <Arrow />
                    <div className="mt-1 w-full grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {zones.map((z) => (
                            <ZoneCard
                                key={z.id}
                                zone={z}
                                households={householdsOf(z.id)}
                                onZone={setSelZone}
                                onHousehold={setSelHousehold}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Bottom row ───────────────────────────────────────────────── */}
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">

                {/* Priority ranking */}
                <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <p className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Zone Priority Ranking ({currentProfile.month})</p>
                    <div className="flex flex-col gap-3">
                        {byPriority.map((z) => {
                            const s = R[z.risk] || R.Low;
                            return (
                                <button
                                    key={z.id}
                                    type="button"
                                    onClick={() => setSelZone(z)}
                                    className="flex items-center gap-3 rounded-sm border border-slate-100 p-3 text-left transition hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                                >
                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${priorityCls[z.priority] || priorityCls[3]}`}>
                                        {z.priority}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{z.name}</p>
                                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                            {z.storagePercentage}% storage · {z.predictedDemand.toLocaleString()} L demand
                                        </p>
                                    </div>
                                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${s.badge}`}>
                                        {z.risk}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
                        Priority dynamically reordered based on monthly storage level and demand.
                    </p>
                </div>

                {/* Demand chart */}
                <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Simulated Monthly Demand</p>
                        <span className="text-xs text-slate-400 dark:text-slate-500">L / month</span>
                    </div>
                    <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={demandData} barSize={40} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: t.tick }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: t.tick }} axisLine={false} tickLine={false}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip {...t.tooltip} formatter={(v) => [`${v.toLocaleString()} L`, "Predicted Demand"]} />
                                <Bar dataKey="demand" radius={[4, 4, 0, 0]}>
                                    {demandData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3 flex flex-col gap-1.5">
                        {zones.map((z) => (
                            <div key={z.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className={`h-2 w-2 rounded-full ${R[z.risk]?.dot || "bg-emerald-500"}`} />
                                    <span className="text-slate-500 dark:text-slate-400">{z.name}</span>
                                </div>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {z.predictedDemand.toLocaleString()} L
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Modals ───────────────────────────────────────────────────── */}
            <ZoneDetailModal      open={!!selZone}      zone={selZone}           onClose={() => setSelZone(null)}      />
            <HouseholdDetailModal open={!!selHousehold} household={selHousehold} onClose={() => setSelHousehold(null)} />
        </div>
    );
};

export default DigitalTwin;
