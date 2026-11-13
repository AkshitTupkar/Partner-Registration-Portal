import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@atomberg/ui/tokens.css";
import "@atomberg/ui/components.css";
import "./styles/theme.css";
import "./styles/app.css";
import { App } from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("index.html is missing <div id=\"root\">");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
