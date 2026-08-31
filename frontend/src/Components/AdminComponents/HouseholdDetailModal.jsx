import { FiX, FiCheckCircle, FiAlertTriangle, FiAlertOctagon, FiHome } from "react-icons/fi";

const riskStyles = {
    Low: {
        badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
        bar: "bg-emerald-500",
        iconCls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
        Icon: FiCheckCircle,
    },
    Medium: {
        badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
        bar: "bg-amber-500",
        iconCls: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
        Icon: FiAlertTriangle,
    },
    High: {
        badge: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
        bar: "bg-red-500",
        iconCls: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
        Icon: FiAlertOctagon,
    },
};

const Row = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
        <span className="text-xs font-medium text-slate-900 dark:text-white text-right">{value}</span>
    </div>
);

const HouseholdDetailModal = ({ open, household, onClose }) => {
    if (!open || !household) return null;

    const s = riskStyles[household.risk] || riskStyles.Low;
    const { Icon } = s;

    const daysOfSupply =
        household.predictedDemand > 0
            ? (household.availableWater / household.predictedDemand).toFixed(1)
            : "—";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="max-h-[88vh] w-full max-w-sm overflow-y-auto rounded-sm border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${s.iconCls}`}>
                            <FiHome className="h-5 w-5" />
                        </span>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                Household {household.id}
                            </h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Zone {household.zone}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${s.badge}`}>
                            {household.risk}
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800"
                            aria-label="Close"
                        >
                            <FiX className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Simulated data notice */}
                <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-[11px] text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    ⚠ All values are simulated demonstration data.
                </p>

                {/* Tank bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Tank Storage Level</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{household.storagePercentage}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${household.storagePercentage}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        {household.availableWater} L available of {household.tankCapacity} L capacity
                    </p>
                </div>

                {/* Detail rows */}
                <div className="mt-4 rounded-sm border border-slate-200 dark:border-slate-800 px-4">
                    <Row label="Household ID" value={household.id} />
                    <Row label="Zone" value={`Zone ${household.zone}`} />
                    <Row label="Tank Capacity" value={`${household.tankCapacity} L`} />
                    <Row label="Estimated Storage" value={`${household.storagePercentage}%`} />
                    <Row label="Available Water" value={`${household.availableWater} L`} />
                    <Row label="Predicted Demand" value={`${household.predictedDemand} L / day`} />
                    <Row label="Est. Days of Supply" value={`${daysOfSupply} days`} />
                    <Row label="Risk Level" value={household.risk} />
                    <Row label="Data Source" value={household.dataSource} />
                </div>

                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-sm px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HouseholdDetailModal;
