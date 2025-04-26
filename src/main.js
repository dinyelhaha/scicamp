const API_KEY = '9064c78348e84c3ee7c637affb5a7917'; // Replace this with your actual key
const map = L.map("map").setView([14.5995, 120.9842], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

let geojsonLayer;
let heatData = {};

function getColor(temp) {
  return temp > 40 ? '#800026' :
         temp > 37 ? '#BD0026' :
         temp > 34 ? '#E31A1C' :
         temp > 30 ? '#FC4E2A' : '#FFEDA0';
}

function getSafetyTip(temp) {
  if (temp > 37) return "Extreme heat: Stay indoors and hydrated!";
  if (temp > 34) return "Very hot: Limit sun exposure.";
  if (temp > 30) return "Warm: Keep cool and drink water.";
  return "Comfortable: Still stay hydrated!";
}

async function fetchTemperature(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  const data = await response.json();
  console.log("TEMP FETCHED:", lat, lon, data?.main?.temp); // Debug line
  return data?.main?.temp || 0;
}


async function loadGeoJSON() {
  const res = await fetch("/src/data/manila-barangays.geojson");
  const geojson = await res.json();

  for (const feature of geojson.features) {
    const coords = feature.geometry.coordinates[0];
    const lats = coords.map(c => c[1]);
    const lngs = coords.map(c => c[0]);
    const lat = lats.reduce((a, b) => a + b) / lats.length;
    const lng = lngs.reduce((a, b) => a + b) / lngs.length;

    const temp = await fetchTemperature(lat, lng);
    const name = feature.properties.name;
    heatData[name] = temp;
  }

  if (geojsonLayer) map.removeLayer(geojsonLayer);

  geojsonLayer = L.geoJSON(geojson, {
    style: feature => {
      const name = feature.properties.name;
      const temp = heatData[name] || 0;
      return {
        fillColor: getColor(temp),
        weight: 1,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7
      };
    },
    onEachFeature: (feature, layer) => {
      const name = feature.properties.name;
      const temp = heatData[name] || "N/A";
      console.log(`Setting popup for ${name}: ${temp}°C`);
      const tip = typeof temp === 'number' ? getSafetyTip(temp) : "";
      layer.bindPopup(`<b>${name}</b><br>Temperature: ${temp}°C<br>${tip}`);
    }    
  }).addTo(map);

  setupSearchControl(geojsonLayer);
}

function setupSearchControl(layer) {
  const searchControl = new L.Control.Search({
    layer: layer,
    propertyName: 'name',
    marker: false,
    moveToLocation: function(latlng, title, map) {
      map.flyTo(latlng, 15);
    }
  });

  map.addControl(searchControl);
}

loadGeoJSON();
