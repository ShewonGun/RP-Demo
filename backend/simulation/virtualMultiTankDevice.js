/**
 * virtualMultiTankDevice.js
 *
 * Component 3 — Backend Multi-Tank Simulator
 * Simulates 2 distinct household tanks with different capacities and initial storage:
 *   - Device 1: ESP32-A1 → Household H001 (Zone A) | Tank Capacity: 1000 L | Normal Storage (60%)
 *   - Device 2: ESP32-C1 → Household H021 (Zone C) | Tank Capacity: 750 L  | Warning Storage (30%)
 *
 * Posts IoT flow rate and volume telemetry to POST /api/readings.
 *
 * Usage:
 *   node simulation/virtualMultiTankDevice.js [intervalMs] [scenario]
 *   Example: node simulation/virtualMultiTankDevice.js 2000 clean
 *
 * ⚠️ Does NOT modify or replace teammate's existing simulation/virtualDevice.js.
 */

import dotenv from "dotenv";
dotenv.config();

const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
const intervalMs = Number(process.argv[2]) || 3000;
const scenarioArg = (process.argv[3] || "clean").toLowerCase();

// Device Specifications & Tank Configuration
const DEVICES = [
    {
        deviceId: "ESP32-A1",
        householdId: "H001",
        zone: "Zone A",
        tankCapacityL: 1000,
        currentLevelL: 600,     // 60% Storage (Normal)
        baseFlowRate: 8.2,      // L/min
    },
    {
        deviceId: "ESP32-C1",
        householdId: "H021",
        zone: "Zone C",
        tankCapacityL: 750,
        currentLevelL: 225,     // 30% Storage (Warning)
        baseFlowRate: 14.5,     // L/min
    },
];

console.log("=================================================");
console.log("  Component 3 — Multi-Tank Telemetry Simulator ");
console.log("=================================================");
DEVICES.forEach((d) => {
    console.log(`📡 Device: ${d.deviceId} | House: ${d.householdId} (${d.zone}) | Tank: ${d.currentLevelL}L / ${d.tankCapacityL}L (${Math.round((d.currentLevelL/d.tankCapacityL)*100)}%)`);
});
console.log(`⏱ Interval: ${intervalMs}ms | Scenario: ${scenarioArg}`);
console.log("-------------------------------------------------\n");

const rand = (base, jitter) => Math.max(0, base + (Math.random() * 2 - 1) * jitter);

const sendDeviceReading = async (dev) => {
    const jitter = dev.baseFlowRate * 0.2;
    const flowRate = +rand(dev.baseFlowRate, jitter).toFixed(2);
    const volume = +(flowRate * (intervalMs / 60000)).toFixed(3);

    // Update level equation: Level = Level - Volume
    dev.currentLevelL = Math.max(0, +(dev.currentLevelL - volume).toFixed(2));
    const storagePct = Math.round((dev.currentLevelL / dev.tankCapacityL) * 100);

    try {
        const res = await fetch(`${API_URL}/api/readings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                deviceId: dev.deviceId,
                householdId: dev.householdId,
                flowRate,
                volume,
                tankCapacityL: dev.tankCapacityL,
                estimatedLevelL: dev.currentLevelL,
                storagePercentage: storagePct,
            }),
        });

        const data = await res.json();
        const statusEmoji = storagePct > 40 ? "🟢 Normal" : storagePct > 20 ? "🟡 Warning" : "🔴 Critical";
        console.log(`[${new Date().toLocaleTimeString()}] ${dev.deviceId} (${dev.householdId}): Flow ${flowRate} L/min | Vol ${volume} L | Level: ${dev.currentLevelL}L / ${dev.tankCapacityL}L (${storagePct}% ${statusEmoji})`);
    } catch (err) {
        console.error(`[${dev.deviceId}] Transmission Error: ${err.message}`);
    }
};

const runSimulation = () => {
    DEVICES.forEach((dev) => sendDeviceReading(dev));
};

setInterval(runSimulation, intervalMs);
runSimulation();
