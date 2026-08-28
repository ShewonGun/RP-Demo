const NodeTooltip = ({ item, type, x, y }) => {
    if (!item) return null;

    return (
        <div className="pointer-events-none fixed z-50 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white shadow-lg" style={{ left: x + 12, top: y + 12 }}>
            <p className="font-bold">{type === "edge" ? item.id : item.id || item.node_id}</p>
            {item.pressure !== undefined && <p className="mt-1 text-slate-300">Pressure: {item.pressure} bar</p>}
            {item.cl !== undefined && <p className="text-slate-300">Chlorine: {item.cl} mg/L</p>}
            {item.risk !== undefined && <p className="text-slate-300">Risk: {item.risk}%</p>}
        </div>
    );
};

export default NodeTooltip;
