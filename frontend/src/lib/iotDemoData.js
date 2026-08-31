/**
 * iotDemoData.js
 *
 * IoT Prototype Telemetry & Multi-Tank Configuration Data
 *
 * ⚠️ HARDWARE PROTOTYPE CONFIGURATION:
 * Demonstrates TWO IoT devices with DIFFERENT tank capacities and storage states:
 *
 *   - Device 1: ESP32-A1 → Household H001 (Zone A)
 *     Capacity: 1000 L | Level: 600 L (60% Storage - Normal Status)
 *
 *   - Device 2: ESP32-C1 → Household H021 (Zone C)
 *     Capacity: 750 L  | Level: 225 L (30% Storage - Warning Status)
 *
 * The remaining 28 households (H002–H020, H022–H030) operate on Water Board Historical Monthly Data.
 */

export const IOT_DEVICES = [
    {
        deviceId: "ESP32-A1",
        householdId: "H001",
        zone: "A",
        status: "Online",
        tankCapacityL: 1000,     // 1000 L Household Tank
        initialLevelL: 600,      // 60% Storage
        flowRate: 8.2,           // Litres / min
        latestVolume: 0.41,      // Litres in last tick
        dailyConsumption: 150,   // L / day
        batteryLevel: "94%",
        signalStrength: "-68 dBm",
        lastPing: "Just now",
        dataSource: "Simulated IoT Telemetry",
        tankDescription: "Standard 1000L Polyethylene Rooftop Reservoir",
    },
    {
        deviceId: "ESP32-C1",
        householdId: "H021",
        zone: "C",
        status: "Online",
        tankCapacityL: 750,      // 750 L Compact Household Tank
        initialLevelL: 225,      // 30% Storage (Warning Reserve)
        flowRate: 14.5,          // Litres / min
        latestVolume: 0.85,      // Litres in last tick
        dailyConsumption: 220,   // L / day
        batteryLevel: "88%",
        signalStrength: "-72 dBm",
        lastPing: "2s ago",
        dataSource: "Simulated IoT Telemetry",
        tankDescription: "Compact 750L Underground Storage Cistern",
    },
];

/**
 * Returns IoT device info if household has a hardware device attached.
 */
export const getIotDeviceForHousehold = (householdId) => {
    return IOT_DEVICES.find((d) => d.householdId === householdId) || null;
};
