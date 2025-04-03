import { ChessColor } from "../types/pieces";

export const initialBoard: {
  coords: string;
  type: string;
  color: ChessColor;
}[] = [
  { coords: "a1", type: "r", color: "w" },
  { coords: "b1", type: "n", color: "w" },
  { coords: "c1", type: "b", color: "w" },
  { coords: "d1", type: "q", color: "w" },
  { coords: "e1", type: "k", color: "w" },
  { coords: "f1", type: "b", color: "w" },
  { coords: "g1", type: "n", color: "w" },
  { coords: "h1", type: "r", color: "w" },

  { coords: "a8", type: "r", color: "b" },
  { coords: "b8", type: "n", color: "b" },
  { coords: "c8", type: "b", color: "b" },
  { coords: "d8", type: "q", color: "b" },
  { coords: "e8", type: "k", color: "b" },
  { coords: "f8", type: "b", color: "b" },
  { coords: "g8", type: "n", color: "b" },
  { coords: "h8", type: "r", color: "b" },
]
  .concat(
    [...Array(8)].map((_, i) => ({
      coords: String.fromCharCode(97 + i) + "2",
      type: "p",
      color: "w",
    }))
  )
  .concat(
    [...Array(8)].map((_, i) => ({
      coords: String.fromCharCode(97 + i) + "7",
      type: "p",
      color: "b",
    }))
  ) as {
  coords: string;
  type: string;
  color: ChessColor;
}[];
