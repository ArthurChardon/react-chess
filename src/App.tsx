import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";

import "./styles.css";
import "./App.css";
import Board from "./components/Board";
import { lts, nbs } from "./utils/chessMoves";

function App() {
  const convertCases = new Map<string, number>();
  const revertConvertCases = new Map<number, string>();
  let count = 0;
  for (const n in nbs) {
    for (const l in lts) {
      convertCases.set(lts[l] + nbs[n], count);
      revertConvertCases.set(count, lts[l] + nbs[n]);
      count++;
    }
  }

  return (
    <>
      <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
        <Board convertCases={convertCases} revertCases={revertConvertCases} />
      </DndProvider>
    </>
  );
}

export default App;
