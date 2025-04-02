import type { CSSProperties } from "react";
import { useEffect } from "react";
import "./Piece.css";

import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

function getStyles(isDragging: boolean): CSSProperties {
  return {
    opacity: isDragging ? 0.5 : 1,
  };
}

export default function Piece({
  piece,
}: {
  piece?: { value: string; color: string };
}) {
  const [{ isDragging }, dragRef, preview] = useDrag(() => ({
    type: "piece",
    item: { piece },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  function pieceToSymbol(
    piece: { value: string; color: string } | undefined
  ): string {
    if (!piece) return "";
    return piece.color + piece.value.toUpperCase();
  }
  const srcImage = "svg/" + pieceToSymbol(piece) + ".svg";

  return (
    <>
      <div ref={dragRef} style={getStyles(isDragging)}>
        <img
          className={"piece-cell " + (isDragging ? "dragged" : "")}
          src={srcImage}
        />
      </div>
    </>
  );
}
