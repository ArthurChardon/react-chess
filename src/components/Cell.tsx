import "./Cell.css";

export default function Cell({
  coords,
  dark,
  piece,
}: {
  coords?: [string, number];
  dark?: boolean;
  piece?: {value: string; color: string};
}) {
  function pieceToSymbol(
    piece: {value: string; color: string} | undefined,
  ): string {
    if (!piece) return "";
    switch (piece.value + "-" + piece.color) {
      case "p-white":
        return "♙";
      case "p-black":
        return "♟";
      case "r-white":
        return "♖";
      case "r-black":
        return "♜";
      case "n-white":
        return "♘";
      case "n-black":
        return "♞";
      case "b-white":
        return "♗";
      case "b-black":
        return "♝";
      case "q-white":
        return "♕";
      case "q-black":
        return "♛";
      case "k-white":
        return "♔";
      case "k-black":
        return "♚";
      default:
        return "";
    }
  }

  return (
    <div
      className={
        "cell " +
        (dark ? "dark-cell" : "light-cell")
      }
    >
      {pieceToSymbol(piece)}
    </div>
  );
}
