import { RefObject, useEffect, useRef, useState } from "react";
import { useDragLayer } from "react-dnd";

import { initialBoard } from "../../utils/initialBoard";
import Cell from "../Cell/Cell";
import "./Board.css";
import DragLayer from "../DragLayer";
import { ChessColor, ChessPieceType, PieceT } from "../../types/pieces";
import { MovesController } from "../../utils/chessMoves";
import Piece from "../Piece/Piece";
import { Move } from "../../types/moves";
import { useMoves } from "@/context/MovesContext";
import { generateNotationFromMove } from "@/utils/movesNotations";
import { useCellSelection } from "@/context/CellSelectionContext";
import useSound from "use-sound";

enum EndGame {
  WHITE_CM = "WHITE_CHECKMATED",
  BLACK_CM = "BLACK_CHECKMATED",
  DRAW = "DRAW",
}

const SOUND_VOLUME = 0.5;

export default function Board({
  convertCases,
  revertCases,
  freeMoves,
  endgameReached,
}: {
  convertCases: Map<string, number>;
  revertCases: Map<number, string>;
  freeMoves: boolean;
  endgameReached: (endGame: EndGame | null) => void;
}) {
  const promotionPieces: ChessPieceType[] = ["q", "r", "b", "n"];

  const {
    displayedMoveIndex,
    pieceMaps,
    addPieceMap,
    updatePieceMaps,
    firstDisplayedMoveIndex,
    addMovesNotation,
    lastMoveNotationCheckmate,
  } = useMoves();

  const { selectedCell, selectCell, deselectAllCells } = useCellSelection();

  const [playCoupVar1] = useSound("/sounds/coup-1.wav", {
    volume: SOUND_VOLUME,
  });
  const [playCoupVar2] = useSound("/sounds/coup-2.wav", {
    volume: SOUND_VOLUME,
  });
  const [playCoupVar3] = useSound("/sounds/coup-3.wav", {
    volume: SOUND_VOLUME,
  });
  const [playCoupVar4] = useSound("/sounds/coup-4.wav", {
    volume: SOUND_VOLUME,
  });
  const [playPrise] = useSound("/sounds/prise-1.wav", { volume: SOUND_VOLUME });
  const [playPriseCheck] = useSound("/sounds/prise-check.wav", {
    volume: SOUND_VOLUME,
  });
  const [playCheck] = useSound("/sounds/check.wav", { volume: SOUND_VOLUME });
  const [playCheckmate] = useSound("/sounds/checkmate.wav", {
    volume: SOUND_VOLUME,
  });
  const [playPriseCheckmate] = useSound("/sounds/checkmate-prise.wav", {
    volume: SOUND_VOLUME,
  });
  const [playCastle] = useSound("/sounds/castle.wav", { volume: SOUND_VOLUME });

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
  const [moveIndex, setMoveIndex] = useState(displayedMoveIndex);

  const castleStatus = useRef<{
    whiteCanOO: boolean;
    whiteCanOOO: boolean;
    blackCanOO: boolean;
    blackCanOOO: boolean;
  }>({
    whiteCanOO: true,
    whiteCanOOO: true,
    blackCanOO: true,
    blackCanOOO: true,
  });
  const enPassant = useRef("");
  const legitimateMoves: RefObject<Move[]> = useRef([]);
  const selectableCells: RefObject<string[]> = useRef([]);
  const endGame: RefObject<EndGame | null> = useRef(null);

  const { isDragging, item } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
  }));

  useEffect(() => {
    updatePieceMaps([pieceMap]);
    firstDisplayedMoveIndex();
  }, []);

  if (moveIndex !== displayedMoveIndex) {
    setMoveIndex(displayedMoveIndex);
    setPieceMap(() => {
      return pieceMaps[displayedMoveIndex];
    });
  }

  if (endGame.current === null && displayedMoveIndex === pieceMaps.length - 1) {
    if (freeMoves && playerToMove !== null) {
      setPlayerToMove(null);
    } else if (!freeMoves && playerToMove === null) {
      setPlayerToMove("w");
    }

    computeEndGame(playerToMove);

    let piece: PieceT | null = null;
    let pieceCoords = "";

    if (
      isDragging &&
      item &&
      selectedCell?.coords.join("") !== item.coords.join("")
    ) {
      setTimeout(() => selectCell(item.coords, true), 0);
    }

    if (selectedCell) {
      const pieceFromCoords = getPieceFromCoords(selectedCell.coords);
      if (pieceFromCoords) {
        piece = pieceFromCoords;
        pieceCoords =
          selectedCell.coords[0] + selectedCell.coords[1].toString();
      }
    }

    if (piece) {
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
            whiteCanOOO: castleStatus.current.whiteCanOOO,
            whiteCanOO: castleStatus.current.whiteCanOO,
            blackCanOOO: castleStatus.current.blackCanOOO,
            blackCanOO: castleStatus.current.blackCanOO,
            enPassant: enPassant.current,
            playerToMove,
          }
        );
        legitimateMoves.current = controller.availableMovesFrom(
          pieceValue,
          pieceColor,
          pieceCoords
        );
        selectableCells.current = legitimateMoves.current.map(
          (results) => results.to
        );
      }
    }

    if (!isDragging && !selectedCell) {
      legitimateMoves.current = [];
      selectableCells.current = [];
    }
  }

  function getPieceFromCoords(coords: [string, number]): PieceT | undefined {
    return pieceMap.get(coords[0] + coords[1]);
  }

  function areCoordsLegitMove(coords: [string, number], legitMoves: string[]) {
    return legitMoves.includes(coords[0] + coords[1]);
  }

  function updateMap(map: Map<string, PieceT>, move: Move) {
    deselectAllCells();
    setPieceMap(() => new Map(map));
    addPieceMap(map);
    setPlayerToMove((prev) => (prev === "w" ? "b" : "w"));
    const controller = new MovesController(
      map,
      convertCases,
      revertCases,
      true,
      {}
    );
    setWhiteCheck(controller.whiteCheck ?? false);
    setBlackCheck(controller.blackCheck ?? false);
    const notation = generateNotationFromMove(
      move,
      pieceMap,
      controller.whiteCheck || controller.blackCheck
    );
    addMovesNotation(notation);
    playSound(
      notation.includes("x"),
      notation.includes("O"),
      notation.includes("+"),
      notation.includes("#")
    );
  }

  function requestingMove(coords: [string, number]) {
    if (areCoordsLegitMove(coords, selectableCells.current)) {
      legitimateMoves.current.forEach((move) => {
        if (move.to !== coords[0] + coords[1]) {
          return;
        }
        const piece = getPieceFromCoords(
          move.from.split("") as [string, number]
        );
        if (piece?.type === "k") {
          if (piece.color === "w") {
            castleStatus.current.whiteCanOOO = false;
            castleStatus.current.whiteCanOO = false;
          } else {
            castleStatus.current.blackCanOOO = false;
            castleStatus.current.blackCanOO = false;
          }
        } else if (piece?.type === "r") {
          if (piece.color === "w") {
            castleStatus.current.whiteCanOOO =
              castleStatus.current.whiteCanOOO && move.from !== "a1";
            castleStatus.current.whiteCanOO =
              castleStatus.current.whiteCanOO && move.from !== "h1";
          } else {
            castleStatus.current.blackCanOOO =
              castleStatus.current.blackCanOOO && move.from !== "a8";
            castleStatus.current.blackCanOO =
              castleStatus.current.blackCanOO && move.from !== "h8";
          }
        }
        const mapToUpdate = new Map(pieceMap);
        enPassant.current = "";
        if (piece) {
          switch (move.ref) {
            case "": {
              // classique move
              mapToUpdate.set(move.to, {
                type: piece.type,
                color: piece.color,
              });
              mapToUpdate.delete(move.from);
              updateMap(mapToUpdate, move);
              break;
            }

            case "O-O": {
              const rookCase = piece.color === "w" ? "f1" : "f8";
              mapToUpdate.set(move.to, {
                type: piece.type,
                color: piece.color,
              });
              mapToUpdate.set(rookCase, { type: "r", color: piece.color });
              mapToUpdate.delete(move.from);
              mapToUpdate.delete(piece.color === "w" ? "h1" : "h8");
              updateMap(mapToUpdate, move);
              break;
            }
            case "O-O-O": {
              const rookCase = piece.color === "w" ? "d1" : "d8";
              mapToUpdate.set(move.to, {
                type: piece.type,
                color: piece.color,
              });
              mapToUpdate.set(rookCase, { type: "r", color: piece.color });
              mapToUpdate.delete(move.from);
              mapToUpdate.delete(piece.color === "w" ? "a1" : "a8");
              updateMap(mapToUpdate, move);
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
              enPassant.current =
                move.to[0] + (Number(move.from[1]) + Number(move.to[1])) / 2;
              updateMap(mapToUpdate, move);
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
              updateMap(mapToUpdate, move);
              break;
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
    updateMap(mapToUpdate, {
      from: promotionPick.fromCoords,
      to: promotionPick.toCoords,
      ref: "prom",
    });
    setPromotionPick(null);
  }

  function computeEndGame(playerToMove: ChessColor | null) {
    if (playerToMove === null) return;

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
        endGame.current = EndGame.WHITE_CM;
        setTimeout(() => lastMoveNotationCheckmate("b"), 0);
      } else if (playerToMove === "b" && blackCheck) {
        endGame.current = EndGame.BLACK_CM;
        setTimeout(() => lastMoveNotationCheckmate("w"), 0);
      } else {
        endGame.current = EndGame.DRAW;
      }
      setTimeout(() => endgameReached(endGame.current), 0);
      playSound(false, false, false, true);
    }
  }

  function playSound(
    prise: boolean,
    castle: boolean,
    check: boolean,
    checkmate: boolean
  ) {
    if (castle) {
      playCastle();
      return;
    }

    if (prise) {
      if (check) {
        playPriseCheck();
        return;
      }
      if (checkmate) {
        playPriseCheckmate();
        return;
      }
      playPrise();
      return;
    }
    if (check) {
      playCheck();
      return;
    }
    if (checkmate) {
      playCheckmate();
    }
    const randomVar = Math.floor(Math.random() * 4);
    switch (randomVar) {
      case 0:
        playCoupVar1();
        return;

      case 1:
        playCoupVar2();
        return;

      case 2:
        playCoupVar3();
        return;

      case 3:
        playCoupVar4();
        return;
    }
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
              <Piece
                key={pieceType}
                clicked={() => promotePieceTo(promotionPick, pieceType)}
                piece={{ type: pieceType, color: promotionPick.color }}
              ></Piece>
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
                  caseLabel={x === 1 ? y : ""}
                  secondCaseLabel={y === "h" ? x.toString() : ""}
                  dark={(i + j) % 2 === 1}
                  piece={getPieceFromCoords([y, x])}
                  legitMove={areCoordsLegitMove(
                    [y, x],
                    selectableCells.current
                  )}
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
                      ? endGame.current === EndGame.WHITE_CM
                      : endGame.current === EndGame.BLACK_CM)
                  }
                />
              ))
          )}
      </div>
      <DragLayer></DragLayer>
    </>
  );
}
