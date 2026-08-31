/**
 * tankSimulationData.js
 *
 * ⚠️  PROTOTYPE SIMULATION — DEMONSTRATION DATA ONLY
 *
 * This is the SINGLE SOURCE OF TRUTH for H001 tank simulation values.
 * All React components read from and write to this initial shape via
 * React useState — nothing is hard-coded in individual components.
 *
 * To replace with real IoT data later:
 *   1. Fetch tank level from POST /api/readings responses (flowRate × interval).
 *   2. Derive tankLevelL from those readings.
 *   3. Keep the same exported shape so components require no changes.
 *
 * Relationship to virtualDevice.js:
 *   The existing backend simulation/virtualDevice.js posts readings for ESP32
 *   devices via POST /api/readings.  This file is entirely separate and does
 *   NOT interact with that pipeline.  It is a frontend-only prototype state.
 */

// ─── H001 Initial State ───────────────────────────────────────────────────────

export const TANK_CONFIG = {
    householdId:   "H001",
    zone:          "A",
    tankCapacityL: 1000,          // litres
    initialLevelL: 600,           // starting tank level
    minConsumption: 50,           // L/day slider minimum
    maxConsumption: 400,          // L/day slider maximum
    consumptionStep: 10,          // L/day per button press
    refillAmountL: 100,           // litres added per Simulate Refill press
    usageAmountL: 50,             // litres removed per Simulate Usage press
    inflow: 0,                    // L / press (no inflow in prototype — refill button covers it)
};

// ─── Risk thresholds (prototype — not the final research algorithm) ───────────

/**
 * Returns the prototype status for a given storage percentage.
 *
 * Above 40%  → Normal
 * 21%–40%    → Warning
 * 20% or below → Critical
 */
export const getStatus = (pct) => {
    if (pct > 40) return "Normal";
    if (pct > 20) return "Warning";
    return "Critical";
};

/**
 * Computes derived values from a raw tank level.
 * Called every time state changes so components always get consistent numbers.
 */
export const deriveState = (levelL, capacityL) => {
    const clamped    = Math.max(0, Math.min(capacityL, levelL));
    const pct        = Math.round((clamped / capacityL) * 100);
    const status     = getStatus(pct);
    return { levelL: clamped, pct, status };
};
