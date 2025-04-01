import Cell from "./Cell";
import "./Board.css";

export default function Board() {
  return (
    <div className="board">
      {[...Array(8)].map((_, i) => 8-i).map((x, i) =>
        [...Array(8)].map((_, j) => String.fromCharCode(97 + j)).map((y, j) => (
          <Cell key={x.toString() + "-" + y} coords={[y, x]} dark={(i+j)%2 === 1} />
        ))
      )}
    </div>
  );
}
