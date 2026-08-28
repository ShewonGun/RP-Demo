import { useState } from "react";
import { FiActivity, FiCheckCircle, FiCpu, FiRadio, FiSend, FiWifi } from "react-icons/fi";
import { useQuality } from "../../Context/QualityContext.jsx";

const SensorHub = () => {
    const { nodes, loading, error, triggerPressureDrop, status } = useQuality();
    const [pressure, setPressure] = useState(0.42);
    const [fired, setFired] = useState(false);
    const sensors = Object.entries(nodes).slice(0, 6);
    const dropPercentage = Math.max(0, ((3.05 - pressure) / 3.05) * 100);
    const payload = {
        sensor_id: "SENSOR_01",
        mapped_node: "J_104",
        timestamp: new Date().toISOString(),
        pressure_bar: Number(pressure.toFixed(2)),
        baseline_bar: 3.05,
        drop_percentage: Number(dropPercentage.toFixed(1)),
        status: pressure < 1.5 ? "ANOMALY_TRIGGERED" : "NOMINAL",
    };

    const firePayload = async () => {
        setFired(false);
        try {
            await triggerPressureDrop(pressure, "SENSOR_01", "P_09");
            setFired(true);
        } catch {
            setFired(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <FiRadio className="h-5 w-5 text-sky-500" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sensor &amp; Integration Hub</h1>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Simulate IoT pressure input and inspect the payload sent to the quality engine.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2"><FiCpu className="text-sky-500" /><h2 className="text-sm font-bold text-slate-900 dark:text-white">Simulated IoT pressure transducer</h2></div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Mapped to anchor node J_104</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${pressure < 1.5 ? "text-red-500" : "text-emerald-500"}`}><FiWifi /> {pressure < 1.5 ? "Anomaly" : "Nominal"}</span>
                    </div>

                    <div className="mt-8 flex items-end justify-between">
                        <div><p className="text-xs text-slate-500 dark:text-slate-400">Selected pressure</p><p className="mt-1 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{pressure.toFixed(2)} <span className="text-base font-medium text-slate-400">bar</span></p></div>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">Range 0.0–4.0 bar</span>
                    </div>
                    <input type="range" min="0" max="4" step="0.01" value={pressure} onChange={(event) => { setPressure(Number(event.target.value)); setFired(false); }} className="mt-6 h-2 w-full cursor-pointer accent-sky-500" aria-label="Simulated pressure value" />
                    <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>0.0 bar · burst</span><span>1.5 bar · alert threshold</span><span>4.0 bar</span></div>
                    <button type="button" onClick={firePayload} disabled={loading} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"><FiSend />{loading ? "Sending payload..." : "Fire IoT Payload"}</button>
                    {fired && <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"><FiCheckCircle /> Payload accepted. Digital Twin updated.</p>}
                    {error && <p className="mt-3 text-center text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 shadow-sm dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-white">Live data payload</h2><p className="mt-1 text-xs text-slate-400">Preview of the packet sent to the GNN engine</p></div><span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${payload.status === "ANOMALY_TRIGGERED" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>{payload.status.replace("_", " ")}</span></div>
                    <pre className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs leading-6 text-sky-200"><code>{JSON.stringify(payload, null, 2)}</code></pre>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div className="rounded-lg bg-slate-900 p-3"><p className="text-slate-500">Pressure drop</p><p className="mt-1 font-bold text-white">{payload.drop_percentage}%</p></div><div className="rounded-lg bg-slate-900 p-3"><p className="text-slate-500">Engine status</p><p className="mt-1 font-bold text-white">{status.replace("_", " ")}</p></div></div>
                </div>
            </div>

            <div>
                <div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Network telemetry inputs</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Live pressure and chlorine readings across the network.</p></div><span className="text-xs text-slate-400">{sensors.length} nodes shown</span></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sensors.map(([nodeId, sensor]) => (
                    <div key={nodeId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><FiActivity className="text-sky-500" />{nodeId}</div>
                        <p className="mt-4 text-xs text-slate-500">Pressure <strong className="text-slate-800 dark:text-slate-200">{sensor.pressure} bar</strong></p>
                        <p className="mt-1 text-xs text-slate-500">Residual chlorine <strong className="text-slate-800 dark:text-slate-200">{sensor.cl} mg/L</strong></p>
                    </div>
                ))}
                </div>
            </div>
            {loading && <p className="text-xs text-slate-400">Updating telemetry...</p>}
        </div>
    );
};

export default SensorHub;
