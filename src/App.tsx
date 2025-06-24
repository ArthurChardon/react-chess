import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";

import "./styles.css";
import "./App.css";
import Board from "./components/Board/Board";
import { lts, nbs } from "./utils/chessMoves";
import { Switch } from "./components/ui/switch";
import { useState } from "react";
import { Card } from "./components/ui/card";

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
      <div className="dark board-container bg-background">
        <Card className="w-full items-center">
          <div className="main-card-grid">
            <div className="col-start-2 col-end-3 flex justify-center items-center">
              <DndProvider
                backend={TouchBackend}
                options={{ enableMouseEvents: true }}
              >
                <Board
                  convertCases={convertCases}
                  revertCases={revertConvertCases}
                  freeMoves={freeMoves}
                  endgameReached={(endGame) => {
                    console.log("Endgame reached:", endGame);
                  }}
                />
              </DndProvider>
            </div>

            <Card className="col-start-3 ml-auto p-4 bg-secondary">
              <h3>Options</h3>
              <div className="flex justify-between items-center mb-4 text-white gap-[1rem] w-fit ">
                Coups alternés{" "}
                <Switch
                  onCheckedChange={(checked) => {
                    setFreeMoves(checked);
                  }}
                ></Switch>{" "}
                Coups libres
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </>
  );
}

export default App;
