import json
import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Load static network topology ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(__file__)
with open(os.path.join(BASE_DIR, "network_graph.json"), "r") as f:
    NETWORK_GRAPH = json.load(f)

# ── Defaults ───────────────────────────────────────────────────────────────────
BASELINE_PRESSURE = 3.05  # bar — normal operating pressure
BASELINE_CL = 0.85        # mg/L — residual chlorine at source

# Node state: keyed by node id. Stores pressure, chlorine, risk.
def _default_node_state():
    return {
        "J_100": {"pressure": 3.05, "cl": 0.85, "risk": 1,  "zone": "A"},
        "J_101": {"pressure": 2.95, "cl": 0.84, "risk": 2,  "zone": "A"},
        "J_102": {"pressure": 2.90, "cl": 0.83, "risk": 2,  "zone": "A"},
        "J_103": {"pressure": 2.80, "cl": 0.82, "risk": 3,  "zone": "B"},
        "J_104": {"pressure": 3.05, "cl": 0.82, "risk": 3,  "zone": "B"},  # anchor
        "J_105": {"pressure": 2.75, "cl": 0.81, "risk": 3,  "zone": "B"},
        "J_106": {"pressure": 2.70, "cl": 0.80, "risk": 4,  "zone": "C"},
        "J_107": {"pressure": 2.65, "cl": 0.79, "risk": 4,  "zone": "C"},
        "J_108": {"pressure": 2.60, "cl": 0.78, "risk": 5,  "zone": "C"},
        "J_109": {"pressure": 2.70, "cl": 0.78, "risk": 5,  "zone": "C"},
        "J_110": {"pressure": 2.55, "cl": 0.77, "risk": 5,  "zone": "D"},
        "J_111": {"pressure": 2.50, "cl": 0.76, "risk": 6,  "zone": "D"},
        "J_112": {"pressure": 2.45, "cl": 0.75, "risk": 6,  "zone": "D"},
        "J_113": {"pressure": 2.40, "cl": 0.74, "risk": 7,  "zone": "D"},
        "J_114": {"pressure": 2.35, "cl": 0.73, "risk": 7,  "zone": "E"},
        "J_115": {"pressure": 2.30, "cl": 0.72, "risk": 8,  "zone": "E"},
    }

# Edge state (pipe pressure status)
def _default_edge_state():
    return {e["id"]: {"status": "normal", "risk": 2} for e in NETWORK_GRAPH["edges"]}

# ── Global mutable state ───────────────────────────────────────────────────────
state = {
    "status": "NORMAL",           # NORMAL | INTRUSION_ALERT | MITIGATED
    "anchor_pressure": BASELINE_PRESSURE,
    "critical_streets": [],
    "critical_zones": [],
    "isolated_valves": [],
    "nodes": _default_node_state(),
    "edges": _default_edge_state(),
    "last_updated": datetime.now(timezone.utc).isoformat(),
}

# Alert history log (in-memory for demo)
alert_log = []


# ── Simulated ST-GNN inference ─────────────────────────────────────────────────
def simulate_gnn_inference(anchor_pressure: float):
    drop_ratio = max(0.0, (BASELINE_PRESSURE - anchor_pressure) / BASELINE_PRESSURE)

    # Tuple: (pressure_factor, cl_factor, base_risk, zone)
    inference_map = {
        "J_100": (1.00, 1.00, 1,  "A"),
        "J_101": (0.97, 0.99, 2,  "A"),
        "J_102": (0.95, 0.98, 2,  "A"),
        "J_103": (0.92, 0.97, 3,  "B"),
        "J_104": (1.00, 1.00, 3,  "B"),  # anchor node itself
        "J_105": (0.90, 0.96, 3,  "B"),
        "J_106": (0.88, 0.95, 4,  "C"),
        "J_107": (0.87, 0.94, 4,  "C"),
        "J_108": (0.85, 0.93, 5,  "C"),
        "J_109": (0.88, 0.93, 5,  "C"),
        "J_110": (0.83, 0.91, 5,  "D"),
        "J_111": (0.82, 0.90, 6,  "D"),
        "J_112": (0.80, 0.89, 6,  "D"),
        "J_113": (0.78, 0.88, 7,  "D"),
        "J_114": (0.77, 0.87, 7,  "E"),
        "J_115": (0.75, 0.86, 8,  "E"),
    }

    nodes_out = {}
    for node_id, (p_factor, cl_factor, base_risk, zone) in inference_map.items():
        if node_id == "J_104":
            pressure = round(anchor_pressure, 2)
            cl = round(BASELINE_CL * (1 - drop_ratio * 0.85), 3)
            risk_score = round(min(99, base_risk + drop_ratio * 90))
        else:
            pressure = round(BASELINE_PRESSURE * p_factor * (1 - drop_ratio * 0.9), 2)
            cl = round(BASELINE_CL * cl_factor * (1 - drop_ratio * 0.75), 3)
            risk_score = round(min(99, base_risk + drop_ratio * 70 * (1 / p_factor)))

        nodes_out[node_id] = {
            "pressure": max(0.0, pressure),
            "cl": max(0.0, cl),
            "risk": risk_score,
            "zone": zone,
        }

    return nodes_out


def simulate_edge_inference(node_state: dict) -> dict:
    edge_state = {}
    for edge in NETWORK_GRAPH["edges"]:
        src_risk = node_state.get(edge["source"], {}).get("risk", 2)
        tgt_risk = node_state.get(edge["target"], {}).get("risk", 2)
        avg_risk = round((src_risk + tgt_risk) / 2)
        status = "critical" if avg_risk > 60 else "warning" if avg_risk > 25 else "normal"
        edge_state[edge["id"]] = {"status": status, "risk": avg_risk}
    return edge_state


# ── FastAPI app ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="HydroTwin — Contamination & Intrusion Engine",
    description="Component 4: Water Quality & Contamination-Risk Prediction (Simulated ST-GNN)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response models ────────────────────────────────────────────────────
class PressureDropPayload(BaseModel):
    pressure_bar: float
    sensor_id: str = "SENSOR_01"
    pipe_id: Optional[str] = None


class BurstPayload(BaseModel):
    pipe_id: str = "P_09"
    pressure_bar: float = 0.42
    sensor_id: str = "SENSOR_01"


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/api/network-status")
def get_network_status():
    return state


@app.get("/api/network-graph")
def get_network_graph():
    return NETWORK_GRAPH


@app.post("/api/trigger-pressure-drop")
def trigger_pressure_drop(payload: PressureDropPayload):
    global state

    p = round(payload.pressure_bar, 2)
    state["anchor_pressure"] = p
    state["last_updated"] = datetime.now(timezone.utc).isoformat()

    new_nodes = simulate_gnn_inference(p)
    new_edges = simulate_edge_inference(new_nodes)
    state["nodes"] = new_nodes
    state["edges"] = new_edges

    if p < 1.0:
        state["status"] = "INTRUSION_ALERT"
        state["critical_streets"] = ["New Kandy Road (Ward 3)", "Kaduwela Road (Ward 1)"]
        state["critical_zones"] = ["B", "C"]

        event = {
            "id": f"ALT_{len(alert_log) + 1:04d}",
            "timestamp": state["last_updated"],
            "type": "INTRUSION_ALERT",
            "severity": "CRITICAL" if p < 0.5 else "HIGH",
            "anchor_pressure": p,
            "sensor_id": payload.sensor_id,
            "pipe_id": payload.pipe_id,
            "critical_streets": state["critical_streets"],
            "critical_zones": state["critical_zones"],
            "action_taken": "Auto-detection triggered",
            "resolved": False,
            "resolved_at": None,
        }
        alert_log.append(event)

    elif p < 1.5:
        state["status"] = "INTRUSION_ALERT"
        state["critical_streets"] = ["New Kandy Road (Ward 3)"]
        state["critical_zones"] = ["B"]

        event = {
            "id": f"ALT_{len(alert_log) + 1:04d}",
            "timestamp": state["last_updated"],
            "type": "INTRUSION_ALERT",
            "severity": "MEDIUM",
            "anchor_pressure": p,
            "sensor_id": payload.sensor_id,
            "pipe_id": payload.pipe_id,
            "critical_streets": state["critical_streets"],
            "critical_zones": state["critical_zones"],
            "action_taken": "Monitoring elevated",
            "resolved": False,
            "resolved_at": None,
        }
        alert_log.append(event)
    else:
        state["status"] = "NORMAL"
        state["critical_streets"] = []
        state["critical_zones"] = []

    return {"message": "Network state updated", "network_state": state}


@app.post("/api/simulate-burst")
def simulate_burst(payload: BurstPayload):
    drop_payload = PressureDropPayload(
        pressure_bar=payload.pressure_bar,
        sensor_id=payload.sensor_id,
        pipe_id=payload.pipe_id,
    )
    return trigger_pressure_drop(drop_payload)


@app.post("/api/mitigate")
def mitigate():
    global state

    state["status"] = "MITIGATED"
    state["isolated_valves"] = ["V_18"]
    state["last_updated"] = datetime.now(timezone.utc).isoformat()

    for node_id in state["nodes"]:
        current_risk = state["nodes"][node_id]["risk"]
        if node_id != "J_104":
            state["nodes"][node_id]["risk"] = max(5, round(current_risk * 0.18))
            state["nodes"][node_id]["cl"] = round(
                min(BASELINE_CL, state["nodes"][node_id]["cl"] * 2.5), 3
            )

    for alert in reversed(alert_log):
        if not alert["resolved"]:
            alert["action_taken"] = "Valve V-18 isolated by admin"
            break

    state["edges"] = simulate_edge_inference(state["nodes"])
    return {"message": "Valve V-18 isolated. Plume containment activated.", "network_state": state}


@app.post("/api/reset")
def reset_network():
    global state

    for alert in alert_log:
        if not alert["resolved"]:
            alert["resolved"] = True
            alert["resolved_at"] = datetime.now(timezone.utc).isoformat()
            alert["action_taken"] = alert.get("action_taken", "") + " | Network reset to normal"

    state = {
        "status": "NORMAL",
        "anchor_pressure": BASELINE_PRESSURE,
        "critical_streets": [],
        "critical_zones": [],
        "isolated_valves": [],
        "nodes": _default_node_state(),
        "edges": _default_edge_state(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }
    return {"message": "Network reset to baseline state.", "network_state": state}


@app.get("/api/alert-log")
def get_alert_log():
    return {"count": len(alert_log), "alerts": list(reversed(alert_log))}


@app.get("/api/integration-feeds")
def get_integration_feeds():
    return {
        "component1_demand_forecasting": {
            "status": "SIMULATED",
            "last_received": datetime.now(timezone.utc).isoformat(),
            "data": {
                "zone_A_demand_lps": 12.4,
                "zone_B_demand_lps": 8.7,
                "zone_C_demand_lps": 6.2,
                "zone_D_demand_lps": 4.1,
                "peak_hour": "07:00–09:00",
                "forecast_24h_total_m3": 3420,
            },
        },
        "component2_burst_detection": {
            "status": "SIMULATED",
            "last_received": datetime.now(timezone.utc).isoformat(),
            "data": {
                "active_burst_flags": [],
                "last_event": {
                    "pipe_id": "P_14",
                    "severity": "LOW",
                    "detected_at": "2026-08-27T08:45:00Z",
                    "resolved": True,
                },
            },
        },
        "component3_nrw_output": {
            "status": "SIMULATED",
            "last_sent": datetime.now(timezone.utc).isoformat(),
            "data": {
                "flushing_volume_excluded_m3": 42.0,
                "pipes_flushed": ["P_09", "P_14"],
                "note": "Excluded from billing fraud analysis due to contamination flushing",
            },
        },
    }


@app.get("/")
def root():
    return {
        "service": "HydroTwin — Water Quality & Contamination-Risk Prediction",
        "version": "1.0.0",
        "component": 4,
        "status": "running",
        "docs": "/docs",
    }
