export type Move = {
  from: string;
  to: string;
  ref: MoveRef;
};

export type MoveRef = "" | "O-O" | "O-O-O" | "prom" | "2pawn" | "ep";
