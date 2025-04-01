import { useState } from "react";

import Cell from "./Cell";
import "./Board.css";

const initialBoard: { coords: string; value: string; color: string }[] = [
  { coords: "a1", value: "r", color: "white" },
  { coords: "b1", value: "n", color: "white" },
  { coords: "c1", value: "b", color: "white" },
  { coords: "d1", value: "q", color: "white" },
  { coords: "e1", value: "k", color: "white" },
  { coords: "f1", value: "b", color: "white" },
  { coords: "g1", value: "n", color: "white" },
  { coords: "h1", value: "r", color: "white" },

  { coords: "a8", value: "r", color: "black" },
  { coords: "b8", value: "n", color: "black" },
  { coords: "c8", value: "b", color: "black" },
  { coords: "d8", value: "q", color: "black" },
  { coords: "e8", value: "k", color: "black" },
  { coords: "f8", value: "b", color: "black" },
  { coords: "g8", value: "n", color: "black" },
  { coords: "h8", value: "r", color: "black" },
]
  .concat(
    [...Array(8)].map((_, i) => ({
      coords: String.fromCharCode(97 + i) + "2",
      value: "p",
      color: "white",
    }))
  )
  .concat(
    [...Array(8)].map((_, i) => ({
      coords: String.fromCharCode(97 + i) + "7",
      value: "p",
      color: "black",
    }))
  );

export default function Board() {
  const [pieceMap, setPieceMap] = useState(
    new Map<string, { value: string; color: string }>(
      initialBoard.map((piece) => [
        piece.coords,
        { value: piece.value, color: piece.color },
      ])
    )
  );

  function updateMap(key: string, value: string, color: string) {
    setPieceMap((map) => new Map(map.set(key, { value, color })));
  }

  function getPieceFromCoords(
    coords: [string, number]
  ): { value: string; color: string } | undefined {
    return pieceMap.get(coords[0] + coords[1]);
  }

  return (
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
  );
}
