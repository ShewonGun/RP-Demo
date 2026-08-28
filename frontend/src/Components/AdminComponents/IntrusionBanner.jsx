import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const IntrusionBanner = ({ status, criticalStreets = [], isolatedValves = [] }) => {
    const alert = status === "INTRUSION_ALERT";
    const mitigated = status === "MITIGATED";
    const tone = alert ? "red" : mitigated ? "amber" : "emerald";
    const Icon = alert || mitigated ? FiAlertTriangle : FiCheckCircle;
    const title = alert ? "Intrusion alert active" : mitigated ? "Intrusion mitigated" : "Network quality normal";

    return (
        <div className={`flex items-start gap-3 rounded-2xl border border-${tone}-200 bg-${tone}-50 p-4 dark:border-${tone}-950/50 dark:bg-${tone}-950/20`}>
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 text-${tone}-500`} />
            <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
                {criticalStreets.length > 0 && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Affected: {criticalStreets.join(", ")}</p>}
                {isolatedValves.length > 0 && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Isolated valves: {isolatedValves.join(", ")}</p>}
            </div>
        </div>
    );
};

export default IntrusionBanner;
