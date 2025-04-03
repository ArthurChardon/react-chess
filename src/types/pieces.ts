export interface PieceT {
  color: ChessColor;
  type: ChessPiece;
}

export type ChessColor = "w" | "b";
export type ChessPiece = string; //TODO enumerate string literal
