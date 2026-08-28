import { FiCheckCircle, FiAlertTriangle, FiShield, FiCpu, FiPlay } from "react-icons/fi";

const DemoControlsBar = ({ currentStatus, onStateTrigger, loading }) => {
    return (
        <div className="fixed bottom-4 left-6 right-6 md:left-[248px] z-40 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xl backdrop-blur-md dark:border-slate-800/85 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Left side: status overview */}
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                        <FiCpu className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Twin Simulation Engine</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-semibold">Active Mode:</span>
                            {currentStatus === "NORMAL" && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    🟢 Normal Flow
                                </span>
                            )}
                            {currentStatus === "INTRUSION_ALERT" && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 animate-pulse">
                                    🔴 Contamination Anomaly
                                </span>
                            )}
                            {currentStatus === "MITIGATED" && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                    🟡 Isolated & Mitigated
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: state trigger controls */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* State 1: Normal */}
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => onStateTrigger("normal")}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition duration-200 ${
                            currentStatus === "NORMAL"
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                        }`}
                    >
                        <FiCheckCircle className="h-4 w-4" />
                        State 1: Normal
                    </button>

                    {/* State 2: Pressure Drop Anomaly */}
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => onStateTrigger("burst")}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition duration-200 ${
                            currentStatus === "INTRUSION_ALERT"
                                ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                        }`}
                    >
                        <FiAlertTriangle className="h-4 w-4" />
                        State 2: Pressure Anomaly
                    </button>

                    {/* State 3: Mitigate */}
                    <button
                        type="button"
                        disabled={loading || currentStatus !== "INTRUSION_ALERT"}
                        onClick={() => onStateTrigger("mitigate")}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition duration-200 ${
                            currentStatus === "MITIGATED"
                                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                                : "bg-slate-100 disabled:opacity-40 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                        }`}
                    >
                        <FiShield className="h-4 w-4" />
                        State 3: Isolate &amp; Mitigate
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DemoControlsBar;
