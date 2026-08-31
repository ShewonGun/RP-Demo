import { useState } from "react";
import { useQuality } from "../../Context/QualityContext.jsx";
import { FiArrowLeft, FiSearch, FiList, FiTrendingUp, FiActivity, FiMap } from "react-icons/fi";
import { Link } from "react-router-dom";

const StreetRiskMatrix = () => {
    const { status, nodes, edges, loading } = useQuality();
    const [searchTerm, setSearchTerm] = useState("");
    const [riskFilter, setRiskFilter] = useState("ALL");

    // Mapping Kaduwela graph links to street names (DMA-02 map)
    const pipeStreetMapping = [
        { street: "New Kandy Road (Ward 3)", pipeId: "P_09", link: "J_104 ➔ J_109" },
        { street: "Samagi Mawatha Link Line", pipeId: "P_14", link: "J_109 ➔ J_112" },
        { street: "Kaduwela Road Upper", pipeId: "P_04", link: "J_101 ➔ J_104" },
        { street: "Malabe Main Conduit A", pipeId: "P_01", link: "J_100 ➔ J_101" },
        { street: "Malabe Main Conduit B", pipeId: "P_02", link: "J_100 ➔ J_102" },
        { street: "Hewagama Line", pipeId: "P_06", link: "J_102 ➔ J_106" },
        { street: "Koratota Road East", pipeId: "P_11", link: "J_106 ➔ J_110" },
        { street: "Ward 1 Bypass Line", pipeId: "P_03", link: "J_101 ➔ J_103" },
        { street: "Hospital Access Main", pipeId: "P_15", link: "J_109 ➔ J_113" },
        { street: "Boralugoda Bypass", pipeId: "P_18", link: "J_112 ➔ J_114" },
        { street: "Ranala South Conduit", pipeId: "P_19", link: "J_113 ➔ J_115" },
        { street: "DMA Boundary Connector", pipeId: "P_20", link: "J_114 ➔ J_115" },
    ];

    const getRiskStatusBadge = (risk = 0) => {
        if (risk > 60) {
            return (
                <span className="inline-flex items-center gap-1 rounded-md bg-red-550/10 px-2.5 py-1 text-xs font-bold text-red-500">
                    🔴 Critical
                </span>
            );
        }
        if (risk > 25) {
            return (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-550/10 px-2.5 py-1 text-xs font-bold text-amber-500">
                    🟠 Warning
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-550/10 px-2.5 py-1 text-xs font-bold text-emerald-500">
                🟢 Safe
            </span>
        );
    };

    // Build complete table items combining static map and live state
    const tableItems = pipeStreetMapping.map((item) => {
        const edgeState = edges[item.pipeId] || { status: "normal", risk: 2 };
        
        // Find corresponding nodes for pressure/chlorine indicators
        const [srcId, tgtId] = item.link.split(" ➔ ");
        const srcNode = nodes[srcId] || { pressure: 3.05, cl: 0.85 };
        const tgtNode = nodes[tgtId] || { pressure: 3.05, cl: 0.85 };
        
        const avgPressure = ((srcNode.pressure + tgtNode.pressure) / 2).toFixed(2);
        const avgCl = ((srcNode.cl + tgtNode.cl) / 2).toFixed(2);

        // Prescription action rule
        let action = "Normal Supply";
        if (edgeState.risk > 60) {
            action = "Isolate Valve V-18";
        } else if (edgeState.risk > 25) {
            action = "Schedule Scour Flushing";
        }

        return {
            ...item,
            pressure: `${avgPressure} bar`,
            cl: `${avgCl} mg/L`,
            risk: edgeState.risk,
            action,
            rawPressure: parseFloat(avgPressure),
        };
    });

    // Filtering logic
    const filteredItems = tableItems.filter((item) => {
        const matchesSearch =
            item.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.pipeId.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        if (riskFilter === "CRITICAL") matchesFilter = item.risk > 60;
        else if (riskFilter === "WARNING") matchesFilter = item.risk > 25 && item.risk <= 60;
        else if (riskFilter === "SAFE") matchesFilter = item.risk <= 25;

        return matchesSearch && matchesFilter;
    });

    // Sampling priorities
    const criticalItems = tableItems.filter(item => item.risk > 60);
    const warningItems = tableItems.filter(item => item.risk > 25 && item.risk <= 60);

    return (
        <div className="space-y-6">
            
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FiList className="text-sky-500" />
                        Street-Level Risk Matrix
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Water Quality Directory for Kaduwela DMA-02 pipelines.
                    </p>
                </div>
                <Link
                    to="/dashboard/hydrotwin"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                    <FiArrowLeft /> Back to Live Map
                </Link>
            </div>

            {/* Filter controls row */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
                {/* Search bar */}
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search street name or pipe ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs dark:border-slate-850 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                    />
                </div>

                {/* Risk filter selector */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-1">
                    {["ALL", "CRITICAL", "WARNING", "SAFE"].map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setRiskFilter(f)}
                            className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase transition ${
                                riskFilter === f
                                    ? "bg-slate-900 dark:bg-slate-800 text-white shadow-xs"
                                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Matrix Table */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                            <th className="px-5 py-3">Street Name</th>
                            <th className="px-4 py-3 font-mono">Pipe ID</th>
                            <th className="px-4 py-3 font-mono">Node Link</th>
                            <th className="px-4 py-3">Measured/Inferred Pressure</th>
                            <th className="px-4 py-3">Virtual Cl Level</th>
                            <th className="px-4 py-3">Intrusion Risk</th>
                            <th className="px-5 py-3">Action / Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                        {loading && filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                                    Updating matrix telemetry...
                                </td>
                            </tr>
                        ) : filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                                    No records found matching filters.
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((item) => (
                                <tr key={item.pipeId} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/40 transition">
                                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                                        {item.street}
                                    </td>
                                    <td className="px-4 py-3.5 font-mono text-slate-400">{item.pipeId}</td>
                                    <td className="px-4 py-3.5 font-mono text-slate-400">{item.link}</td>
                                    <td className="px-4 py-3.5 font-mono font-medium">
                                        <span className={item.rawPressure < 1.0 ? "text-red-500 font-bold" : item.rawPressure < 1.5 ? "text-amber-500" : ""}>
                                            {item.pressure}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 font-mono">{item.cl}</td>
                                    <td className="px-4 py-3.5 font-mono">{getRiskStatusBadge(item.risk)}</td>
                                    <td className="px-5 py-3.5 font-medium">
                                        <span className={`px-2 py-1 rounded-md text-[10px] ${
                                            item.risk > 60
                                                ? "bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 font-bold border border-red-200/50"
                                                : item.risk > 25
                                                ? "bg-amber-50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-400 border border-amber-200/50"
                                                : "bg-slate-50 dark:bg-slate-800/40 text-slate-500"
                                        }`}>
                                            {item.action}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Targeted Sampling Tasks (Field Recommendations) */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FiActivity className="text-sky-500 animate-pulse" />
                    Targeted Field Sampling Recommendations
                </h3>
                <div className="space-y-2">
                    {criticalItems.length > 0 ? (
                        criticalItems.map((item, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start text-xs bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950 p-3 rounded-lg text-red-800 dark:text-red-400">
                                <span className="flex-shrink-0 bg-red-500 text-white font-bold h-5 w-5 rounded-full flex items-center justify-center text-[10px]">
                                    {idx + 1}
                                </span>
                                <div>
                                    <span className="font-bold">Priority Sample Task:</span> Collect immediate grab sample at junction <span className="font-mono font-semibold bg-red-100 dark:bg-red-900/40 px-1 rounded">{item.link.split(" ➔ ")[1]}</span> tap. Inferred chlorine drop detected below safety baseline ({item.cl}).
                                </div>
                            </div>
                        ))
                    ) : warningItems.length > 0 ? (
                        warningItems.map((item, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start text-xs bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-950 p-3 rounded-lg text-amber-800 dark:text-amber-400">
                                <span className="flex-shrink-0 bg-amber-500 text-white font-bold h-5 w-5 rounded-full flex items-center justify-center text-[10px]">
                                    {idx + 1}
                                </span>
                                <div>
                                    <span className="font-bold">Routine Flush Task:</span> Verify pressure restoration downstream at node <span className="font-mono font-semibold bg-amber-100 dark:bg-amber-900/40 px-1 rounded">{item.link.split(" ➔ ")[1]}</span>. Line pressure lower than baseline ({item.pressure}).
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex gap-2.5 items-start text-xs bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 p-3 rounded-lg text-emerald-800 dark:text-emerald-400">
                            <span className="flex-shrink-0 bg-emerald-500 text-white font-bold h-5 w-5 rounded-full flex items-center justify-center text-[10px]">
                                ✓
                            </span>
                            <div>
                                <span className="font-bold">Field Tasks Clear:</span> Network health is optimal. No targeted quality sampling required at this time.
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default StreetRiskMatrix;
