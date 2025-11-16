/* Static data for CityPulse */

// Dashboard initial values
const dashboardData = {
  temperature: 32,
  feelsLike: 33,
  aqi: 82,
  traffic: 60
};

// Alerts (static realistic examples)
const alertsData = [
  { id: "a1", type: "traffic", priority: "high", message: "Heavy traffic on Central Avenue between 8:00–9:30.", time: "2025-11-15T10:02:00" },
  { id: "a2", type: "weather", priority: "medium", message: "Light rain expected this evening across northern sectors.", time: "2025-11-15T09:40:00" },
  { id: "a3", type: "health", priority: "low", message: "Free health camp at Metro Hospital on Sunday, 9am–2pm.", time: "2025-11-14T18:10:00" },
  { id: "a4", type: "public", priority: "medium", message: "Planned water supply maintenance in Sector 14 on Nov 18 (10:00–14:00).", time: "2025-11-14T12:25:00" }
];

// Map zones (used by hotspots)
const mapZones = {
  park: {
    id: "park",
    name: "Lodhi Park",
    status: "Open",
    contact: "011-223344",
    description: "Public park with walking trails and lake."
  },
  hospital: {
    id: "hospital",
    name: "Central Hospital",
    status: "24/7",
    contact: "102",
    description: "Major healthcare facility with emergency services."
  },
  mall: {
    id: "mall",
    name: "Riverfront Mall",
    status: "Open",
    contact: "011-998877",
    description: "Retail and entertainment complex."
  },
  school: {
    id: "school",
    name: "Central Public School",
    status: "Closed (Sunday)",
    contact: "011-445566",
    description: "Primary and secondary education complex."
  },
  traffic: {
    id: "traffic",
    name: "Traffic Hub - Central Avenue",
    status: "Moderate",
    contact: "N/A",
    description: "Traffic hotspot - congestion monitoring area."
  }
};
