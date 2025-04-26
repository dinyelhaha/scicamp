const map = L.map("map").setView([14.5995, 120.9842], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
}).addTo(map);

let heatData = {};
let geoLayer = null;

const barangays = [
  { name: "Barangay 123", lat: 14.5995, lng: 120.9842 },
  { name: "Barangay 2", lat: 14.591, lng: 120.981 },
  // Add more if needed — names must match your GeoJSON properties
];

async function loadPredictions() {
  heatData = {};

  for (const brgy of barangays) {
    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brgy),
      });
      const result = await res.json();
      heatData[result.barangay] = { temperature: result.temperature };
    } catch (err) {
      console.error("Prediction error for", brgy.name, err);
    }
  }

  fetch("/src/data/manila-barangays.geojson")
    .then((res) => res.json())
    .then((geojson) => {
      if (geoLayer) map.removeLayer(geoLayer); // clear previous layer

      geoLayer = L.geoJSON(geojson, {
        style: (feature) => ({
          fillColor: getColor(feature.properties.name),
          weight: 1,
          opacity: 1,
          color: "#fff",
          fillOpacity: 0.7,
        }),
        onEachFeature: (feature, layer) => {
          const name = feature.properties.name;
          const temp = heatData[name]?.temperature ?? "N/A";
          layer.bindPopup(`<b>${name}</b><br>Temperature: ${temp}°C`);
        },
      }).addTo(map);
    });

  // Optional: update UI timestamp
  const updated = document.getElementById("last-updated");
  if (updated) {
    updated.textContent = "Last updated: " + new Date().toLocaleTimeString();
  }
}

function getColor(name) {
  const temp = heatData[name]?.temperature || 0;
  console.log("Color for", name, "Temp:", temp);
  return temp > 40
    ? "#800026"
    : temp > 37
    ? "#BD0026"
    : temp > 34
    ? "#E31A1C"
    : temp > 30
    ? "#FC4E2A"
    : "#FFEDA0";
}


function renderMap() {
  const coolingZones = [
    { name: "Rizal Park", lat: 14.5825, lng: 120.9781 },
    { name: "Intramuros Plaza", lat: 14.5906, lng: 120.9751 },
  ];

  for (const zone of coolingZones) {
    L.marker([zone.lat, zone.lng])
      .addTo(map)
      .bindPopup(`<b>${zone.name}</b><br>Cooling Zone`);
  }
}

document.getElementById("locationDropdown").addEventListener("change", (e) => {
  const [lat, lng] = e.target.value.split(",").map(Number);
  if (!isNaN(lat) && !isNaN(lng)) map.setView([lat, lng], 15);
});

renderMap();
loadPredictions();
setInterval(loadPredictions, 5 * 60 * 1000); // update every 5 minutes
