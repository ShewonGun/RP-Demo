import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiSearch, FiFilter, FiShield, FiClock, FiMapPin, FiCheckCircle } from "react-icons/fi";
import { StaggerGrid, StaggerItem } from "../../Components/SharedComponents/Motion.jsx";

const initialAlerts = [
    {
        id: "AL-001",
        zone: "Zone 07",
        zoneId: "07",
        risk: 91,
        cause: "Partial Bypass",
        detected: "Today",
        status: "Open",
    },
    {
        id: "AL-002",
        zone: "Zone 04",
        zoneId: "04",
        risk: 89,
        cause: "Unauthorized Connection",
        detected: "Today",
        status: "Open",
    },
    {
        id: "AL-003",
        zone: "Zone 06",
        zoneId: "06",
        risk: 81,
        cause: "Pressure Anomaly",
        detected: "Today",
        status: "Reviewing",
    },
    {
        id: "AL-004",
        zone: "Zone 03",
        zoneId: "03",
        risk: 54,
        cause: "Unknown",
        detected: "Yesterday",
        status: "Resolved",
    },
];

const riskFilters = ["All", "High Risk", "Medium Risk", "Under Review", "Resolved"];
const statusCycle = ["Open", "Reviewing", "Inspection Required", "Resolved"];

const AlertsInvestigations = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState(initialAlerts);
    const [riskFilter, setRiskFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [notice, setNotice] = useState("");
    const [statusUpdates, setStatusUpdates] = useState({});

    const filteredAlerts = useMemo(() => {
        const query = search.trim().toLowerCase();
        return alerts.filter((alert) => {
            const riskMatch =
                riskFilter === "All" ||
                (riskFilter === "High Risk" && alert.risk >= 80) ||
                (riskFilter === "Medium Risk" && alert.risk >= 50 && alert.risk < 80) ||
                (riskFilter === "Under Review" && alert.status === "Reviewing") ||
                (riskFilter === "Resolved" && alert.status === "Resolved");

            const searchMatch =
                !query ||
                alert.id.toLowerCase().includes(query) ||
                alert.zone.toLowerCase().includes(query) ||
                alert.cause.toLowerCase().includes(query);

            return riskMatch && searchMatch;
        });
    }, [alerts, riskFilter, search]);

    const updateStatus = (alertId, nextStatus) => {
        setAlerts((current) => current.map((alert) => (alert.id === alertId ? { ...alert, status: nextStatus } : alert)));
        setStatusUpdates((current) => ({ ...current, [alertId]: nextStatus }));
        setNotice(`${alertId} updated to ${nextStatus}.`);
    };

    const getNextStatusOptions = (currentStatus) => {
        const index = statusCycle.indexOf(currentStatus);
        if (index === -1 || index === statusCycle.length - 1) return [currentStatus];
        return statusCycle.slice(index + 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">Alerts &amp; Investigations</h1>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Review suspicious network events and field investigation activities.</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    {filteredAlerts.length} alert{filteredAlerts.length === 1 ? "" : "s"} shown
                </div>
            </div>

            {notice && (
                <div className="rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-950/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                    {notice}
                </div>
            )}

            <StaggerGrid className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                <StaggerItem>
                    <div className="rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            <FiSearch className="h-4 w-4 text-sky-500" />
                            Search by zone or alert ID
                        </div>
                        <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                            <FiSearch className="h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by zone or alert ID"
                                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                            />
                        </div>
                    </div>
                </StaggerItem>

                <StaggerItem>
                    <div className="rounded-sm border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            <FiFilter className="h-4 w-4 text-sky-500" />
                            Filters
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {riskFilters.map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setRiskFilter(filter)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                        riskFilter === filter
                                            ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
                                            : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </StaggerItem>
            </StaggerGrid>

            <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Alerts Table</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Use the controls to review and update investigation status.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        <FiShield className="h-4 w-4 text-sky-500" />
                        Mock data only
                    </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-220 text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                                <th className="px-4 py-2.5 font-medium">Alert ID</th>
                                <th className="px-4 py-2.5 font-medium">Zone</th>
                                <th className="px-4 py-2.5 font-medium">Risk</th>
                                <th className="px-4 py-2.5 font-medium">Possible Cause</th>
                                <th className="px-4 py-2.5 font-medium">Detected</th>
                                <th className="px-4 py-2.5 font-medium">Status</th>
                                <th className="px-4 py-2.5 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAlerts.map((alert) => (
                                <tr key={alert.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{alert.id}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <FiMapPin className="h-4 w-4 text-slate-400" />
                                            <span className="font-medium text-slate-900 dark:text-white">{alert.zone}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <RiskBadge risk={alert.risk} />
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{alert.cause}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{alert.detected}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                            <StatusBadge status={alert.status} />
                                            <div className="min-w-36">
                                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                                    Investigation Status
                                                </p>
                                                <select
                                                    value={alert.status}
                                                    onChange={(event) => updateStatus(alert.id, event.target.value)}
                                                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 outline-none transition focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                                                >
                                                    {[alert.status, ...getNextStatusOptions(alert.status).filter((status) => status !== alert.status)].map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {statusUpdates[alert.id] && (
                                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Updated</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/zone/${alert.zoneId}`)}
                                            className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700"
                                        >
                                            View <FiArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <FiClock className="h-4 w-4 text-sky-500" />
                        Investigation Summary
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Open alerts can be moved through review, inspection, and resolution states without leaving this page.
                    </p>
                </div>
                <div className="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <FiCheckCircle className="h-4 w-4 text-emerald-500" />
                        Active Workflow
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Status changes are kept locally in mock state and confirm instantly for operational review.
                    </p>
                </div>
            </div>
        </div>
    );
};

const RiskBadge = ({ risk }) => {
    const tone = risk >= 80 ? "High" : risk >= 50 ? "Medium" : "Low";
    const classes =
        tone === "High"
            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
            : tone === "Medium"
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";

    return <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold ${classes}`}>{tone}</span>;
};

const StatusBadge = ({ status }) => {
    const classes =
        status === "Open"
            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
            : status === "Reviewing"
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              : status === "Inspection Required"
                ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";

    return <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold ${classes}`}>{status}</span>;
};

export default AlertsInvestigations;
