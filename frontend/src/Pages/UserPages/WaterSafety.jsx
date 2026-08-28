import { useState } from "react";
import { FiActivity, FiAlertOctagon, FiCheckCircle, FiClock, FiInfo, FiMapPin, FiPhone, FiRefreshCw } from "react-icons/fi";
import { useQuality } from "../../Context/QualityContext.jsx";

const WaterSafety = () => {
    const { status, nodes, refreshAll } = useQuality();
    const [lang, setLang] = useState("EN");
    const [checking, setChecking] = useState(false);
    const userNode = nodes.J_104 || { pressure: 3.05, cl: 0.85, risk: 2 };
    const isContaminated = status === "INTRUSION_ALERT";
    const isMitigated = status === "MITIGATED";

    const handleCheckUpdate = async () => {
        setChecking(true);
        try {
            await refreshAll();
        } finally {
            setTimeout(() => setChecking(false), 800);
        }
    };

    return (
        <div>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">Water safety</h1>
                    <p className="mt-0.5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><FiMapPin className="h-4 w-4 shrink-0 text-sky-500" />New Kandy Road, Kaduwela (Ward 03)</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-md bg-slate-100 p-1 text-[10px] font-bold dark:bg-slate-900">
                    {["EN", "SI", "TA"].map((language) => <button key={language} type="button" onClick={() => setLang(language)} className={`rounded-sm px-2 py-1 transition ${lang === language ? "bg-white text-slate-800 shadow-xs dark:bg-slate-800 dark:text-slate-100" : "text-slate-400 hover:text-slate-600"}`}>{language}</button>)}
                </div>
            </div>

            <div className="mt-5 grid gap-3 sm:gap-4 lg:grid-cols-5">
                <div className={`rounded-sm border p-5 lg:col-span-3 ${isContaminated ? "border-red-200 bg-red-50 dark:border-red-950/50 dark:bg-red-950/20" : isMitigated ? "border-amber-200 bg-amber-50 dark:border-amber-950/50 dark:bg-amber-950/20" : "border-emerald-200 bg-emerald-50 dark:border-emerald-950/50 dark:bg-emerald-950/20"}`}>
                    <div className="flex items-start gap-3">
                        {isContaminated || isMitigated ? <FiAlertOctagon className={`mt-0.5 h-5 w-5 shrink-0 ${isContaminated ? "text-red-500" : "text-amber-500"}`} /> : <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />}
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Current advisory</p>
                            <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{isContaminated ? "Boil water before consumption" : isMitigated ? "Line isolated and flushing" : "Water quality is normal"}</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{isContaminated ? "A pressure drop was detected in your local supply line. Utility teams are actively flushing the network." : isMitigated ? "The affected line has been isolated and flushing is in progress. Pressure is recovering." : "No quality anomalies are logged. Your supply telemetry is within normal range."}</p>
                            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400"><span className="inline-flex items-center gap-1.5"><FiClock /> Updated just now</span><span>Expected resolution: 4:00 PM</span></div>
                        </div>
                    </div>
                </div>

                <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"><FiActivity className="h-4 w-4" /></span><p className="text-sm font-semibold text-slate-900 dark:text-white">Local supply telemetry</p></div>
                    <div className="mt-5 grid grid-cols-2 gap-4"><Metric label="Pressure" value={`${userNode.pressure} bar`} /><Metric label="Chlorine" value={`${userNode.cl} mg/L`} /><Metric label="Risk level" value={`${userNode.risk}%`} /><Metric label="Location" value="J_104" /></div>
                </div>
            </div>

            <div className="mt-3 rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:mt-4">
                <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"><FiMapPin className="h-4 w-4" /></span><p className="text-sm font-semibold text-slate-900 dark:text-white">Your supply line</p></div><span className={`text-xs font-medium ${isContaminated ? "text-red-600 dark:text-red-400" : isMitigated ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>{isContaminated ? "Advisory zone" : isMitigated ? "Recovery in progress" : "Safe zone"}</span></div>
                <div className="mt-4 overflow-hidden rounded-sm border border-slate-800 bg-slate-950 p-3 sm:p-5">
                    <svg viewBox="0 0 800 180" className="h-auto w-full" role="img" aria-label="Supply line from J-102 through J-104 to J-109">
                        <line x1="110" y1="90" x2="400" y2="90" stroke={isContaminated || isMitigated ? "#f59e0b" : "#10b981"} strokeWidth="6" /><line x1="400" y1="90" x2="690" y2="90" stroke={isContaminated ? "#ef4444" : isMitigated ? "#f59e0b" : "#10b981"} strokeWidth="7" strokeDasharray={isContaminated ? "10 8" : "none"} />
                        <circle cx="110" cy="90" r="13" fill="#10b981" /><circle cx="400" cy="90" r="16" fill={isContaminated || isMitigated ? "#f59e0b" : "#10b981"} /><circle cx="690" cy="90" r="18" fill={isContaminated ? "#ef4444" : isMitigated ? "#f59e0b" : "#10b981"} />
                        <text x="110" y="52" textAnchor="middle" className="fill-slate-400 text-[18px] font-mono">J-102</text><text x="400" y="52" textAnchor="middle" className="fill-slate-300 text-[18px] font-mono font-bold">J-104</text><text x="690" y="52" textAnchor="middle" className="fill-slate-300 text-[18px] font-mono font-bold">J-109</text>
                        <text x="255" y="135" textAnchor="middle" className="fill-slate-500 text-[16px] font-semibold uppercase">Safe sector</text><text x="545" y="135" textAnchor="middle" className={`${isContaminated ? "fill-red-500" : isMitigated ? "fill-amber-500" : "fill-emerald-500"} text-[16px] font-bold uppercase`}>{isContaminated ? "Advisory zone" : "Safe zone"}</text>
                    </svg>
                </div>
            </div>

            <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-2">
                <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"><FiInfo className="h-4 w-4" /></span><p className="text-sm font-semibold text-slate-900 dark:text-white">Household guidance</p></div><ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300"><li><strong className="text-slate-900 dark:text-white">Consumption:</strong> Boil tap water for one full minute before drinking, cooking, or brushing teeth.</li><li><strong className="text-slate-900 dark:text-white">Hygiene:</strong> Water remains suitable for bathing, cleaning, laundry, and flushing.</li><li><strong className="text-slate-900 dark:text-white">Updates:</strong> Registered accounts receive an SMS when flushing is complete.</li></ul></div>
                <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm font-semibold text-slate-900 dark:text-white">Need help?</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Check the latest telemetry or contact the water service hotline for immediate assistance.</p><div className="mt-5 flex flex-wrap gap-2"><button type="button" disabled={checking} onClick={handleCheckUpdate} className="flex items-center gap-1.5 rounded-sm bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"><FiRefreshCw className={checking ? "animate-spin" : ""} />{checking ? "Checking..." : "Check status"}</button><a href="tel:1939" className="flex items-center gap-1.5 rounded-sm border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><FiPhone /> Call 1939</a></div></div>
            </div>
        </div>
    );
};

const Metric = ({ label, value }) => <div><p className="text-xs text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{value}</p></div>;

export default WaterSafety;
