import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { FiArrowLeft, FiCheckCircle, FiClock, FiDroplet, FiPlayCircle, FiRefreshCw, FiShield, FiSliders, FiActivity } from "react-icons/fi";
import { useChartTheme } from "../../Components/SharedComponents/chartTheme.js";
import { StaggerGrid, StaggerItem } from "../../Components/SharedComponents/Motion.jsx";

const zones = ["Zone 01", "Zone 02", "Zone 03", "Zone 04", "Zone 05", "Zone 06", "Zone 07"];
const scenarios = ["Normal", "Leak", "Burst", "Illegal Connection", "Partial Bypass", "Operational Change"];

const zoneProfiles = {
    "Zone 01": { actual: 20, expected: 20, residual: 0, bestScenario: "Normal", match: 93, observed: [3, 14, 17, 19, 25, 27] },
    "Zone 02": { actual: 18, expected: 20, residual: -2, bestScenario: "Leak", match: 71, observed: [8, 22, 31, 46, 58, 63] },
    "Zone 03": { actual: 17, expected: 19, residual: -2, bestScenario: "Operational Change", match: 59, observed: [18, 25, 33, 36, 41, 49] },
    "Zone 04": { actual: 16, expected: 20, residual: -4, bestScenario: "Illegal Connection", match: 74, observed: [12, 19, 25, 44, 57, 74] },
    "Zone 05": { actual: 19, expected: 21, residual: -2, bestScenario: "Leak", match: 66, observed: [9, 18, 34, 43, 51, 61] },
    "Zone 06": { actual: 18, expected: 20, residual: -2, bestScenario: "Burst", match: 54, observed: [10, 12, 18, 28, 41, 48] },
    "Zone 07": { actual: 15, expected: 21, residual: -6, bestScenario: "Partial Bypass", match: 89, observed: [35, 62, 28, 74, 89, 51] },
};

const baseComparison = {
    Normal: 35,
    Leak: 62,
    Burst: 28,
    "Illegal Connection": 74,
    "Partial Bypass": 89,
    "Operational Change": 51,
};

const HydraulicDigitalTwin = () => {
    const navigate = useNavigate();
    const chartTheme = useChartTheme();
    const [zone, setZone] = useState("Zone 07");
    const [scenario, setScenario] = useState("Partial Bypass");
    const [isRunning, setIsRunning] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const [notice, setNotice] = useState("");

    const profile = zoneProfiles[zone];

    const comparisonData = useMemo(() => {
        const offset = zone === "Zone 07" ? 0 : zone.charCodeAt(zone.length - 1) - 55;
        return scenarios.map((name, index) => {
            const adjustment = zone === "Zone 07" ? 0 : ((index % 3) - 1) * (offset * 2);
            return {
                name,
                match: Math.max(12, Math.min(98, baseComparison[name] + adjustment)),
            };
        });
    }, [zone]);

    const handleRunSimulation = () => {
        setIsRunning(true);
        setHasRun(false);
        setNotice("");
        window.setTimeout(() => {
            setScenario(profile.bestScenario);
            setIsRunning(false);
            setHasRun(true);
        }, 1000);
    };

    const handleSendToInvestigation = () => {
        setNotice("Investigation created from Digital Twin analysis.");
    };

    const bestScenario = profile.bestScenario;
    const bestMatch = profile.match;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">Hydraulic Digital Twin</h1>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Compare observed network behavior against simulated hydraulic scenarios.</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/zone/07")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                    <FiArrowLeft className="h-4 w-4" /> Back to Zone Details
                </button>
            </div>

            {notice && (
                <div className="rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-950/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                    {notice}
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SelectCard label="Zone selector" value={zone} onChange={setZone} options={zones} icon={FiShield} />
                <MetricCard label="Actual Pressure" value={`${profile.actual} m`} icon={FiDroplet} tone="sky" />
                <MetricCard label="Expected Pressure" value={`${profile.expected} m`} icon={FiActivity} tone="emerald" />
                <MetricCard label="Hydraulic Residual" value={`${profile.residual} m`} icon={FiClock} tone="red" />
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Current Network Observation</p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Observed pressure versus digital twin expectation for the selected zone.</p>
                        </div>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">{zone}</span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <ObservationChip label="Actual Pressure" value={`${profile.actual} m`} tone="sky" />
                        <ObservationChip label="Expected Pressure" value={`${profile.expected} m`} tone="emerald" />
                        <ObservationChip label="Hydraulic Residual" value={`${profile.residual} m`} tone="red" />
                    </div>

                    <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Simulation Scenario</p>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Selectable mock scenarios</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {scenarios.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setScenario(item)}
                                    className={`rounded-md px-3 py-2 text-xs font-medium transition ${
                                        scenario === item
                                            ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-800"
                                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleRunSimulation}
                            disabled={isRunning}
                            className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isRunning ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiPlayCircle className="h-4 w-4" />}
                            {isRunning ? "Running simulation..." : "Run Simulation"}
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Hydraulic Verification</p>
                        <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                            <Row label="Observed Pressure" value={`${profile.actual} m`} />
                            <Row label="Digital Twin Pressure" value={`${profile.expected} m`} />
                            <Row label="Residual" value={`${profile.residual} m`} />
                            <Row label="Best Scenario" value={bestScenario} />
                        </div>
                    </div>

                    <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                            <FiSliders className="h-4 w-4 text-sky-500" />
                            Simulation Status
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            This page is a frontend prototype of the future EPANET/WNTR workflow and uses mock simulation results only.
                        </p>
                    </div>
                </div>
            </div>

            {isRunning ? (
                <div className="rounded-sm border border-dashed border-slate-300 bg-white py-14 text-center dark:border-slate-700 dark:bg-slate-900">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                        <FiRefreshCw className="h-5 w-5 animate-spin" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">Running mock hydraulic comparison...</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Preparing scenario outputs for {zone}.</p>
                </div>
            ) : hasRun ? (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Best Match</p>
                        <div className="mt-3">
                            <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{bestScenario}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Simulation Match: {bestMatch}%</p>
                        </div>
                        <div className="mt-4 rounded-md bg-sky-50 px-3 py-3 text-sm text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                            The observed pressure behavior is most similar to the simulated partial-bypass scenario.
                        </div>
                        <button
                            type="button"
                            onClick={handleSendToInvestigation}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
                        >
                            Send to Investigation
                        </button>
                    </div>

                    <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Scenario Comparison</p>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Higher bars indicate better match to the observed behavior.</p>
                            </div>
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">{scenario}</span>
                        </div>

                        <div className="mt-5 h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparisonData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} stroke={chartTheme.tick} interval={0} />
                                    <YAxis tickLine={false} axisLine={false} stroke={chartTheme.tick} domain={[0, 100]} />
                                    <Tooltip {...chartTheme.tooltip} formatter={(value) => [`${value}%`, "Match"]} />
                                    <Legend />
                                    <Bar dataKey="match" name="Scenario Match" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-sm border border-dashed border-slate-300 bg-white py-14 text-center dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Run the simulation to reveal the hydraulic comparison results.</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">The page currently reflects the selected zone observation and waits for a mock run.</p>
                </div>
            )}
        </div>
    );
};

const SelectCard = ({ label, value, onChange, options, icon: Icon }) => (
    <div className="rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <Icon className="h-4 w-4 text-sky-500" />
            {label}
        </p>
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-3 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        >
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);

const MetricCard = ({ label, value, icon: Icon, tone }) => {
    const tones = {
        sky: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
        red: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    };

    return (
        <div className="flex items-center gap-3 rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className={`flex h-10 w-10 items-center justify-center rounded-md ${tones[tone]}`}>
                <Icon className="h-4 w-4" />
            </span>
            <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

const ObservationChip = ({ label, value, tone }) => {
    const tones = {
        sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
        emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
        red: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    };

    return (
        <div className={`rounded-md border border-slate-200 p-4 dark:border-slate-800 ${tones[tone]}`}>
            <p className="text-xs font-medium opacity-80">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
    );
};

const Row = ({ label, value }) => (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
);

export default HydraulicDigitalTwin;
