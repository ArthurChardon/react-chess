import { useDrop } from "react-dnd";

import "./Cell.css";
import Piece from "../Piece/Piece";
import { PieceT } from "../../types/pieces";
import { useUISettings } from "@/context/UISettingsContext";
import { useRef } from "react";
import { useCellSelection } from "@/context/CellSelectionContext";

export default function Cell({
  coords,
  caseLabel,
  secondCaseLabel,
  dark,
  piece,
  legitMove,
  requestMove,
  isChecked = false,
  isCheckmated = false,
}: {
  coords: [string, number];
  caseLabel?: string;
  secondCaseLabel?: string;
  dark?: boolean;
  piece?: PieceT;
  legitMove: boolean;
  requestMove: (coords: [string, number]) => void;
  isChecked?: boolean;
  isCheckmated?: boolean;
}) {
  const { caseLabels: caseLabels } = useUISettings();
  const { selectedCell, toggleCell } = useCellSelection();

  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: "piece",
      drop: () => requestingMoveToSelf(coords),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [coords]
  );

  const cellButton = useRef<HTMLButtonElement>(null);

  function requestingMoveToSelf(newCoords: [string, number]) {
    requestMove(newCoords);
    cellButton.current?.focus();
    cellButton.current?.blur();
  }

  function pieceClicked() {
    cellClicked();
    cellButton.current?.focus();
  }

  function cellClicked() {
    if (legitMove) {
      requestMove(coords);
      return;
    }
    toggleCell(coords, !!piece);
  }

  if (!selectedCell || selectedCell.coords.join("") != coords.join("")) {
    cellButton.current?.blur();
  }

  return (
    <div
      className={
        "cell " +
        (dark ? "dark-cell" : "light-cell") +
        (isChecked && !isCheckmated ? " checked" : "") +
        (isCheckmated ? " mated" : "")
      }
      ref={dropRef}
    >
      <div
        className="case-label"
        style={{
          display: caseLabels ? "block" : "none",
          bottom: "0.2em",
        }}
      >
        {caseLabel}
      </div>
      <div
        className="case-label"
        style={{
          display: caseLabels ? "block" : "none",
          top: "0.2em",
        }}
      >
        {secondCaseLabel}
      </div>
      <button
        onClick={() => cellClicked()}
        className="cell-button"
        ref={cellButton}
      ></button>
      {piece && (
        <Piece
          clicked={() => pieceClicked()}
          piece={piece}
          coords={coords}
          draggable={true}
        ></Piece>
      )}
      {isOver && legitMove && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            zIndex: 1,
            opacity: 0.5,
            backgroundColor: "yellow",
          }}
        />
      )}
      {legitMove && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            height: "25%",
            width: "25%",
            zIndex: 20,
            opacity: 0.35,
            pointerEvents: "none",
            backgroundColor: "grey",
            borderRadius: "50%",
          }}
        />
      )}
    </div>
  );
}
