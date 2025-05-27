import { useState } from "react";
import { useDragLayer } from "react-dnd";

import { initialBoard } from "../../utils/initialBoard";
import Cell from "../Cell/Cell";
import "./Board.css";
import DragLayer from "../DragLayer";
import { ChessColor, ChessPieceType, PieceT } from "../../types/pieces";
import { MovesController } from "../../utils/chessMoves";
import Piece from "../Piece/Piece";

let draggingPositionComputed = false;
let legitimateMoves: [string, string, string][] = [];
let selectableCells: string[] = [];
let whiteCheck = false;
let blackCheck = false;
let whiteCanOOO = true;
let whiteCanOO = true;
let blackCanOOO = true;
let blackCanOO = true;
let enPassant = "";

export default function Board({
  convertCases,
  revertCases,
}: {
  convertCases: Map<string, number>;
  revertCases: Map<number, string>;
}) {
  const promotionPieces: ChessPieceType[] = ["q", "r", "b", "n"];
  const [pieceMap, setPieceMap] = useState(
    new Map<string, PieceT>(
      initialBoard.map((piece) => [
        piece.coords,
        { type: piece.type, color: piece.color },
      ])
    )
  );

  const [promotionPick, setPromotionPick] = useState<{
    fromCoords: string;
    toCoords: string;
    color: ChessColor;
  } | null>(null);

  const { isDragging, item } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
  }));

  if (isDragging && !draggingPositionComputed) {
    const piece = item.piece as PieceT;
    const pieceCoords = item.coords.join("");
    const pieceColor = piece.color;
    const pieceValue = piece.type;
    const controller = new MovesController(
      pieceMap,
      convertCases,
      revertCases,
      true,
      {
        whiteCheck,
        blackCheck,
        whiteCanOOO,
        whiteCanOO,
        blackCanOOO,
        blackCanOO,
        enPassant,
      }
    );
    draggingPositionComputed = true;
    legitimateMoves = controller.availableMovesFrom(
      pieceValue,
      pieceColor,
      pieceCoords
    );
    //console.log(legitimateMoves)
    selectableCells = legitimateMoves.map((results) => results[1]);
  }

  if (!isDragging) {
    draggingPositionComputed = false;
    legitimateMoves = [];
    selectableCells = [];
  }

  function getPieceFromCoords(coords: [string, number]): PieceT | undefined {
    return pieceMap.get(coords[0] + coords[1]);
  }

  function areCoordsLegitMove(coords: [string, number], legitMoves: string[]) {
    return legitMoves.includes(coords[0] + coords[1]);
  }

  function requestingMove(coords: [string, number]) {
    if (areCoordsLegitMove(coords, selectableCells)) {
      legitimateMoves.forEach((move) => {
        if (move[1] === coords[0] + coords[1]) {
          const piece = getPieceFromCoords(
            move[0].split("") as [string, number]
          );
          const mapToUpdate = new Map(pieceMap);
          enPassant = "";
          if (piece) {
            switch (move[2]) {
              case "": {
                // Default move
                mapToUpdate.set(move[1], {
                  type: piece.type,
                  color: piece.color,
                });
                mapToUpdate.delete(move[0]);
                setPieceMap(() => new Map(mapToUpdate));
                break;
              }

              case "OO": {
                const rookCase = piece.color === "w" ? "f1" : "f8";
                mapToUpdate.set(move[1], {
                  type: piece.type,
                  color: piece.color,
                });
                mapToUpdate.set(rookCase, { type: "r", color: piece.color });
                mapToUpdate.delete(move[0]);
                mapToUpdate.delete(piece.color === "w" ? "h1" : "h8");
                setPieceMap(() => new Map(mapToUpdate));
                break;
              }
              case "OOO": {
                const rookCase = piece.color === "w" ? "d1" : "d8";
                mapToUpdate.set(move[1], {
                  type: piece.type,
                  color: piece.color,
                });
                mapToUpdate.set(rookCase, { type: "r", color: piece.color });
                mapToUpdate.delete(move[0]);
                mapToUpdate.delete(piece.color === "w" ? "a1" : "a8");
                setPieceMap(() => new Map(mapToUpdate));
                break;
              }

              case "prom": {
                // promote a pawn
                setPromotionPick({
                  color: piece.color,
                  fromCoords: move[0],
                  toCoords: move[1],
                });
                break;
              }

              case "2pawn": {
                mapToUpdate.set(move[1], {
                  type: piece.type,
                  color: piece.color,
                });
                mapToUpdate.delete(move[0]);
                enPassant =
                  move[1][0] + (Number(move[0][1]) + Number(move[1][1])) / 2;
                setPieceMap(() => new Map(mapToUpdate));
                break;
              }

              case "ep": {
                mapToUpdate.set(move[1], {
                  type: piece.type,
                  color: piece.color,
                });
                mapToUpdate.delete(move[0]);
                const posPawn2 = piece.color === "w" ? -1 : 1;
                mapToUpdate.delete(
                  move[1][0] + (Number(move[1][1]) + posPawn2)
                );
                setPieceMap(() => new Map(mapToUpdate));
                break;
              }
            }
          }
        }
      });
    }
  }

  function promotePieceTo(
    promotionPick: {
      fromCoords: string;
      toCoords: string;
      color: ChessColor;
    },
    pieceType: ChessPieceType
  ) {
    const mapToUpdate = new Map(pieceMap);
    mapToUpdate.delete(promotionPick!.fromCoords);
    mapToUpdate.set(promotionPick.toCoords, {
      type: pieceType,
      color: promotionPick!.color,
    });
    setPieceMap(() => new Map(mapToUpdate));
    setPromotionPick(null);
  }

  return (
    <>
      <div className="board">
        {promotionPick && (
          <div className="promotionPick">
            {promotionPieces.map((pieceType) => (
              <button
                className="functional-button"
                onClick={() => {
                  promotePieceTo(promotionPick, pieceType);
                }}
              >
                <Piece
                  piece={{ type: pieceType, color: promotionPick.color }}
                ></Piece>
              </button>
            ))}
          </div>
        )}
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
                  legitMove={areCoordsLegitMove([y, x], selectableCells)}
                  requestMove={(coords: [string, number]) => {
                    requestingMove(coords);
                  }}
                />
              ))
          )}
      </div>
      <DragLayer></DragLayer>
    </>
  );
}
