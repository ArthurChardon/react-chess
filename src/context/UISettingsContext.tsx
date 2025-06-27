import { createContext, ReactNode, useContext, useState } from "react";

interface UISettingsContextType {
  caseLabels: boolean;
  activateCaseLabels: () => void;
  deactivateCaseLabels: () => void;
}

const UISettingsContext = createContext<UISettingsContextType | null>(null);

export function UISettingsProvider({ children }: { children: ReactNode }) {
  const [caseLabels, setCaseLabels] = useState<boolean>(true);

  const activateCaseLabels = () => {
    setCaseLabels(true);
  };

  const deactivateCaseLabels = () => {
    setCaseLabels(false);
  };

  const value = {
    caseLabels,
    activateCaseLabels,
    deactivateCaseLabels,
  };

  return (
    <UISettingsContext.Provider value={value}>
      {children}
    </UISettingsContext.Provider>
  );
}

export function useUISettings(): UISettingsContextType {
  const context = useContext(UISettingsContext);
  if (context === null) {
    throw new Error("useUISettings must be used within a UISettingsProvider");
  }
  return context;
}
