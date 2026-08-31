/**
 * digitalTwinData.js
 *
 * ⚠️  SIMULATED / DEMONSTRATION DATA ONLY
 *
 * All values in this file are fabricated for prototype purposes.
 * They do NOT represent real Water Board readings, real households,
 * or any live sensor data.
 *
 * To integrate real data later:
 *  1. Replace the exported constants below with async fetch calls to your API.
 *  2. Keep the same data shape so the UI components require no changes.
 */

// ─── Summary ────────────────────────────────────────────────────────────────

export const SUMMARY = {
    totalZones: 3,
    totalHouseholds: 30,
    averageStoragePct: 52,
    highPriorityZones: 1,
};

// ─── Zones ───────────────────────────────────────────────────────────────────

export const ZONES = [
    {
        id: "A",
        name: "Zone A",
        households: 10,
        storagePercentage: 72,
        predictedDemand: 42000,
        risk: "Low",
        priority: 3,
        priorityReason: [
            "Adequate storage reserves",
            "Demand within normal range",
            "All households above critical threshold",
        ],
    },
    {
        id: "B",
        name: "Zone B",
        households: 10,
        storagePercentage: 48,
        predictedDemand: 49000,
        risk: "Medium",
        priority: 2,
        priorityReason: [
            "Storage below 50% — approaching caution level",
            "Above-average predicted demand",
            "Several households below comfortable threshold",
        ],
    },
    {
        id: "C",
        name: "Zone C",
        households: 10,
        storagePercentage: 31,
        predictedDemand: 55000,
        risk: "High",
        priority: 1,
        priorityReason: [
            "Low average storage — below critical 35% threshold",
            "Highest predicted demand across all zones",
            "Several households approaching critical storage levels",
        ],
    },
];

// ─── Households ──────────────────────────────────────────────────────────────

const zoneAStorages = [78, 74, 69, 82, 71, 65, 76, 80, 68, 73];
const zoneBStorages = [52, 44, 61, 38, 55, 49, 42, 57, 46, 51];
const zoneCStorages = [28, 35, 22, 40, 31, 27, 38, 25, 33, 29];

const zoneADemands  = [155, 162, 148, 170, 158, 145, 167, 172, 151, 160];
const zoneBDemands  = [175, 168, 182, 190, 173, 178, 165, 185, 171, 180];
const zoneCDemands  = [190, 195, 185, 200, 188, 192, 197, 183, 196, 191];

const makeHouseholds = () => {
    const list = [];

    // Zone A — H001–H010
    for (let i = 0; i < 10; i++) {
        const pct = zoneAStorages[i];
        list.push({
            id: `H${String(i + 1).padStart(3, "0")}`,
            zone: "A",
            tankCapacity: 1000,
            storagePercentage: pct,
            availableWater: Math.round(1000 * pct / 100),
            predictedDemand: zoneADemands[i],
            risk: pct >= 60 ? "Low" : pct >= 40 ? "Medium" : "High",
            dataSource: "Simulated",
        });
    }

    // Zone B — H011–H020
    for (let i = 0; i < 10; i++) {
        const pct = zoneBStorages[i];
        list.push({
            id: `H${String(i + 11).padStart(3, "0")}`,
            zone: "B",
            tankCapacity: 1000,
            storagePercentage: pct,
            availableWater: Math.round(1000 * pct / 100),
            predictedDemand: zoneBDemands[i],
            risk: pct >= 60 ? "Low" : pct >= 40 ? "Medium" : "High",
            dataSource: "Simulated",
        });
    }

    // Zone C — H021–H030
    for (let i = 0; i < 10; i++) {
        const pct = zoneCStorages[i];
        list.push({
            id: `H${String(i + 21).padStart(3, "0")}`,
            zone: "C",
            tankCapacity: 1000,
            storagePercentage: pct,
            availableWater: Math.round(1000 * pct / 100),
            predictedDemand: zoneCDemands[i],
            risk: pct >= 60 ? "Low" : pct >= 40 ? "Medium" : "High",
            dataSource: "Simulated",
        });
    }

    return list;
};

export const HOUSEHOLDS = makeHouseholds();

// ─── Network topology labels ──────────────────────────────────────────────────

export const NETWORK = {
    source: { label: "Water Source", sublabel: "Municipal Supply" },
    distributionNode: { label: "Distribution Node", sublabel: "Main Junction" },
};
