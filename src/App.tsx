import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";

import "./styles.css";
import "./App.css";
import Board from "./components/Board/Board";
import { lts, nbs } from "./utils/chessMoves";
import { Switch } from "./components/ui/switch";
import { useState } from "react";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import {
  RefreshCw,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
} from "lucide-react";

function App() {
  const convertCases = new Map<string, number>();
  const revertConvertCases = new Map<number, string>();
  const [freeMoves, setFreeMoves] = useState(false);
  const [animateEndgame, setAnimateEndgame] = useState(false);
  const [boardKey, setBoardKey] = useState(0);

  let count = 0;
  for (const n in nbs) {
    for (const l in lts) {
      convertCases.set(lts[l] + nbs[n], count);
      revertConvertCases.set(count, lts[l] + nbs[n]);
      count++;
    }
  }

  function startNewGame() {
    setBoardKey((prevKey) => prevKey + 1);
  }

  function triggerEndgameAnimation() {
    setAnimateEndgame(true);
  }

  return (
    <>
      <div className="dark board-container bg-background">
        <Card className="w-full items-center">
          <div className="main-card-grid">
            <div
              className={
                "col-start-2 col-end-3 flex justify-center items-center" +
                (animateEndgame ? " animate-endgame" : "")
              }
            >
              <DndProvider
                backend={TouchBackend}
                options={{ enableMouseEvents: true }}
              >
                <Board
                  key={boardKey}
                  convertCases={convertCases}
                  revertCases={revertConvertCases}
                  freeMoves={freeMoves}
                  endgameReached={(endGame) => {
                    if (!endGame) return;
                    triggerEndgameAnimation();
                    console.log("Endgame reached:", endGame);
                  }}
                />
              </DndProvider>
            </div>

            <Card className="col-start-3 ml-auto p-4 bg-secondary">
              <div className="flex justify-between items-center text-white gap-[1rem] w-full mb-4">
                <h3>Options</h3>
              </div>
              <div className="flex justify-between items-center text-white gap-[.5rem] w-full ">
                <h4>Partie</h4>
                <Button
                  onClick={() => {
                    startNewGame();
                  }}
                  className="ml-auto"
                  aria-label="Relancer la partie"
                >
                  <RefreshCw></RefreshCw>
                </Button>
                <Button aria-label="Premier coup">
                  <SkipBack></SkipBack>
                </Button>
                <Button aria-label="Coup précédent">
                  <StepBack></StepBack>
                </Button>
                <Button aria-label="Coup suivant">
                  <StepForward></StepForward>
                </Button>
                <Button aria-label="Dernier coup">
                  <SkipForward></SkipForward>
                </Button>
              </div>
              <div className="flex justify-between items-center text-white gap-[1rem] w-fit ">
                <h4>Coups alternés</h4>
                <Switch
                  onCheckedChange={(checked) => {
                    setFreeMoves(checked);
                  }}
                ></Switch>
                <h4>Coups libres</h4>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </>
  );
}

export default App;
