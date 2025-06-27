import { createContext, ReactNode, useContext, useState } from "react";

interface UISettingsContextType {
  caseLabels: boolean;
  activateCaseLabels: () => void;
  deactivateCaseLabels: () => void;
  availableMoves: boolean;
  activateAvailableMoves: () => void;
  deactivateAvailableMoves: () => void;
  soundEffects: boolean;
  activateSoundEffects: () => void;
  deactivateSoundEffects: () => void;
}

const UISettingsContext = createContext<UISettingsContextType | null>(null);

export function UISettingsProvider({ children }: { children: ReactNode }) {
  const [caseLabels, setCaseLabels] = useState<boolean>(true);
  const [availableMoves, setAvailableMoves] = useState<boolean>(true);
  const [soundEffects, setSoundEffects] = useState<boolean>(true);

  const activateCaseLabels = () => {
    setCaseLabels(true);
  };

  const deactivateCaseLabels = () => {
    setCaseLabels(false);
  };

  const activateAvailableMoves = () => {
    setAvailableMoves(true);
  };

  const deactivateAvailableMoves = () => {
    setAvailableMoves(false);
  };

  const activateSoundEffects = () => {
    setSoundEffects(true);
  };

  const deactivateSoundEffects = () => {
    setSoundEffects(false);
  };

  const value = {
    caseLabels,
    activateCaseLabels,
    deactivateCaseLabels,
    availableMoves,
    activateAvailableMoves,
    deactivateAvailableMoves,
    soundEffects,
    activateSoundEffects,
    deactivateSoundEffects,
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
