import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { initialBoard } from "../utils/initialBoard";
import Cell from "./Cell";
import "./Board.css";
import DragLayer from "./DragLayer";
import { TouchBackend } from "react-dnd-touch-backend";

export default function Board() {
  const [pieceMap, setPieceMap] = useState(
    new Map<string, { value: string; color: string }>(
      initialBoard.map((piece) => [
        piece.coords,
        { value: piece.value, color: piece.color },
      ])
    )
  );

  const [draggedPiece, setDraggedPiece] = useState<any>({left: 0, top: 0});

  function updateMap(key: string, value: string, color: string) {
    setPieceMap((map) => new Map(map.set(key, { value, color })));
  }

  function getPieceFromCoords(
    coords: [string, number]
  ): { value: string; color: string } | undefined {
    return pieceMap.get(coords[0] + coords[1]);
  }

  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <div className="board">
        {[...Array(8)]
          .map((_, i) => 8 - i)
          .map((x, i) =>
            [...Array(8)]
              .map((_, j) => String.fromCharCode(97 + j))
              .map((y, j) => (
                <Cell
                  key={x.toString() + "-" + y}
                  coords={[y, x]}
                  dark={(i + j) % 2 === 1}
                  piece={getPieceFromCoords([y, x])}
                />
              ))
          )}
      </div>
      <DragLayer></DragLayer>
    </DndProvider>
  );
}
