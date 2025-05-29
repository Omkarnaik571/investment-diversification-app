import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Import your global CSS
import App from "./App"; // Import your main App component

// Create a root to render your React application
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
