import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { useQuality } from "../../Context/QualityContext.jsx";

const IntrusionAlerts = () => {
    const { status, criticalStreets, anchorPressure, error } = useQuality();
    const active = status === "INTRUSION_ALERT";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Intrusion Alerts</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Current contamination-risk events from the quality network.</p>
            </div>
            <div className={`rounded-2xl border p-5 ${active ? "border-red-200 bg-red-50 dark:border-red-950/50 dark:bg-red-950/20" : "border-emerald-200 bg-emerald-50 dark:border-emerald-950/50 dark:bg-emerald-950/20"}`}>
                {active ? <FiAlertTriangle className="mb-3 h-6 w-6 text-red-500" /> : <FiCheckCircle className="mb-3 h-6 w-6 text-emerald-500" />}
                <h2 className="font-bold text-slate-900 dark:text-white">{active ? "Active intrusion alert" : status === "MITIGATED" ? "Alert mitigated" : "No active intrusion alerts"}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Anchor pressure: {anchorPressure} bar</p>
                {criticalStreets.length > 0 && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Affected streets: {criticalStreets.join(", ")}</p>}
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
        </div>
    );
};

export default IntrusionAlerts;
