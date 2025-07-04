import type { CSSProperties } from "react";
import { useEffect } from "react";
import "./Piece.css";

import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { PieceT } from "../../types/pieces";

function getStyles(isDragging: boolean): CSSProperties {
  return {
    opacity: isDragging ? 0.5 : 1,
  };
}

export default function Piece({
  piece,
  coords,
  draggable = false,
  clicked,
}: {
  piece?: PieceT;
  coords?: [string, number];
  draggable?: boolean;
  clicked?: () => void;
}) {
  const [{ isDragging }, dragRef, preview] = useDrag(
    () => ({
      type: "piece",
      item: { piece, coords },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [piece]
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  function pieceToSymbol(piece: PieceT | undefined): string {
    if (!piece) return "";
    return piece.color + piece.type.toUpperCase();
  }
  const srcImage = "svg/" + pieceToSymbol(piece) + ".svg";

  return (
    <>
      <button
        className="z-10"
        //@ts-expect-error
        ref={draggable ? dragRef : null}
        style={getStyles(isDragging)}
        onClick={() => (clicked ? clicked() : null)}
      >
        <img
          className={"piece-cell " + (isDragging ? "dragged" : "")}
          src={srcImage}
        />
      </button>
    </>
  );
}
