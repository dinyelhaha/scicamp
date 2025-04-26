fetch('data/heat-data.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(point => {
      L.marker([point.lat, point.lng]).addTo(map)
        .bindPopup(`<h3>${point.name}</h3><p>${point.description}</p>`);
    });
  });
