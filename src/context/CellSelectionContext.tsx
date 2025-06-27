import { createContext, ReactNode, useContext, useState } from "react";

interface CellSelectionContextType {
  selectedCell: {
    coords: [string, number];
    hasPiece: boolean;
  } | null;
  toggleCell: (coords: [string, number], hasPiece: boolean) => void;
  selectCell: (coords: [string, number], hasPiece: boolean) => void;
  deselectAllCells: () => void;
}

const CellSelectionContext = createContext<CellSelectionContextType | null>(
  null
);

export function CellSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedCell, setSelectedCell] = useState<{
    coords: [string, number];
    hasPiece: boolean;
  } | null>(null);

  const toggleCell = (coords: [string, number], hasPiece: boolean) => {
    if (selectedCell && selectedCell.coords.join("") === coords.join("")) {
      setSelectedCell(null);
      return;
    }
    setSelectedCell({
      coords,
      hasPiece,
    });
  };

  const selectCell = (coords: [string, number], hasPiece: boolean) => {
    setSelectedCell({
      coords,
      hasPiece,
    });
  };

  const deselectAllCells = () => {
    setSelectedCell(null);
  };

  const value = {
    selectedCell,
    toggleCell,
    selectCell,
    deselectAllCells,
  };

  return (
    <CellSelectionContext.Provider value={value}>
      {children}
    </CellSelectionContext.Provider>
  );
}

export function useCellSelection(): CellSelectionContextType {
  const context = useContext(CellSelectionContext);
  if (context === null) {
    throw new Error(
      "useCellSelection must be used within a CellSelectionProvider"
    );
  }
  return context;
}
