import { useState } from "react";
import { useDragLayer } from "react-dnd";

import { initialBoard } from "../../utils/initialBoard";
import Cell from "../Cell/Cell";
import "./Board.css";
import DragLayer from "../DragLayer";
import { ChessColor, ChessPieceType, PieceT } from "../../types/pieces";
import { MovesController } from "../../utils/chessMoves";
import Piece from "../Piece/Piece";
import { Move } from "../../types/moves";

enum EndGame {
  WHITE_CM = "WHITE_CHECKMATE",
  BLACK_CM = "BLACK_CHECKMATE",
  DRAW = "DRAW",
}

let draggingPositionComputed = false;
let legitimateMoves: Move[] = [];
let selectableCells: string[] = [];
let whiteCanOOO = true;
let whiteCanOO = true;
let blackCanOOO = true;
let blackCanOO = true;
let enPassant = "";
let endGame: EndGame | null = null;

export default function Board({
  convertCases,
  revertCases,
  freeMoves,
  endgameReached,
}: {
  convertCases: Map<string, number>;
  revertCases: Map<number, string>;
  freeMoves: boolean;
  endgameReached: (endGame: EndGame) => void;
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

  const [whiteCheck, setWhiteCheck] = useState(false);
  const [blackCheck, setBlackCheck] = useState(false);

  const [promotionPick, setPromotionPick] = useState<{
    fromCoords: string;
    toCoords: string;
    color: ChessColor;
  } | null>(null);

  const [playerToMove, setPlayerToMove] = useState<ChessColor | null>(() =>
    freeMoves ? null : "w"
  );

  const { isDragging, item } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
  }));

  if (endGame === null) {
    if (freeMoves && playerToMove !== null) {
      setPlayerToMove(null);
    } else if (!freeMoves && playerToMove === null) {
      setPlayerToMove("w");
    }

    if (playerToMove !== null) {
      const controller = new MovesController(
        pieceMap,
        convertCases,
        revertCases,
        true,
        {}
      );

      const movesCount = controller.availableMovesCount(playerToMove);
      if (movesCount === 0) {
        if (playerToMove === "w" && whiteCheck) {
          endGame = EndGame.WHITE_CM;
        } else if (playerToMove === "b" && blackCheck) {
          endGame = EndGame.BLACK_CM;
        } else {
          endGame = EndGame.DRAW;
        }
        endgameReached(endGame);
      }
    }

    if (isDragging && !draggingPositionComputed) {
      const piece = item.piece as PieceT;
      const pieceCoords = item.coords.join("");
      const pieceColor = piece.color;
      const pieceValue = piece.type;
      if (playerToMove === null || pieceColor === playerToMove) {
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
            playerToMove,
          }
        );
        draggingPositionComputed = true;
        legitimateMoves = controller.availableMovesFrom(
          pieceValue,
          pieceColor,
          pieceCoords
        );
        selectableCells = legitimateMoves.map((results) => results.to);
      }
    }

    if (!isDragging) {
      draggingPositionComputed = false;
      legitimateMoves = [];
      selectableCells = [];
    }
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
        if (move.to !== coords[0] + coords[1]) {
          return;
        }
        const piece = getPieceFromCoords(
          move.from.split("") as [string, number]
        );
        if (piece?.type === "k") {
          if (piece.color === "w") {
            whiteCanOOO = false;
            whiteCanOO = false;
          } else {
            blackCanOOO = false;
            blackCanOO = false;
          }
        } else if (piece?.type === "r") {
          if (piece.color === "w") {
            whiteCanOOO = whiteCanOOO && move.from !== "a1";
            whiteCanOO = whiteCanOO && move.from !== "h1";
          } else {
            blackCanOOO = blackCanOOO && move.from !== "a8";
            blackCanOO = blackCanOO && move.from !== "h8";
          }
        }
        const mapToUpdate = new Map(pieceMap);
        enPassant = "";
        if (piece) {
          switch (move.ref) {
            case "": {
              // Default move
              mapToUpdate.set(move.to, {
                type: piece.type,
                color: piece.color,
              });
              mapToUpdate.delete(move.from);
              setPieceMap(() => new Map(mapToUpdate));
              break;
            }

            case "OO": {
              const rookCase = piece.color === "w" ? "f1" : "f8";
              mapToUpdate.set(move.to, {
                type: piece.type,
                color: piece.color,
              });
              mapToUpdate.set(rookCase, { type: "r", color: piece.color });
              mapToUpdate.delete(move.from);
              mapToUpdate.delete(piece.color === "w" ? "h1" : "h8");
              setPieceMap(() => new Map(mapToUpdate));
              break;
            }
            case "OOO": {
              const rookCase = piece.color === "w" ? "d1" : "d8";
              mapToUpdate.set(move.to, {
                type: piece.type,
                color: piece.color,
              });
              mapToUpdate.set(rookCase, { type: "r", color: piece.color });
              mapToUpdate.delete(move.from);
              mapToUpdate.delete(piece.color === "w" ? "a1" : "a8");
              setPieceMap(() => new Map(mapToUpdate));
              break;
            }

            case "prom": {
              // promote a pawn
              setPromotionPick({
                color: piece.color,
                fromCoords: move.from,
                toCoords: move.to,
              });
              break;
            }

            case "2pawn": {
              mapToUpdate.set(move.to, {
                type: piece.type,
                color: piece.color,
              });
              mapToUpdate.delete(move.from);
              enPassant =
                move.to[0] + (Number(move.from[1]) + Number(move.from[1])) / 2;
              setPieceMap(() => new Map(mapToUpdate));
              break;
            }

            case "ep": {
              mapToUpdate.set(move.to, {
                type: piece.type,
                color: piece.color,
              });
              mapToUpdate.delete(move.from);
              const posPawn2 = piece.color === "w" ? -1 : 1;
              mapToUpdate.delete(move.to[0] + (Number(move.to[1]) + posPawn2));
              setPieceMap(() => new Map(mapToUpdate));
              break;
            }
          }
          setPlayerToMove((prev) => (prev === "w" ? "b" : "w"));
          const controller = new MovesController(
            mapToUpdate,
            convertCases,
            revertCases,
            true,
            {}
          );
          setWhiteCheck(controller.whiteCheck ?? false);
          setBlackCheck(controller.blackCheck ?? false);
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
      <div
        className={
          "board" +
          (playerToMove === "w"
            ? " white-to-move"
            : playerToMove === "b"
              ? " black-to-move"
              : "")
        }
      >
        {promotionPick && (
          <div className="promotion-pick">
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
                  isChecked={
                    getPieceFromCoords([y, x])?.type === "k" &&
                    (getPieceFromCoords([y, x])?.color === "w"
                      ? whiteCheck
                      : blackCheck)
                  }
                  isCheckmated={
                    getPieceFromCoords([y, x])?.type === "k" &&
                    (getPieceFromCoords([y, x])?.color === "w"
                      ? endGame === EndGame.WHITE_CM
                      : endGame === EndGame.BLACK_CM)
                  }
                />
              ))
          )}
      </div>
      <DragLayer></DragLayer>
    </>
  );
}
