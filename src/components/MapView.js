import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import geoData from "../data/manila-barangays.geojson";
import heatData from "../data/heat-data.json";

export default function MapView() {
  useEffect(() => {
    const map = L.map("map").setView([14.5995, 120.9842], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    L.geoJSON(geoData, {
      style: feature => ({
        fillColor: getColor(feature.properties.name),
        weight: 1,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7
      }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`Barangay: ${feature.properties.name}`);
      }
    }).addTo(map);

    function getColor(barangayName) {
      const value = heatData[barangayName] || 0;
      return value > 40 ? "#800026" :
             value > 37 ? "#BD0026" :
             value > 34 ? "#E31A1C" :
             value > 30 ? "#FC4E2A" :
                          "#FFEDA0";
    }
  }, []);

  return <div id="map" style={{ height: "600px", width: "100%" }}></div>;
}
