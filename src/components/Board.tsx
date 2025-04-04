import { useState } from "react";
import { useDragLayer } from "react-dnd";

import { initialBoard } from "../utils/initialBoard";
import Cell from "./Cell";
import "./Board.css";
import DragLayer from "./DragLayer";
import { PieceT } from "../types/pieces";
import { MovesController } from "../utils/chessMoves";

let draggingPositionComputed = false;
let legitimateMoves: string[] = [];

export default function Board({ convertCases, revertCases }: { convertCases: Map<string, number>, revertCases: Map<number, string> }) {
  const [pieceMap, setPieceMap] = useState(
    new Map<string, PieceT>(
      initialBoard.map((piece) => [
        piece.coords,
        { type: piece.type, color: piece.color },
      ]),
    ),
  );

  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));


  if (isDragging && !draggingPositionComputed) {
    const piece = item.piece;
    const pieceCoords = item.coords.join("");
    const pieceColor = piece.color;
    const pieceValue = piece.type;
    const controller = new MovesController(pieceMap, convertCases, revertCases);
    draggingPositionComputed = true;
    const movesResults = controller.availableMovesFrom(pieceValue, pieceColor, pieceCoords);
    console.log(movesResults)
    legitimateMoves = movesResults.map((results) => results[1]);

  }

  if (!isDragging) {
    draggingPositionComputed = false;
    legitimateMoves = [];
  }

  function updateMap(key: string, value: string, color: string) {
    setPieceMap((map) => new Map(map.set(key, { value, color })));
  }

  function getPieceFromCoords(
    coords: [string, number],
  ): PieceT | undefined {
    return pieceMap.get(coords[0] + coords[1]);
  }

  function areCoordsLegitMove(coords: [string, number], legitMoves: string[]) {
    return legitMoves.includes(coords[0] + coords[1]);
  }

  return (
    <>
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
                  legitMove={areCoordsLegitMove([y, x], legitimateMoves)}
                />
              )),
          )}
      </div>
      <DragLayer></DragLayer>
    </>
  );
}
