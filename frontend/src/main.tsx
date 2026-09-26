import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Remove any dark-mode state left by an older deployment.
document.documentElement.classList.remove("dark");
localStorage.removeItem("bf_theme");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
