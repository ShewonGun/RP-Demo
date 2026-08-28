import { useState } from "react";
import { useQuality } from "../../Context/QualityContext.jsx";
import PipeMap from "../../Components/AdminComponents/PipeMap.jsx";
import NodeTooltip from "../../Components/AdminComponents/NodeTooltip.jsx";
import IntrusionBanner from "../../Components/AdminComponents/IntrusionBanner.jsx";
import DemoControlsBar from "../../Components/AdminComponents/DemoControlsBar.jsx";
import WaterSupplyScheduleModal from "../../Components/AdminComponents/WaterSupplyScheduleModal.jsx";
import { FiActivity, FiRefreshCw, FiArrowRight, FiSliders } from "react-icons/fi";
import { Link } from "react-router-dom";

const DigitalTwin = () => {
    const {
        graph,
        status,
        anchorPressure,
        criticalStreets,
        isolatedValves,
        nodes,
        edges,
        triggerPressureDrop,
        mitigate,
        resetNetwork,
        loading
    } = useQuality();

    // Hover tooltip state
    const [hoveredItem, setHoveredItem] = useState(null);
    const [hoverType, setHoverType] = useState(null);
    const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
    const [scheduleOpen, setScheduleOpen] = useState(false);

    const handleHover = (item, type, x, y) => {
        setHoveredItem(item);
        setHoverType(type);
        setHoverPos({ x, y });
    };

    // Scenario Switching Logic (linked to DemoControlsBar)
    const handleStateTrigger = async (stateKey) => {
        if (stateKey === "normal") {
            await resetNetwork();
        } else if (stateKey === "burst") {
            await triggerPressureDrop(0.42, "SENSOR_01", "P_09");
        } else if (stateKey === "mitigate") {
            await mitigate();
        }
    };

    return (
        <div className="space-y-6 pb-24">
            
            {/* Header Title */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Water Quality &amp; Contamination Digital Twin</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Spatio-Temporal Graph Neural Network (ST-GNN) virtual sensor simulation.
                </p>
            </div>

            {/* Contamination Banner Status */}
            <IntrusionBanner
                status={status}
                criticalStreets={criticalStreets}
                isolatedValves={isolatedValves}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Panel: Sensor Ingestion & Inferred Quality */}
                <div className="space-y-6 lg:col-span-1">
                    
                    {/* Anchor Sensors Card */}
                    <div className="rounded-2xl bg-white p-5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-400">
                            Active Anchor Sensors
                        </h3>
                        <div className="space-y-3">
                            {/* Sensor 01 (Anchor) */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-150/40 dark:border-slate-800/40">
                                <div>
                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Sensor 01 (Malabe Junction)</span>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Node Link: J_104 · Type: Analog</p>
                                </div>
                                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                                    anchorPressure < 1.0
                                        ? "bg-red-50 text-red-500 animate-pulse border border-red-200/50"
                                        : anchorPressure < 1.5
                                        ? "bg-amber-50 text-amber-500 border border-amber-200/50"
                                        : "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20"
                                }`}>
                                    {anchorPressure} bar
                                </span>
                            </div>

                            {/* Sensor 02 (Static Mock) */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-150/40 dark:border-slate-800/40 opacity-75">
                                <div>
                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Sensor 02 (Clock Tower)</span>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Node Link: J_102 · Type: Analog</p>
                                </div>
                                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20">
                                    2.82 bar
                                </span>
                            </div>

                            {/* Sensor 03 (Static Mock) */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-150/40 dark:border-slate-800/40 opacity-75">
                                <div>
                                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Sensor 03 (Hewagama Line)</span>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Node Link: J_106 · Type: Analog</p>
                                </div>
                                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20">
                                    3.12 bar
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ST-GNN AI Virtual Sensing Inferences */}
                    <div className="rounded-2xl bg-white p-5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-400">
                            ST-GNN Inferred Quality (Downstream)
                        </h3>
                        <div className="space-y-3 text-xs">
                            {["J_109", "J_115", "J_112"].map((nodeId) => {
                                const node = nodes[nodeId] || { cl: 0.82, risk: 3 };
                                return (
                                    <div key={nodeId} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <div>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">Node {nodeId}</span>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Cl: {node.cl} mg/L</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-bold ${
                                                node.risk > 60 ? "text-red-500" : node.risk > 25 ? "text-amber-500" : "text-emerald-500"
                                            }`}>
                                                Risk: {node.risk}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="pt-2">
                            <Link
                                to="/dashboard/risk-matrix"
                                className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400"
                            >
                                View Full Street-Level Risk Matrix Table <FiArrowRight />
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Center/Right Panel: Pipe Graph Map (2/3 width) */}
                <div className="lg:col-span-2 space-y-4 relative">
                    <div className="rounded-2xl bg-white p-5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm relative">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <FiActivity className="text-sky-500" />
                                Kaduwela DMA-02 Pipeline Map Graph
                            </span>
                            {loading && (
                                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
                                    <FiRefreshCw className="animate-spin" />
                                    AI Twin Syncing
                                </span>
                            )}
                        </div>

                        {/* Pipe Map SVG */}
                        <PipeMap
                            graph={graph}
                            nodeStates={nodes}
                            edgeStates={edges}
                            isolatedValves={isolatedValves}
                            onHover={handleHover}
                            onSourceClick={() => setScheduleOpen(true)}
                        />

                        {/* Float Tooltip */}
                        {hoveredItem && (
                            <div
                                className="absolute pointer-events-none z-50 transition-all duration-75"
                                style={{ left: `${hoverPos.x + 20}px`, top: `${hoverPos.y + 20}px` }}
                            >
                                <NodeTooltip item={hoveredItem} type={hoverType} />
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Prescriptive action card when contamination is active */}
            {status === "INTRUSION_ALERT" && (
                <div className="rounded-2xl border border-red-200/80 bg-red-50 dark:border-red-950/80 dark:bg-red-950/20 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce">
                    <div>
                        <h4 className="font-bold text-red-800 dark:text-red-400 text-sm">🚨 GNN Recommendation: Isolation Closure Required</h4>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            ST-GNN AI model advises closing isolation valve V-18 to isolate the contaminant plume from New Kandy Road.
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => handleStateTrigger("mitigate")}
                            className="px-4 py-2 bg-red-650 hover:bg-red-750 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                            Execute Remote Valve Closure
                        </button>
                    </div>
                </div>
            )}

            {/* Demo control strip floating scene selector */}
            <DemoControlsBar
                currentStatus={status}
                onStateTrigger={handleStateTrigger}
                loading={loading}
            />

            <WaterSupplyScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />

        </div>
    );
};

export default DigitalTwin;
