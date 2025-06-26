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
import { useMoves } from "./context/MovesContext";
import { Progress } from "./components/ui/progress";

function App() {
  const convertCases = new Map<string, number>();
  const revertConvertCases = new Map<number, string>();
  const [freeMoves, setFreeMoves] = useState(false);
  const [animateEndgame, setAnimateEndgame] = useState(false);
  const [boardKey, setBoardKey] = useState(0);

  const {
    displayedMoveIndex,
    pieceMaps,
    firstDisplayedMoveIndex,
    prevDisplayedMoveIndex,
    nextDisplayedMoveIndex,
    lastDisplayedMoveIndex,
  } = useMoves();

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
            <Card className="col-start-1 col-end-2 p-4 bg-secondary"></Card>
            <div
              className={
                "col-start-2 col-end-3 flex justify-center items-center flex-col" +
                (animateEndgame ? " animate-endgame" : "")
              }
            >
              <Progress
                className={
                  "moves-pb mb-4" + (pieceMaps.length === 1 ? " opacity-0" : "")
                }
                value={(100 * displayedMoveIndex) / (pieceMaps.length - 1)}
              ></Progress>
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
                <Button
                  disabled={displayedMoveIndex === 0}
                  onClick={() => {
                    firstDisplayedMoveIndex();
                  }}
                  aria-label="Premier coup"
                >
                  <SkipBack></SkipBack>
                </Button>
                <Button
                  disabled={displayedMoveIndex === 0}
                  onClick={() => {
                    prevDisplayedMoveIndex();
                  }}
                  aria-label="Coup précédent"
                >
                  <StepBack></StepBack>
                </Button>
                <Button
                  disabled={displayedMoveIndex === pieceMaps.length - 1}
                  onClick={() => {
                    nextDisplayedMoveIndex();
                  }}
                  aria-label="Coup suivant"
                >
                  <StepForward></StepForward>
                </Button>
                <Button
                  disabled={displayedMoveIndex === pieceMaps.length - 1}
                  onClick={() => {
                    lastDisplayedMoveIndex();
                  }}
                  aria-label="Dernier coup"
                >
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
