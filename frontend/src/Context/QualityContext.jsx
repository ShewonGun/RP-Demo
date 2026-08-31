import { createContext, useCallback, useContext, useEffect, useState } from "react";

const QualityContext = createContext(null);
const QUALITY_API_URL = import.meta.env.VITE_QUALITY_API_URL || "http://localhost:8000";

const fetchQuality = async (path, options = {}) => {
    const response = await fetch(`${QUALITY_API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || data.message || "Quality service request failed");
    return data;
};

export const QualityProvider = ({ children }) => {
    const [network, setNetwork] = useState(null);
    const [graph, setGraph] = useState({ nodes: [], edges: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refreshAll = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [status, topology] = await Promise.all([
                fetchQuality("/api/network-status"),
                fetchQuality("/api/network-graph"),
            ]);
            setNetwork(status);
            setGraph(topology);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    const applyAction = useCallback(async (path, body) => {
        setLoading(true);
        try {
            const data = await fetchQuality(path, {
                method: "POST",
                body: body ? JSON.stringify(body) : undefined,
            });
            setNetwork(data.network_state);
            setError("");
            return data.network_state;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const triggerPressureDrop = useCallback(
        (pressureBar, sensorId = "SENSOR_01", pipeId = "P_09") =>
            applyAction("/api/trigger-pressure-drop", {
                pressure_bar: pressureBar,
                sensor_id: sensorId,
                pipe_id: pipeId,
            }),
        [applyAction]
    );

    const mitigate = useCallback(() => applyAction("/api/mitigate"), [applyAction]);
    const resetNetwork = useCallback(() => applyAction("/api/reset"), [applyAction]);

    const value = {
        graph,
        status: network?.status || "NORMAL",
        anchorPressure: network?.anchor_pressure ?? 3.05,
        criticalStreets: network?.critical_streets || [],
        isolatedValves: network?.isolated_valves || [],
        nodes: network?.nodes || {},
        edges: network?.edges || {},
        loading,
        error,
        refreshAll,
        triggerPressureDrop,
        mitigate,
        resetNetwork,
    };

    return <QualityContext.Provider value={value}>{children}</QualityContext.Provider>;
};

export const useQuality = () => {
    const context = useContext(QualityContext);
    if (!context) throw new Error("useQuality must be used within a QualityProvider");
    return context;
};