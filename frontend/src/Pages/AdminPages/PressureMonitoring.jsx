import { useMemo, useState } from "react";
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
import { FiAlertTriangle, FiCalendar, FiChevronDown, FiClock, FiDroplet, FiFilter, FiInfo, FiServer, FiTrendingUp } from "react-icons/fi";
import { StaggerGrid, StaggerItem } from "../../Components/SharedComponents/Motion.jsx";

const zoneData = {
    "Zone 01": {
        currentPressure: 3.21,
        averagePressure: 3.18,
        minimumPressure: 2.94,
        maximumPressure: 3.34,
        chartData: [
            { time: "06:00", actual: 3.12, expected: 3.1 },
            { time: "06:05", actual: 3.18, expected: 3.14 },
            { time: "06:10", actual: 3.2, expected: 3.18 },
            { time: "06:15", actual: 3.16, expected: 3.2 },
            { time: "06:20", actual: 3.21, expected: 3.22 },
            { time: "06:25", actual: 3.19, expected: 3.24 },
        ],
        anomalies: [
            { timestamp: "06:05", sensor: "P01", actual: 3.18, expected: 3.14, deviation: 0.04, status: "Normal" },
            { timestamp: "06:10", sensor: "P02", actual: 3.2, expected: 3.18, deviation: 0.02, status: "Normal" },
            { timestamp: "06:20", sensor: "P01", actual: 3.21, expected: 3.22, deviation: -0.01, status: "Normal" },
            { timestamp: "06:25", sensor: "P03", actual: 3.19, expected: 3.24, deviation: -0.05, status: "Normal" },
        ],
    },
    "Zone 02": {
        currentPressure: 2.88,
        averagePressure: 2.94,
        minimumPressure: 2.62,
        maximumPressure: 3.08,
        chartData: [
            { time: "06:00", actual: 2.98, expected: 3.0 },
            { time: "06:05", actual: 2.95, expected: 2.98 },
            { time: "06:10", actual: 2.82, expected: 2.95 },
            { time: "06:15", actual: 2.76, expected: 2.97 },
            { time: "06:20", actual: 2.88, expected: 3.0 },
            { time: "06:25", actual: 2.92, expected: 3.01 },
        ],
        anomalies: [
            { timestamp: "06:05", sensor: "P01", actual: 2.95, expected: 2.98, deviation: -0.03, status: "Normal" },
            { timestamp: "06:10", sensor: "P01", actual: 2.82, expected: 2.95, deviation: -0.13, status: "Normal" },
            { timestamp: "06:15", sensor: "P01", actual: 2.76, expected: 2.97, deviation: -0.21, status: "Anomaly" },
            { timestamp: "06:20", sensor: "P02", actual: 2.88, expected: 3.0, deviation: -0.12, status: "Normal" },
            { timestamp: "06:25", sensor: "P03", actual: 2.92, expected: 3.01, deviation: -0.09, status: "Normal" },
        ],
    },
    "Zone 03": {
        currentPressure: 3.44,
        averagePressure: 3.39,
        minimumPressure: 3.18,
        maximumPressure: 3.53,
        chartData: [
            { time: "06:00", actual: 3.34, expected: 3.32 },
            { time: "06:05", actual: 3.38, expected: 3.35 },
            { time: "06:10", actual: 3.44, expected: 3.38 },
            { time: "06:15", actual: 3.47, expected: 3.4 },
            { time: "06:20", actual: 3.42, expected: 3.42 },
            { time: "06:25", actual: 3.44, expected: 3.43 },
        ],
        anomalies: [
            { timestamp: "06:05", sensor: "P02", actual: 3.38, expected: 3.35, deviation: 0.03, status: "Normal" },
            { timestamp: "06:10", sensor: "P03", actual: 3.44, expected: 3.38, deviation: 0.06, status: "Normal" },
            { timestamp: "06:15", sensor: "P03", actual: 3.47, expected: 3.4, deviation: 0.07, status: "Normal" },
            { timestamp: "06:20", sensor: "P04", actual: 3.42, expected: 3.42, deviation: 0, status: "Normal" },
        ],
    },
    "Zone 04": {
        currentPressure: 2.74,
        averagePressure: 2.82,
        minimumPressure: 2.41,
        maximumPressure: 3.01,
        chartData: [
            { time: "06:00", actual: 2.92, expected: 2.95 },
            { time: "06:05", actual: 2.84, expected: 2.94 },
            { time: "06:10", actual: 2.63, expected: 2.93 },
            { time: "06:15", actual: 2.48, expected: 2.95 },
            { time: "06:20", actual: 2.74, expected: 2.96 },
            { time: "06:25", actual: 2.81, expected: 2.98 },
        ],
        anomalies: [
            { timestamp: "06:05", sensor: "P02", actual: 2.84, expected: 2.94, deviation: -0.1, status: "Normal" },
            { timestamp: "06:10", sensor: "P02", actual: 2.63, expected: 2.93, deviation: -0.3, status: "Anomaly" },
            { timestamp: "06:15", sensor: "P03", actual: 2.48, expected: 2.95, deviation: -0.47, status: "Anomaly" },
            { timestamp: "06:20", sensor: "P03", actual: 2.74, expected: 2.96, deviation: -0.22, status: "Normal" },
        ],
    },
    "Zone 05": {
        currentPressure: 3.05,
        averagePressure: 3.01,
        minimumPressure: 2.88,
        maximumPressure: 3.12,
        chartData: [
            { time: "06:00", actual: 3.0, expected: 3.0 },
            { time: "06:05", actual: 3.02, expected: 3.01 },
            { time: "06:10", actual: 2.98, expected: 3.0 },
            { time: "06:15", actual: 3.05, expected: 3.02 },
            { time: "06:20", actual: 3.04, expected: 3.03 },
            { time: "06:25", actual: 3.07, expected: 3.04 },
        ],
        anomalies: [
            { timestamp: "06:05", sensor: "P02", actual: 3.02, expected: 3.01, deviation: 0.01, status: "Normal" },
            { timestamp: "06:10", sensor: "P03", actual: 2.98, expected: 3.0, deviation: -0.02, status: "Normal" },
            { timestamp: "06:25", sensor: "P04", actual: 3.07, expected: 3.04, deviation: 0.03, status: "Normal" },
        ],
    },
    "Zone 06": {
        currentPressure: 2.59,
        averagePressure: 2.67,
        minimumPressure: 2.28,
        maximumPressure: 2.87,
        chartData: [
            { time: "06:00", actual: 2.76, expected: 2.79 },
            { time: "06:05", actual: 2.69, expected: 2.8 },
            { time: "06:10", actual: 2.51, expected: 2.79 },
            { time: "06:15", actual: 2.38, expected: 2.81 },
            { time: "06:20", actual: 2.59, expected: 2.82 },
            { time: "06:25", actual: 2.66, expected: 2.83 },
        ],
        anomalies: [
            { timestamp: "06:05", sensor: "P01", actual: 2.69, expected: 2.8, deviation: -0.11, status: "Normal" },
            { timestamp: "06:10", sensor: "P02", actual: 2.51, expected: 2.79, deviation: -0.28, status: "Anomaly" },
            { timestamp: "06:15", sensor: "P03", actual: 2.38, expected: 2.81, deviation: -0.43, status: "Anomaly" },
            { timestamp: "06:20", sensor: "P04", actual: 2.59, expected: 2.82, deviation: -0.23, status: "Anomaly" },
        ],
    },
    "Zone 07": {
        currentPressure: 2.14,
        averagePressure: 2.29,
        minimumPressure: 1.78,
        maximumPressure: 2.63,
        chartData: [
            { time: "06:00", actual: 2.22, expected: 2.3 },
            { time: "06:05", actual: 2.06, expected: 2.34 },
            { time: "06:10", actual: 1.94, expected: 2.37 },
            { time: "06:15", actual: 1.82, expected: 2.41 },
            { time: "06:20", actual: 1.78, expected: 2.44 },
            { time: "06:25", actual: 2.14, expected: 2.46 },
        ],
        anomalies: [
            { timestamp: "06:00", sensor: "P01", actual: 2.22, expected: 2.3, deviation: -0.08, status: "Normal" },
            { timestamp: "06:05", sensor: "P01", actual: 2.06, expected: 2.34, deviation: -0.28, status: "Anomaly" },
            { timestamp: "06:10", sensor: "P01", actual: 1.94, expected: 2.37, deviation: -0.43, status: "Anomaly" },
            { timestamp: "06:15", sensor: "P01", actual: 1.82, expected: 2.41, deviation: -0.59, status: "Anomaly" },
            { timestamp: "06:20", sensor: "P01", actual: 1.78, expected: 2.44, deviation: -0.66, status: "Anomaly" },
            { timestamp: "06:25", sensor: "P02", actual: 2.14, expected: 2.46, deviation: -0.32, status: "Anomaly" },
        ],
    },
};

const zones = Object.keys(zoneData);
const sensors = ["P01", "P02", "P03", "P04"];
const dateOptions = ["2026-08-30", "2026-08-29", "2026-08-28"];

const PressureMonitoring = () => {
    const [selectedZone, setSelectedZone] = useState("Zone 07");
    const [selectedSensor, setSelectedSensor] = useState("P01");
    const [selectedDate, setSelectedDate] = useState(dateOptions[0]);

    const zoneMetrics = zoneData[selectedZone];
    const records = zoneMetrics.anomalies.map((record) => ({ ...record, sensor: selectedSensor }));

    const stats = useMemo(() => ({
        current: zoneMetrics.currentPressure,
        average: zoneMetrics.averagePressure,
        minimum: zoneMetrics.minimumPressure,
        maximum: zoneMetrics.maximumPressure,
    }), [zoneMetrics]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">Pressure Monitoring</h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Monitor pressure behavior across the water network.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <ControlSelect label="Zone selector" value={selectedZone} onChange={setSelectedZone} options={zones} icon={FiMapIcon} />
                <ControlSelect label="Sensor selector" value={selectedSensor} onChange={setSelectedSensor} options={sensors} icon={FiServer} />
                <ControlSelect label="Date selector" value={selectedDate} onChange={setSelectedDate} options={dateOptions} icon={FiCalendar} />
            </div>

            <StaggerGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StaggerItem><StatCard label="Current Pressure" value={`${stats.current.toFixed(2)} m`} icon={FiDroplet} tone="sky" /></StaggerItem>
                <StaggerItem><StatCard label="Average Pressure" value={`${stats.average.toFixed(2)} m`} icon={FiTrendingUp} tone="emerald" /></StaggerItem>
                <StaggerItem><StatCard label="Minimum Pressure" value={`${stats.minimum.toFixed(2)} m`} icon={FiAlertTriangle} tone="amber" /></StaggerItem>
                <StaggerItem><StatCard label="Maximum Pressure" value={`${stats.maximum.toFixed(2)} m`} icon={FiClock} tone="red" /></StaggerItem>
            </StaggerGrid>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Pressure Behavior</p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Selected zone: {selectedZone} · Sensor: {selectedSensor} · Date: {selectedDate}</p>
                        </div>
                        <div className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Actual vs Expected
                        </div>
                    </div>

                    <div className="mt-5 h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={zoneMetrics.chartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                                <XAxis dataKey="time" tickLine={false} axisLine={false} stroke="#94a3b8" />
                                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" domain={[1.4, 3.8]} />
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
                </div>

                <div className="space-y-3">
                    <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Pressure Anomalies</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Latest pressure deviations for the selected zone.</p>
                        <div className="mt-4 space-y-2">
                            {records.length > 0 ? records.slice(0, 3).map((row) => (
                                <div key={`${row.timestamp}-${row.sensor}`} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800/30">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{row.timestamp}</p>
                                        <p className="text-slate-500 dark:text-slate-400">{row.sensor}</p>
                                    </div>
                                    <StatusBadge status={row.status} />
                                </div>
                            )) : null}
                        </div>
                    </div>

                    <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                            <FiInfo className="h-4 w-4 text-sky-500" />
                            Information
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            Pressure anomalies are indicators of unusual network behavior and do not automatically confirm fraud.
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Pressure Anomalies</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Recorded deviations for the selected zone and sensor.</p>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{records.length} records</span>
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-180 text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                                <th className="px-4 py-2.5 font-medium">Timestamp</th>
                                <th className="px-4 py-2.5 font-medium">Sensor</th>
                                <th className="px-4 py-2.5 font-medium">Actual Pressure</th>
                                <th className="px-4 py-2.5 font-medium">Expected Pressure</th>
                                <th className="px-4 py-2.5 font-medium">Deviation</th>
                                <th className="px-4 py-2.5 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((row) => (
                                <tr key={`${row.timestamp}-${row.sensor}-${row.actual}`} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.timestamp}</td>
                                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{row.sensor}</td>
                                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{row.actual.toFixed(1)}m</td>
                                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{row.expected.toFixed(1)}m</td>
                                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{formatDeviation(row.deviation)}m</td>
                                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const FiMapIcon = (props) => <FiFilter {...props} />;

const ControlSelect = ({ label, value, onChange, options, icon: Icon }) => (
    <div className="rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <Icon className="h-4 w-4 text-sky-500" />
            {label}
        </p>
        <div className="relative mt-3">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full appearance-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
                {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
    </div>
);

const StatCard = ({ label, value, icon: Icon, tone }) => {
    const tones = {
        sky: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
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

const StatusBadge = ({ status }) => {
    const isAnomaly = status === "Anomaly";
    return (
        <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold ${isAnomaly ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
            {status}
        </span>
    );
};

const formatDeviation = (value) => {
    const rounded = Math.round(value);
    return rounded > 0 ? `+${rounded}` : `${rounded}`;
};

export default PressureMonitoring;
