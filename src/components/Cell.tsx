import { useDrop } from "react-dnd";
import "./Cell.css";
import Piece from "./Piece";

export default function Cell({
  coords,
  dark,
  piece,
}: {
  coords?: [string, number];
  dark?: boolean;
  piece?: { value: string; color: string };
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
      {piece && <Piece piece={piece}></Piece>}
      {isOver && (
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
    </div>
  );
}
