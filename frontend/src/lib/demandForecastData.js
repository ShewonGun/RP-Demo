/**
 * demandForecastData.js
 *
 * ⚠️  SIMULATED / DEMONSTRATION DATA ONLY
 * No real sensors, ML model, or database.
 * Replace exports with API calls when real data is available.
 */

// ─── Monthly demand per zone (L) ─────────────────────────────────────────────

const MONTHS_HISTORICAL = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const MONTHS_PREDICTED  = ["Jul", "Aug", "Sep"];
export const ALL_MONTHS = [...MONTHS_HISTORICAL, ...MONTHS_PREDICTED];

// Zone-level monthly data
export const ZONE_DATA = {
    A: {
        label: "Zone A",
        risk: "Low",
        historical: [42000, 45000, 47000, 46000, 50000, 52000],
        predicted:  [54000, 55000, 57000],
    },
    B: {
        label: "Zone B",
        risk: "Medium",
        historical: [55000, 57000, 60000, 62000, 65000, 68000],
        predicted:  [70000, 73000, 75000],
    },
    C: {
        label: "Zone C",
        risk: "High",
        historical: [70000, 72000, 78000, 80000, 85000, 90000],
        predicted:  [94000, 97000, 100000],
    },
};

// ─── Household-level monthly data ────────────────────────────────────────────
// 10 households per zone, sampled to keep data compact.

const makeHouseholdSeries = (base, historical, predicted) => ({
    historical: historical.map((v) => Math.round(v + base)),
    predicted:  predicted.map((v)  => Math.round(v + base)),
});

export const HOUSEHOLD_DATA = {
    // Zone A households H001–H010
    H001: makeHouseholdSeries(0,   [3800, 4100, 4300, 4200, 4500, 4700], [4900, 5000, 5200]),
    H002: makeHouseholdSeries(200, [3800, 4100, 4300, 4200, 4500, 4700], [4900, 5000, 5200]),
    H003: makeHouseholdSeries(-150,[3800, 4100, 4300, 4200, 4500, 4700], [4900, 5000, 5200]),
    H004: makeHouseholdSeries(300, [3800, 4100, 4300, 4200, 4500, 4700], [4900, 5000, 5200]),
    H005: makeHouseholdSeries(-80, [3800, 4100, 4300, 4200, 4500, 4700], [4900, 5000, 5200]),
    H006: makeHouseholdSeries(120, [3800, 4100, 4300, 4200, 4500, 4700], [4900, 5000, 5200]),
    H007: makeHouseholdSeries(-200,[3800, 4100, 4300, 4200, 4500, 4700], [4900, 5000, 5200]),
    H008: makeHouseholdSeries(50,  [3800, 4100, 4300, 4200, 4500, 4700], [4900, 5000, 5200]),
    H009: makeHouseholdSeries(-50, [3800, 4100, 4300, 4200, 4500, 4700], [4900, 5000, 5200]),
    H010: makeHouseholdSeries(90,  [3800, 4100, 4300, 4200, 4500, 4700], [4900, 5000, 5200]),
    // Zone B households H011–H020
    H011: makeHouseholdSeries(0,   [5000, 5200, 5500, 5700, 6000, 6200], [6400, 6600, 6800]),
    H012: makeHouseholdSeries(180, [5000, 5200, 5500, 5700, 6000, 6200], [6400, 6600, 6800]),
    H013: makeHouseholdSeries(-100,[5000, 5200, 5500, 5700, 6000, 6200], [6400, 6600, 6800]),
    H014: makeHouseholdSeries(250, [5000, 5200, 5500, 5700, 6000, 6200], [6400, 6600, 6800]),
    H015: makeHouseholdSeries(-60, [5000, 5200, 5500, 5700, 6000, 6200], [6400, 6600, 6800]),
    H016: makeHouseholdSeries(100, [5000, 5200, 5500, 5700, 6000, 6200], [6400, 6600, 6800]),
    H017: makeHouseholdSeries(-180,[5000, 5200, 5500, 5700, 6000, 6200], [6400, 6600, 6800]),
    H018: makeHouseholdSeries(70,  [5000, 5200, 5500, 5700, 6000, 6200], [6400, 6600, 6800]),
    H019: makeHouseholdSeries(-40, [5000, 5200, 5500, 5700, 6000, 6200], [6400, 6600, 6800]),
    H020: makeHouseholdSeries(80,  [5000, 5200, 5500, 5700, 6000, 6200], [6400, 6600, 6800]),
    // Zone C households H021–H030
    H021: makeHouseholdSeries(0,   [6500, 6700, 7200, 7400, 7800, 8300], [8700, 9000, 9200]),
    H022: makeHouseholdSeries(220, [6500, 6700, 7200, 7400, 7800, 8300], [8700, 9000, 9200]),
    H023: makeHouseholdSeries(-120,[6500, 6700, 7200, 7400, 7800, 8300], [8700, 9000, 9200]),
    H024: makeHouseholdSeries(310, [6500, 6700, 7200, 7400, 7800, 8300], [8700, 9000, 9200]),
    H025: makeHouseholdSeries(-70, [6500, 6700, 7200, 7400, 7800, 8300], [8700, 9000, 9200]),
    H026: makeHouseholdSeries(140, [6500, 6700, 7200, 7400, 7800, 8300], [8700, 9000, 9200]),
    H027: makeHouseholdSeries(-210,[6500, 6700, 7200, 7400, 7800, 8300], [8700, 9000, 9200]),
    H028: makeHouseholdSeries(60,  [6500, 6700, 7200, 7400, 7800, 8300], [8700, 9000, 9200]),
    H029: makeHouseholdSeries(-55, [6500, 6700, 7200, 7400, 7800, 8300], [8700, 9000, 9200]),
    H030: makeHouseholdSeries(100, [6500, 6700, 7200, 7400, 7800, 8300], [8700, 9000, 9200]),
};

// Households grouped by zone
export const ZONE_HOUSEHOLDS = {
    A: ["H001","H002","H003","H004","H005","H006","H007","H008","H009","H010"],
    B: ["H011","H012","H013","H014","H015","H016","H017","H018","H019","H020"],
    C: ["H021","H022","H023","H024","H025","H026","H027","H028","H029","H030"],
};

// Time period options
export const TIME_PERIODS = [
    { label: "Last 3 months + 3 months forecast", histCount: 3, predCount: 3 },
    { label: "Last 6 months + 3 months forecast", histCount: 6, predCount: 3 },
];

// ─── Zone comparison summary (last historical vs. first predicted) ────────────

export const ZONE_COMPARISON = Object.entries(ZONE_DATA).map(([id, z]) => {
    const current   = z.historical[z.historical.length - 1];
    const predicted = z.predicted[0];
    const changePct = (((predicted - current) / current) * 100).toFixed(1);
    return {
        id,
        label: z.label,
        risk: z.risk,
        current,
        predicted,
        changePct: Number(changePct),
    };
});
