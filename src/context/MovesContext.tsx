import { PieceT } from "@/types/pieces";
import { createContext, ReactNode, useContext, useState } from "react";

interface MovesContextType {
  pieceMaps: Map<string, PieceT>[];
  displayedMoveIndex: number;
  updatePieceMaps: (newPieceMaps: Map<string, PieceT>[]) => void;
  addPieceMap: (newPieceMap: Map<string, PieceT>) => void;
  updateDisplayedMoveIndex: (newIndex: number) => void;
  firstDisplayedMoveIndex: () => void;
  prevDisplayedMoveIndex: () => void;
  nextDisplayedMoveIndex: () => void;
  lastDisplayedMoveIndex: () => void;
}

const MovesContext = createContext<MovesContextType | null>(null);

export function MovesProvider({ children }: { children: ReactNode }) {
  const [pieceMaps, setPieceMaps] = useState<Map<string, PieceT>[]>([]);
  const [displayedMoveIndex, setDisplayedMoveIndex] = useState<number>(0);

  const updatePieceMaps = (newPieceMaps: Map<string, PieceT>[]) => {
    setPieceMaps(newPieceMaps);
  };

  const addPieceMap = (newPieceMap: Map<string, PieceT>) => {
    setPieceMaps((pieceMaps) => [...pieceMaps, newPieceMap]);
    setDisplayedMoveIndex(pieceMaps.length);
  };

  const updateDisplayedMoveIndex = (newIndex: number) => {
    setDisplayedMoveIndex(newIndex);
  };

  const firstDisplayedMoveIndex = () => {
    setDisplayedMoveIndex(0);
  };

  const prevDisplayedMoveIndex = () => {
    setDisplayedMoveIndex((displayedMoveIndex) => displayedMoveIndex - 1);
  };

  const nextDisplayedMoveIndex = () => {
    setDisplayedMoveIndex((displayedMoveIndex) => displayedMoveIndex + 1);
  };

  const lastDisplayedMoveIndex = () => {
    setDisplayedMoveIndex(pieceMaps.length - 1);
  };

  const value = {
    pieceMaps,
    displayedMoveIndex,
    updatePieceMaps,
    addPieceMap,
    updateDisplayedMoveIndex,
    firstDisplayedMoveIndex,
    prevDisplayedMoveIndex,
    nextDisplayedMoveIndex,
    lastDisplayedMoveIndex,
  };

  return (
    <MovesContext.Provider value={value}>{children}</MovesContext.Provider>
  );
}

export function useMoves(): MovesContextType {
  const context = useContext(MovesContext);
  if (context === null) {
    throw new Error("useMoves must be used within a MovesProvider");
  }
  return context;
}
