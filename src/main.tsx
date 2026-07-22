import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Root from "./Root";
import "./styles.css";
import "./v2.css";
import "./v2-intake.css";
import "./v2-redesign.css";
import "./v3.css";
import "./v31.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
