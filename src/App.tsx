import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";

import "./styles.css";
import "./App.css";
import Board from "./components/Board/Board";
import { lts, nbs } from "./utils/chessMoves";
import { Switch } from "./components/ui/switch";
import { useState } from "react";

function App() {
  const convertCases = new Map<string, number>();
  const revertConvertCases = new Map<number, string>();
  const [freeMoves, setFreeMoves] = useState(false);

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
      <div className="board-container bg-foreground">
        <div className="flex justify-between items-center mb-4 text-white gap-[1rem]">
          Coups alternés{" "}
          <Switch
            onCheckedChange={(checked) => {
              setFreeMoves(checked);
            }}
          ></Switch>{" "}
          Coups libres
        </div>
        <DndProvider
          backend={TouchBackend}
          options={{ enableMouseEvents: true }}
        >
          <Board
            convertCases={convertCases}
            revertCases={revertConvertCases}
            freeMoves={freeMoves}
          />
        </DndProvider>
      </div>
    </>
  );
}

export default App;
