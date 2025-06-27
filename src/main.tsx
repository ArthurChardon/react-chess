import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { MovesProvider } from "./context/MovesContext.tsx";
import { UISettingsProvider } from "./context/UISettingsContext.tsx";
import { CellSelectionProvider } from "./context/CellSelectionContext.tsx";

createRoot(document.getElementById("root")!).render(
  <UISettingsProvider>
    <MovesProvider>
      <CellSelectionProvider>
        <App />
      </CellSelectionProvider>
    </MovesProvider>
  </UISettingsProvider>
);
