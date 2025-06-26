import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { MovesProvider } from "./context/MovesContext.tsx";

createRoot(document.getElementById("root")!).render(
  <MovesProvider>
    <App />
  </MovesProvider>
);
