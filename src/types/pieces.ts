export interface PieceT {
  color: ChessColor;
  type: ChessPieceType;
}

export type ChessColor = "w" | "b";
export type ChessPieceType = "p" | "r" | "n" | "b" | "q" | "k";
