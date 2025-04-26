import React from "react";
import MapView from "./components/MapView";
import Chatbot from "./components/Chatbot";
import "./styles/main.css";

export default function App() {
  return (
    <div className="app-container">
      <MapView />
      <Chatbot />
    </div>
  );
}
