import { useDrop } from "react-dnd";

import "./Cell.css";
import Piece from "./Piece";
import { PieceT } from "../types/pieces";

export default function Cell({
  coords,
  dark,
  piece,
  legitMove,
}: {
  coords?: [string, number];
  dark?: boolean;
  piece?: PieceT;
  legitMove: boolean;
}) {
  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: "piece",
      drop: () => movePiece(coords),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [coords]
  );

  function movePiece(newCoords: [string, number] | undefined) {
    console.log("Move piece to: ", newCoords);

  }

  return (
    <div
      className={"cell " + (dark ? "dark-cell" : "light-cell")}
      ref={dropRef}
    >
      <div
        style={{ display: "none", position: "absolute", pointerEvents: "none" }}
      >
        {coords}
      </div>
      {piece && <Piece piece={piece} coords={coords}></Piece>}
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
      {!isOver && legitMove && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            height: "25%",
            width: "25%",
            zIndex: 1,
            opacity: 0.35,
            backgroundColor: "grey",
            borderRadius: "50%",
          }}
        />
      )}
    </div>
  );
}
