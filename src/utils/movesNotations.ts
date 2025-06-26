import { Move } from "@/types/moves";
import { PieceT } from "@/types/pieces";

export function generateNotationFromMove(
  move: Move,
  pieceMap: Map<string, PieceT>,
  isChecked = false,
  isCheckmated = false
): string {
  if (move.ref === "O-O" || move.ref === "O-O-O") {
    return move.ref;
  }

  const piece = pieceMap.get(move.from);
  if (!piece) {
    return "";
  }
  const capture = !!pieceMap.get(move.to) || move.ref === "ep";

  let pieceType = piece.type.toUpperCase().replace("P", "");
  if (piece.type === "p" && capture) pieceType = move.from[0];
  return `${pieceType}${capture ? "x" : ""}${move.to}${move.ref === "prom" ? "=Q" : ""}${move.ref === "ep" ? " e.p." : ""}${isChecked ? "+" : ""}${isCheckmated ? "#" : ""}`;
}
