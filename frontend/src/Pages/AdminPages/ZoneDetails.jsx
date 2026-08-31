import { useState } from "react";
import { useParams } from "react-router-dom";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import {
    FiAlertTriangle,
    FiDroplet,
    FiCheckCircle,
    FiClock,
    FiLayers,
    FiShield,
    FiZap,
} from "react-icons/fi";
import { StaggerGrid, StaggerItem } from "../../Components/SharedComponents/Motion.jsx";

const pressureData = [
    { time: "06:00", actual: 10, expected: 10 },
    { time: "06:05", actual: 14, expected: 15 },
    { time: "06:10", actual: 16, expected: 20 },
    { time: "06:15", actual: 15, expected: 22 },
    { time: "06:20", actual: 14, expected: 22 },
];

const evidenceItems = [
    "Pressure anomaly detected",
    "Repeated temporal pattern",
    "Spatial deviation from neighboring zones",
    "Leak explanation insufficient",
    "Hydraulic twin matches bypass scenario",
];

const spatialZones = [
    { id: "05", state: "Normal" },
    { id: "06", state: "Normal" },
    { id: "07", state: "High Risk", highlighted: true },
    { id: "08", state: "Normal" },
];

const eventHistory = [
    { time: "06:45", event: "Pressure dip repeated with bypass signature" },
    { time: "06:32", event: "Transient demand spike without matching flow increase" },
    { time: "06:18", event: "Residual mismatch exceeded threshold for 3 cycles" },
    { time: "06:07", event: "Expected pressure rebound did not occur" },
];

const ZoneDetails = () => {
    const { id } = useParams();
    const zoneId = id || "07";
    const zoneLabel = `Zone ${zoneId}`;
    const [notice, setNotice] = useState("");

    const latestSummary = { expected: 21, actual: 15, residual: -6 };

    const handleCreateInvestigation = () => {
        setNotice(`Investigation created for ${zoneLabel}.`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">{zoneLabel}</h1>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Network investigation details</p>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 dark:border-red-950/60 dark:bg-red-950/30 dark:text-red-300">
                    <FiShield className="h-4 w-4" />
                    Suspicious zone under review
                </div>
            </div>

            {notice && (
                <div className="rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-950/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                    {notice}
                </div>
            )}

            <StaggerGrid className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <StaggerItem className="lg:col-span-2">
                    <div className="overflow-hidden rounded-sm border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="h-1 bg-linear-to-r from-red-500 via-amber-500 to-sky-500" />
                        <div className="p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Fraud Risk</p>
                                    <div className="mt-2 flex items-end gap-3">
                                        <span className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">91%</span>
                                        <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                            HIGH
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Possible Cause</p>
                                    <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                                        Unauthorized / Partial-Bypass Connection
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:min-w-48">
                                    <MiniStat label="Zone" value={zoneLabel} icon={FiLayers} />
                                    <MiniStat label="Model" value="Hydraulic twin validation" icon={FiZap} />
                                </div>
                            </div>
                        </div>
                    </div>
                </StaggerItem>

                <StaggerItem>
                    <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Temporal Analysis</p>
                        <div className="mt-4 space-y-3">
                            <InfoRow label="Anomaly Frequency" value="6 occurrences" icon={FiAlertTriangle} tone="red" />
                            <InfoRow label="Last Anomaly" value="06:45" icon={FiClock} tone="sky" />
                            <InfoRow label="Duration" value="15 minutes" icon={FiClock} tone="amber" />
                        </div>
                    </div>
                </StaggerItem>
            </StaggerGrid>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Pressure Analysis</p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Actual versus expected pressure over the investigation window.</p>
                        </div>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Zone {zoneId}
                        </span>
                    </div>

                    <div className="mt-5 h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={pressureData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                                <XAxis dataKey="time" tickLine={false} axisLine={false} stroke="#94a3b8" />
                                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" domain={[0, 26]} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: "1px solid rgba(226, 232, 240, 0.9)",
                                        background: "rgba(255, 255, 255, 0.98)",
                                        boxShadow: "0 16px 32px rgba(15, 23, 42, 0.12)",
                                    }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="actual" name="Actual Pressure" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                <Line type="monotone" dataKey="expected" name="Expected Pressure" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <MetricCard label="Expected Pressure" value={`${latestSummary.expected} m`} icon={FiZap} tone="sky" />
                        <MetricCard label="Actual Pressure" value={`${latestSummary.actual} m`} icon={FiDroplet} tone="emerald" />
                        <MetricCard label="Hydraulic Residual" value={`${latestSummary.residual} m`} icon={FiAlertTriangle} tone="red" />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Evidence</p>
                        <ul className="mt-4 space-y-3">
                            {evidenceItems.map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                                    <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Investigation Recommendation</p>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Prioritize Sector 07B for field inspection.</p>
                        <button
                            type="button"
                            onClick={handleCreateInvestigation}
                            className="mt-4 inline-flex w-full items-center justify-center rounded-sm bg-sky-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
                        >
                            Create Investigation
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Spatial Comparison</p>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Network adjacency snapshot</span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {spatialZones.map((zone) => (
                            <div
                                key={zone.id}
                                className={`rounded-md border px-3 py-3 ${
                                    zone.highlighted
                                        ? "border-red-200 bg-red-50 dark:border-red-950/60 dark:bg-red-950/30"
                                        : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30"
                                }`}
                            >
                                <p className={`text-sm font-semibold ${zone.highlighted ? "text-red-700 dark:text-red-300" : "text-slate-900 dark:text-white"}`}>
                                    Zone {zone.id}
                                </p>
                                <p className={`mt-1 text-xs font-medium ${zone.highlighted ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}>
                                    {zone.state}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Event History</p>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Previous anomaly events</span>
                    </div>
                    <div className="mt-4 space-y-3">
                        {eventHistory.map((event) => (
                            <div key={`${event.time}-${event.event}`} className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                                    <FiClock className="h-4 w-4" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{event.time}</p>
                                    <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">{event.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon: Icon, tone }) => {
    const toneStyles = {
        sky: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
        red: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    };

    return (
        <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-800/30">
            <span className={`flex h-9 w-9 items-center justify-center rounded-md ${toneStyles[tone]}`}>
                <Icon className="h-4 w-4" />
            </span>
            <div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

const MiniStat = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-800/30">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Icon className="h-4 w-4" />
        </span>
        <div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const InfoRow = ({ label, value, icon: Icon, tone }) => {
    const tones = {
        red: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
        sky: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    };

    return (
        <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-800/30">
            <div className="flex items-center gap-2.5">
                <span className={`flex h-8 w-8 items-center justify-center rounded-md ${tones[tone]}`}>
                    <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
        </div>
    );
};

export default ZoneDetails;
