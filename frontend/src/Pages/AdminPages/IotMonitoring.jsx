import { useState, useCallback, useEffect } from "react";
import {
    FiCpu, FiDroplet, FiWifi, FiActivity, FiCheckCircle, FiAlertTriangle, FiAlertOctagon,
    FiPlus, FiMinus, FiRefreshCw, FiPlay, FiPause, FiInfo, FiServer, FiLayers, FiRadio,
} from "react-icons/fi";
import { StaggerGrid, StaggerItem } from "../../Components/SharedComponents/Motion.jsx";
import { IOT_DEVICES } from "../../lib/iotDemoData.js";
import { deriveState, getStatus } from "../../lib/tankSimulationData.js";

const STATUS = {
    Normal:   { badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400", hex: "#10b981", waveLt: "#34d399" },
    Warning:  { badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",         hex: "#f59e0b", waveLt: "#fbbf24" },
    Critical: { badge: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",                 hex: "#ef4444", waveLt: "#f87171" },
};

const WaterTankVisual = ({ pct, status, levelL, capacityL }) => {
    const s = STATUS[status] || STATUS.Normal;
    const W = 110, H = 190;
    const fillH  = Math.max(0, Math.min(1, pct / 100)) * H;
    const waterY = H - fillH;
    const capH   = 14;
    const capW   = W * 0.65;
    const waveAmp   = 4;
    const waveW     = W * 3;

    const buildWave = (yBase, amp, w) => {
        const pts = [];
        const steps = 12;
        for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * w;
            const y = yBase + Math.sin((i / steps) * Math.PI * 2) * amp;
            pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
        }
        pts.push(`L${w},${H + 4} L0,${H + 4} Z`);
        return pts.join(" ");
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={W + 12} height={H + capH + 6} viewBox={`-6 -${capH} ${W + 12} ${H + capH + 6}`} overflow="visible">
                <defs>
                    <clipPath id={`iot-clip-${capacityL}`}>
                        <rect x={0} y={0} width={W} height={H} rx={6} />
                    </clipPath>
                </defs>
                <rect x={(W - capW) / 2} y={-capH + 4} width={capW} height={capH} rx={3} fill="#94a3b8" />
                <rect x={W / 2 - 6} y={-capH - 2} width={12} height={10} rx={2} fill="#64748b" />
                <rect x={0} y={0} width={W} height={H} rx={6} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={2} />

                {[25, 50, 75].map((mark) => {
                    const my = H - (mark / 100) * H;
                    return (
                        <g key={mark}>
                            <line x1={W - 10} y1={my} x2={W - 2} y2={my} stroke="#94a3b8" strokeWidth={1} />
                            <text x={W - 13} y={my + 3} fontSize={8} fill="#94a3b8" textAnchor="end">{mark}%</text>
                        </g>
                    );
                })}

                <g clipPath={`url(#iot-clip-${capacityL})`}>
                    {fillH > 0 && <rect x={0} y={waterY + waveAmp} width={W} height={fillH} fill={s.hex} opacity={0.85} />}
                    {fillH > 0 && (
                        <path d={buildWave(waterY, waveAmp, waveW)} fill={s.waveLt} opacity={0.75}>
                            <animateTransform attributeName="transform" type="translate" values={`0,0;${-W},0;${-W * 2},0`} dur="3.8s" repeatCount="indefinite" />
                        </path>
                    )}
                </g>
                <rect x={0} y={0} width={W} height={H} rx={6} fill="none" stroke="#64748b" strokeWidth={2} />
                <text x={W / 2} y={H / 2 + 6} textAnchor="middle" fontSize={22} fontWeight={700} fill={fillH > H * 0.45 ? "white" : "#1e293b"}>
                    {pct}%
                </text>
            </svg>

            <div className="text-center mt-1">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{levelL} L</p>
                <p className="text-xs text-slate-400">of {capacityL} L capacity</p>
            </div>
        </div>
    );
};

const IotMonitoring = () => {
    const [selectedDevice, setSelectedDevice] = useState(IOT_DEVICES[0]);
    const [isStreaming, setIsStreaming]         = useState(false); // Live auto-ticking state

    // Dynamic telemetry readings per device
    const [deviceTelemetry, setDeviceTelemetry] = useState({
        "ESP32-A1": { flowRate: 8.2, latestVolume: 0.41, lastSeen: "Just now" },
        "ESP32-C1": { flowRate: 14.5, latestVolume: 0.85, lastSeen: "2s ago" },
    });

    // Independent Tank States per device
    const [tankStates, setTankStates] = useState({
        "ESP32-A1": {
            levelL: 600,
            capacityL: 1000,
            consumption: 150,
            scenario: "Normal Usage",
        },
        "ESP32-C1": {
            levelL: 225,
            capacityL: 750,
            consumption: 220,
            scenario: "Low Reserve (Warning)",
        },
    });

    const activeState = tankStates[selectedDevice.deviceId];
    const activeTelemetry = deviceTelemetry[selectedDevice.deviceId];
    const { levelL, capacityL, consumption, scenario } = activeState;
    const { pct, status } = deriveState(levelL, capacityL);

    const clamp = (v, lo, hi) => Math.max(0, Math.min(hi, v));

    const updateActiveState = (updater) => {
        setTankStates((prev) => ({
            ...prev,
            [selectedDevice.deviceId]: {
                ...prev[selectedDevice.deviceId],
                ...updater(prev[selectedDevice.deviceId]),
            },
        }));
    };

    // Live Telemetry Auto-Stream Effect (ticks every 2 seconds)
    useEffect(() => {
        if (!isStreaming) return;

        const interval = setInterval(() => {
            const devId = selectedDevice.deviceId;
            const baseFlow = devId === "ESP32-A1" ? 8.2 : 14.5;
            const newFlow = +(baseFlow + (Math.random() * 3 - 1.5)).toFixed(2);
            const newVol  = +(newFlow * (2 / 60)).toFixed(3); // volume in 2 seconds

            setDeviceTelemetry((prev) => ({
                ...prev,
                [devId]: {
                    flowRate: newFlow,
                    latestVolume: newVol,
                    lastSeen: "Just now",
                },
            }));

            // Auto-deplete tank level live
            setTankStates((prev) => {
                const cur = prev[devId];
                const nextLevel = Math.max(0, +(cur.levelL - newVol * 5).toFixed(1)); // 5x scale for visual demo speed
                return {
                    ...prev,
                    [devId]: {
                        ...cur,
                        levelL: nextLevel,
                        scenario: "Live Telemetry Ingestion",
                    },
                };
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [isStreaming, selectedDevice.deviceId]);

    // Scenario handlers
    const handleNormalUsage = useCallback(() => {
        updateActiveState((s) => ({
            consumption: 150,
            scenario: "Normal Usage",
            levelL: clamp(s.levelL - 40, 0, s.capacityL),
        }));
    }, [selectedDevice.deviceId]);

    const handleHighConsumption = useCallback(() => {
        updateActiveState((s) => ({
            consumption: 320,
            scenario: "High Consumption",
            levelL: clamp(s.levelL - 110, 0, s.capacityL),
        }));
    }, [selectedDevice.deviceId]);

    const handleTankRefill = useCallback(() => {
        updateActiveState((s) => ({
            scenario: "Tank Refill",
            levelL: clamp(s.levelL + 180, 0, s.capacityL),
        }));
    }, [selectedDevice.deviceId]);

    const handleMicroLeak = useCallback(() => {
        updateActiveState((s) => ({
            scenario: "Micro Leak",
            levelL: clamp(s.levelL - 25, 0, s.capacityL),
        }));
    }, [selectedDevice.deviceId]);

    const handleBurst = useCallback(() => {
        updateActiveState((s) => ({
            scenario: "Burst",
            levelL: clamp(s.levelL - 200, 0, s.capacityL),
        }));
    }, [selectedDevice.deviceId]);

    const handleReset = useCallback(() => {
        const initL = selectedDevice.deviceId === "ESP32-A1" ? 600 : 225;
        const initC = selectedDevice.deviceId === "ESP32-A1" ? 150 : 220;
        updateActiveState(() => ({
            levelL: initL,
            consumption: initC,
            scenario: "Reset",
        }));
    }, [selectedDevice.deviceId]);

    const incConsumption = useCallback(() => {
        updateActiveState((s) => ({ consumption: clamp(s.consumption + 10, 50, 400) }));
    }, [selectedDevice.deviceId]);

    const decConsumption = useCallback(() => {
        updateActiveState((s) => ({ consumption: clamp(s.consumption - 10, 50, 400) }));
    }, [selectedDevice.deviceId]);

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                            IoT Telemetry &amp; Multi-Tank Storage Monitoring
                        </h1>
                        <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400">
                            High-Frequency Telemetry
                        </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        Real-time flow &amp; volume readings from deployed hardware prototype devices paired with live tank simulation.
                    </p>
                </div>

                {/* LIVE STREAM TOGGLE BUTTON */}
                <button
                    type="button"
                    onClick={() => setIsStreaming((prev) => !prev)}
                    className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold transition shadow-sm ${
                        isStreaming
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse"
                            : "bg-sky-500 text-white hover:bg-sky-600"
                    }`}
                >
                    {isStreaming ? (
                        <>
                            <FiRadio className="h-4 w-4" /> 🟢 Live Streaming (Active)
                        </>
                    ) : (
                        <>
                            <FiPlay className="h-4 w-4" /> Start Real-Time Live Telemetry
                        </>
                    )}
                </button>
            </div>

            {/* Hardware Configuration Banner */}
            <div className="mt-4 rounded-sm border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/40">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-300">
                    <FiInfo className="h-4 w-4 text-sky-500 shrink-0" />
                    Multi-Household Tank Specs:
                </div>
                <p className="mt-1 text-xs text-sky-800 dark:text-sky-400">
                    • <strong>ESP32-A1 (H001)</strong>: 1,000 L Rooftop Tank — Current: {tankStates["ESP32-A1"].levelL} L ({Math.round((tankStates["ESP32-A1"].levelL/1000)*100)}% Storage, Normal Status)<br/>
                    • <strong>ESP32-C1 (H021)</strong>: 750 L Cistern Tank — Current: {tankStates["ESP32-C1"].levelL} L ({Math.round((tankStates["ESP32-C1"].levelL/750)*100)}% Storage, Warning Status)
                </p>
            </div>

            {/* Device Selector Cards */}
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                {IOT_DEVICES.map((d) => {
                    const isSelected = d.deviceId === selectedDevice.deviceId;
                    const devState   = tankStates[d.deviceId];
                    const devTelem   = deviceTelemetry[d.deviceId];
                    const devPct     = Math.round((devState.levelL / devState.capacityL) * 100);
                    const devStatus  = getStatus(devPct);

                    return (
                        <button
                            key={d.deviceId}
                            type="button"
                            onClick={() => setSelectedDevice(d)}
                            className={`flex flex-col rounded-sm border p-4 text-left transition ${
                                isSelected
                                    ? "border-sky-500 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-sky-400"
                                    : "border-slate-200 bg-slate-50/50 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                                        <FiCpu className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Device: {d.deviceId}</p>
                                        <p className="text-[11px] text-slate-500">Household: {d.householdId} (Zone {d.zone})</p>
                                    </div>
                                </div>
                                <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS[devStatus].badge}`}>
                                    {devStatus} ({devPct}%)
                                </span>
                            </div>

                            <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                                <div>
                                    <p className="text-slate-400">Tank Capacity</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{d.tankCapacityL} L</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Current Level</p>
                                    <p className="text-sm font-bold text-sky-600 dark:text-sky-400">{devState.levelL} L</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Live Flow Rate</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{devTelem.flowRate} L/min</p>
                                </div>
                            </div>

                            <p className="mt-2 text-[10px] text-slate-400 italic">{d.tankDescription}</p>
                        </button>
                    );
                })}
            </div>

            {/* EMBEDDED TANK STORAGE & SIMULATION SECTION */}
            <div className="mt-4 rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiLayers className="text-sky-500" />
                            Tank Storage Simulation ({selectedDevice.householdId} — {selectedDevice.deviceId})
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Specs: {capacityL} Litres Capacity · Level: {levelL} L ({pct}% Storage)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Active Scenario:</span>
                        <span className="rounded bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-400">
                            {scenario}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {/* Visual Tank */}
                    <div className="flex flex-col items-center justify-center p-3 border-r border-slate-100 dark:border-slate-800">
                        <WaterTankVisual pct={pct} status={status} levelL={levelL} capacityL={capacityL} />
                    </div>

                    {/* Simulation Controls & Scenarios */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Simulation Controls</p>
                            {isStreaming && (
                                <span className="text-[10px] font-bold text-emerald-600 animate-pulse flex items-center gap-1">
                                    <FiRadio /> Live Ingestion Active
                                </span>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-500">Daily Consumption Rate:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{consumption} L/day</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={decConsumption}
                                    className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    <FiMinus className="h-3.5 w-3.5" />
                                </button>
                                <input
                                    type="range"
                                    min={50}
                                    max={400}
                                    step={10}
                                    value={consumption}
                                    onChange={(e) => updateActiveState(() => ({ consumption: Number(e.target.value) }))}
                                    className="w-full accent-sky-500"
                                />
                                <button
                                    type="button"
                                    onClick={incConsumption}
                                    className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    <FiPlus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Scenario Preset Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={handleNormalUsage}
                                className="rounded bg-sky-500 py-2 text-xs font-semibold text-white transition hover:bg-sky-600 shadow-sm"
                            >
                                Normal Usage
                            </button>
                            <button
                                type="button"
                                onClick={handleHighConsumption}
                                className="rounded bg-orange-500 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 shadow-sm"
                            >
                                High Consumption
                            </button>
                            <button
                                type="button"
                                onClick={handleTankRefill}
                                className="rounded bg-emerald-500 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 shadow-sm"
                            >
                                Tank Refill
                            </button>
                            <button
                                type="button"
                                onClick={handleMicroLeak}
                                className="rounded border border-amber-200 bg-amber-50 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            >
                                Micro Leak
                            </button>
                            <button
                                type="button"
                                onClick={handleBurst}
                                className="rounded border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
                            >
                                Burst
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                                Reset Tank
                            </button>
                        </div>
                    </div>

                    {/* Calculated Metrics Panel */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded dark:bg-slate-800/40 text-xs">
                        <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide border-b border-slate-200 pb-2 dark:border-slate-700">
                            Calculated Storage Metrics
                        </p>

                        <div className="flex justify-between">
                            <span className="text-slate-500">Tank Capacity:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{capacityL} L</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-slate-500">Estimated Tank Level:</span>
                            <span className="font-bold text-sky-600 dark:text-sky-400">{levelL} L</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-slate-500">Calculated Storage:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{pct}%</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-slate-500">Status:</span>
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS[status].badge}`}>
                                {status}
                            </span>
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500">
                            Level Equation: Previous Level + Inflow − Consumption
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IotMonitoring;
