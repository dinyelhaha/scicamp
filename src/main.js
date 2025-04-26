const API_URL = 'http://127.0.0.1:8000/predict'; // URL to your FastAPI backend

let map = L.map('map').setView([14.5995, 120.9842], 13); // Center on Manila

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Legend for temperature colors
const legend = L.control({ position: 'bottomleft' });
legend.onAdd = function() {
  const div = L.DomUtil.create('div', 'info legend');
  const grades = [0, 30, 34, 37, 40];
  const labels = [];

  // Create labels for each range
  for (let i = 0; i < grades.length - 1; i++) {
    const color = getColor(grades[i] + 1);
    labels.push('<i style="background:' + color + '"></i> ' + grades[i] + '&ndash;' + grades[i + 1]);
  }
  labels.push('<i style="background:' + getColor(grades[grades.length - 1] + 1) + '"></i> ' + grades[grades.length - 1] + '+');

  div.innerHTML = '<h4>Temperature (°C)</h4>' + labels.join('<br>');
  return div;
};
legend.addTo(map);


// Function to get temperature color based on the temperature
function getColor(temp) {
  return temp > 40 ? '#800026' :
         temp > 37 ? '#BD0026' :
         temp > 34 ? '#E31A1C' :
         temp > 30 ? '#FC4E2A' : '#FFEDA0';
}

// Fetch temperature for each barangay from the backend
function fetchTemperature(name, lat, lon, callback) {
  fetch(API_URL, {
    method: 'POST',  // Make sure this is POST
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, lat, lng: lon })
  })
  .then(response => response.json())
  .then(data => {
    callback(data.temperature);
  })
  .catch(error => console.error('Error fetching temperature:', error));
}

// Function to update the map with the barangay data
function updateMap() {
  fetch('/src/data/manila-barangays.geojson')
    .then(response => response.json())
    .then(geojsonData => {
      // Loop through each feature in the GeoJSON data
      geojsonData.features.forEach(feature => {
        const { name } = feature.properties;
        const [lon, lat] = feature.geometry.coordinates[0][0];

        // Fetch temperature for the barangay and update the style accordingly
        fetchTemperature(name, lat, lon, temp => {
          L.geoJSON(feature, {
            style: {
              fillColor: getColor(temp),
              weight: 1,
              opacity: 1,
              color: 'white',
              fillOpacity: 0.7
            },
            onEachFeature: function(feature, layer) {
              layer.bindPopup(`<b>${feature.properties.name}</b><br>Temperature: ${temp}°C`);
            }
          }).addTo(map);
        });
      });
    })
    .catch(error => console.error('Error loading GeoJSON:', error));
}

updateMap();
