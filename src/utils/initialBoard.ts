export const initialBoard: { coords: string; value: string; color: string }[] = [
  { coords: "a1", value: "r", color: "w" },
  { coords: "b1", value: "n", color: "w" },
  { coords: "c1", value: "b", color: "w" },
  { coords: "d1", value: "q", color: "w" },
  { coords: "e1", value: "k", color: "w" },
  { coords: "f1", value: "b", color: "w" },
  { coords: "g1", value: "n", color: "w" },
  { coords: "h1", value: "r", color: "w" },

  { coords: "a8", value: "r", color: "b" },
  { coords: "b8", value: "n", color: "b" },
  { coords: "c8", value: "b", color: "b" },
  { coords: "d8", value: "q", color: "b" },
  { coords: "e8", value: "k", color: "b" },
  { coords: "f8", value: "b", color: "b" },
  { coords: "g8", value: "n", color: "b" },
  { coords: "h8", value: "r", color: "b" },
]
  .concat(
    [...Array(8)].map((_, i) => ({
      coords: String.fromCharCode(97 + i) + "2",
      value: "p",
      color: "w",
    }))
  )
  .concat(
    [...Array(8)].map((_, i) => ({
      coords: String.fromCharCode(97 + i) + "7",
      value: "p",
      color: "b",
    }))
  );