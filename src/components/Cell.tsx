import "./Cell.css";

export default function Cell({
  coords,
  dark,
  piece,
}: {
  coords?: [string, number];
  dark?: boolean;
  piece?: { value: string; color: string };
}) {
  function pieceToSymbol(
    piece: { value: string; color: string } | undefined
  ): string {
    if (!piece) return "";
    return piece.color + piece.value.toUpperCase();
  }

  return (
    <div className={"cell " + (dark ? "dark-cell" : "light-cell")}>
      {piece && (
        <img
          className="piece-cell"
          src={"svg/" + pieceToSymbol(piece) + ".svg"}
        />
      )}
    </div>
  );
}
