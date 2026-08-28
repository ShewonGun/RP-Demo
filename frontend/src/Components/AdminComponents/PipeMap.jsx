import { useState, useRef } from "react";
import { FiAnchor } from "react-icons/fi";

const PipeMap = ({ graph, nodeStates, edgeStates, isolatedValves, onHover, onSourceClick }) => {
    const svgRef = useRef(null);

    if (!graph) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50">
                <span className="text-sm text-slate-400">Loading pipeline network...</span>
            </div>
        );
    }

    const getRiskColor = (risk = 0) => {
        if (risk > 60) return "#ef4444"; // Red
        if (risk > 25) return "#f59e0b"; // Orange
        return "#10b981"; // Green
    };

    const getValvePos = (pipeId) => {
        const edge = graph.edges.find((e) => e.id === pipeId);
        if (!edge) return { x: 0, y: 0 };
        const srcNode = graph.nodes.find((n) => n.id === edge.source);
        const tgtNode = graph.nodes.find((n) => n.id === edge.target);
        if (!srcNode || !tgtNode) return { x: 0, y: 0 };
        return {
            x: (srcNode.x + tgtNode.x) / 2,
            y: (srcNode.y + tgtNode.y) / 2,
            angle: Math.atan2(tgtNode.y - srcNode.y, tgtNode.x - srcNode.x) * (180 / Math.PI),
        };
    };

    const handleMouseMove = (e, item, type) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        onHover(item, type, x, y);
    };

    const handleMouseLeave = () => {
        onHover(null, null, 0, 0);
    };

    return (
        <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-4 dark:border-slate-800 shadow-xl select-none">
            {/* Map Legend overlay */}
            <div className="absolute left-4 top-4 z-10 flex flex-col gap-2 rounded-xl bg-slate-900/95 border border-slate-800 p-3.5 text-[10px] text-slate-300 backdrop-blur-md">
                <span className="font-bold text-white border-b border-slate-800 pb-1.5 mb-1 text-[11px]">Kaduwela DMA-02</span>
                <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-550/20" />
                    <span>🟢 Safe (Intrusion Risk &lt; 25%)</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-amber-500 shadow-md shadow-amber-550/20" />
                    <span>🟠 Warning (Risk 25–60%)</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-red-500 shadow-md shadow-red-550/20 animate-pulse" />
                    <span>🔴 Critical (Risk &gt; 60%)</span>
                </div>
                <div className="flex items-center gap-2.5 border-t border-slate-800 pt-1.5 mt-1">
                    <span className="h-3 w-3 rounded-sm bg-blue-500 shadow-md shadow-blue-550/20" />
                    <span>Physical Anchor Sensor</span>
                </div>
            </div>

            <svg
                ref={svgRef}
                viewBox="0 0 800 650"
                className="w-full h-auto max-h-[580px]"
                onMouseLeave={handleMouseLeave}
            >
                {/* Defs for animations / markers */}
                <defs>
                    <marker
                        id="arrow-safe"
                        viewBox="0 0 10 10"
                        refX="6"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 2 L 8 5 L 0 8 z" fill="#10b981" opacity={0.6} />
                    </marker>
                    <marker
                        id="arrow-critical"
                        viewBox="0 0 10 10"
                        refX="6"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 2 L 8 5 L 0 8 z" fill="#ef4444" />
                    </marker>
                </defs>

                {/* ── DRAW EDGES (PIPES) ────────────────────────────────────── */}
                {graph.edges.map((edge) => {
                    const srcNode = graph.nodes.find((n) => n.id === edge.source);
                    const tgtNode = graph.nodes.find((n) => n.id === edge.target);
                    if (!srcNode || !tgtNode) return null;

                    const edgeState = edgeStates[edge.id] || { status: "normal", risk: 2 };
                    const color = getRiskColor(edgeState.risk);
                    const isCritical = edgeState.status === "critical";

                    return (
                        <g key={edge.id}>
                            {/* Invisible wider path for easy hovering */}
                            <line
                                x1={srcNode.x}
                                y1={srcNode.y}
                                x2={tgtNode.x}
                                y2={tgtNode.y}
                                stroke="transparent"
                                strokeWidth={18}
                                className="cursor-crosshair"
                                onMouseMove={(e) => handleMouseMove(e, { ...edge, ...edgeState }, "edge")}
                            />
                            {/* Main Pipe Line */}
                            <line
                                x1={srcNode.x}
                                y1={srcNode.y}
                                x2={tgtNode.x}
                                y2={tgtNode.y}
                                stroke={color}
                                strokeWidth={isCritical ? 4.5 : 2.5}
                                markerEnd={isCritical ? "url(#arrow-critical)" : "url(#arrow-safe)"}
                                strokeDasharray={isCritical ? "6, 4" : "none"}
                                className={`transition-all duration-500 ${
                                    isCritical ? "animate-[dash_1.2s_linear_infinite]" : ""
                                }`}
                                pointerEvents="none"
                            />
                        </g>
                    );
                })}

                {/* ── DRAW VALVES ───────────────────────────────────────────── */}
                {graph.valves.map((valve) => {
                    const pos = getValvePos(valve.pipe);
                    if (pos.x === 0 && pos.y === 0) return null;

                    const isClosed = isolatedValves.includes(valve.id);
                    const state = isClosed ? "closed" : "open";
                    const color = isClosed ? "#f59e0b" : "#10b981";

                    return (
                        <g
                            key={valve.id}
                            transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.angle || 0})`}
                            className="cursor-pointer"
                            onMouseMove={(e) => handleMouseMove(e, { ...valve, state }, "valve")}
                        >
                            {/* Classic double-triangle bowtie valve symbol */}
                            <polygon
                                points="-9,-5 -9,5 9,-5 9,5"
                                fill={color}
                                stroke="#0f172a"
                                strokeWidth={1.5}
                            />
                            <circle r={2.5} fill="#0f172a" />
                            {isClosed && (
                                <circle
                                    r={13}
                                    fill="transparent"
                                    stroke="#f59e0b"
                                    strokeWidth={1.5}
                                    className="animate-ping"
                                />
                            )}
                        </g>
                    );
                })}

                {/* ── DRAW NODES (JUNCTIONS) ────────────────────────────────── */}
                {graph.nodes.map((node) => {
                    const nState = nodeStates[node.id] || { pressure: 3.05, cl: 0.85, risk: 2 };
                    const color = getRiskColor(nState.risk);
                    const isAnchor = graph.anchor_node === node.id;

                    // Reservoir representation
                    if (node.type === "reservoir") {
                        return (
                            <g
                                key={node.id}
                                transform={`translate(${node.x}, ${node.y})`}
                                className="cursor-pointer"
                                onMouseMove={(e) => handleMouseMove(e, { ...node, ...nState }, "node")}
                                onClick={() => onSourceClick?.(node)}
                            >
                                <rect
                                    x={-13}
                                    y={-13}
                                    width={26}
                                    height={26}
                                    rx={3}
                                    fill="#2563eb"
                                    stroke="#0f172a"
                                    strokeWidth={2}
                                />
                                <text
                                    y={22}
                                    textAnchor="middle"
                                    className="text-[9px] font-extrabold fill-slate-400 tracking-wider uppercase"
                                >
                                    Source
                                </text>
                            </g>
                        );
                    }

                    // Pump representation
                    if (node.type === "pump") {
                        return (
                            <g
                                key={node.id}
                                transform={`translate(${node.x}, ${node.y})`}
                                className="cursor-pointer"
                                onMouseMove={(e) => handleMouseMove(e, { ...node, ...nState }, "node")}
                            >
                                <polygon
                                    points="0,-13 13,0 0,13 -13,0"
                                    fill="#7c3aed"
                                    stroke="#0f172a"
                                    strokeWidth={2}
                                />
                                <text
                                    y={22}
                                    textAnchor="middle"
                                    className="text-[9px] font-extrabold fill-slate-400 tracking-wider uppercase"
                                >
                                    Pump
                                </text>
                            </g>
                        );
                    }

                    return (
                        <g
                            key={node.id}
                            transform={`translate(${node.x}, ${node.y})`}
                            className="cursor-pointer"
                            onMouseMove={(e) => handleMouseMove(e, { ...node, ...nState }, "node")}
                        >
                            <circle
                                r={isAnchor ? 11 : 8.5}
                                fill={isAnchor ? "#3b82f6" : color}
                                stroke="#0f172a"
                                strokeWidth={2}
                                className="transition-all duration-500"
                            />
                            
                            {isAnchor ? (
                                <g transform="translate(-5, -5)">
                                    <FiAnchor className="text-[10px] text-white" />
                                </g>
                            ) : (
                                <circle r={3} fill="#fff" opacity={0.7} />
                            )}

                            {/* Label */}
                            <text
                                y={-14}
                                textAnchor="middle"
                                className="text-[10px] fill-slate-400 font-mono tracking-tighter"
                                pointerEvents="none"
                            >
                                {node.id}
                            </text>

                            {/* Dynamic ripple effect for critical nodes */}
                            {nState.risk > 60 && (
                                <circle
                                    r={17}
                                    fill="transparent"
                                    stroke="#ef4444"
                                    strokeWidth={1.5}
                                    className="animate-ping"
                                />
                            )}
                        </g>
                    );
                })}
            </svg>

            {styleTag}
        </div>
    );
};

const styleTag = (
    <style>{`
        @keyframes dash {
            to {
                stroke-dashoffset: -20;
            }
        }
    `}</style>
);

export default PipeMap;
