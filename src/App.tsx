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
  BookOpenText,
  Cog,
  Eye,
  RefreshCw,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
} from "lucide-react";
import { useMoves } from "./context/MovesContext";
import { Progress } from "./components/ui/progress";
import { ScrollArea } from "./components/ui/scroll-area";
import { Checkbox } from "./components/ui/checkbox";
import { useUISettings } from "./context/UISettingsContext";

function App() {
  const convertCases = new Map<string, number>();
  const revertConvertCases = new Map<number, string>();
  const [freeMoves, setFreeMoves] = useState(false);
  const [animateEndgame, setAnimateEndgame] = useState(false);
  const [boardKey, setBoardKey] = useState(0);

  const {
    caseLabels,
    activateCaseLabels,
    deactivateCaseLabels,
    availableMoves,
    activateAvailableMoves,
    deactivateAvailableMoves,
  } = useUISettings();

  const {
    displayedMoveIndex,
    pieceMaps,
    movesNotation,
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

  function triggerCaseLabels() {
    if (caseLabels) {
      deactivateCaseLabels();
    } else {
      activateCaseLabels();
    }
  }

  function triggerAvailableMoves() {
    if (availableMoves) {
      deactivateAvailableMoves();
    } else {
      activateAvailableMoves();
    }
  }

  return (
    <>
      <div className="dark board-container bg-background">
        <Card className="w-full items-center">
          <div className="main-card-grid">
            <Card className="col-start-1 col-end-2 p-4 bg-secondary min-w-[300px]">
              <div className="flex justify-between items-center text-white gap-[1rem] w-full mb-4">
                <h3>Notation</h3>
                <BookOpenText></BookOpenText>
              </div>
              <ScrollArea className="h-[40rem] rounded-md border p-4">
                {movesNotation
                  .reduce((notations, notation, index) => {
                    if (index % 2 === 0) {
                      notations.push([notation]);
                    } else {
                      notations[notations.length - 1].push(notation);
                    }
                    return notations;
                  }, [] as string[][])
                  .map((notation, index) => {
                    return (
                      <div
                        key={"notation-" + index}
                        className={
                          "flex justify-start items-center text-white gap-[.5rem] w-full "
                        }
                      >
                        <span className="text-lg">{index + 1}.</span>
                        {notation.map((n, i) => (
                          <span
                            key={"notation-" + index + "-" + i}
                            className={
                              "text-lg" +
                              (index * 2 + i + 1 === displayedMoveIndex
                                ? " font-bold"
                                : "")
                            }
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    );
                  })}
              </ScrollArea>
            </Card>
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
              <div className="flex justify-center items-center text-white gap-[.5rem] w-full mt-[1rem]">
                {" "}
                <Button
                  onClick={() => {
                    startNewGame();
                  }}
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
            </div>

            <Card className="col-start-3 ml-auto p-4 bg-secondary">
              <div className="flex justify-between items-center text-white gap-[1rem] w-full mb-4">
                <h3>Options</h3>
                <Cog></Cog>
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
              <div className="flex justify-between items-center text-white gap-[1rem] w-full mt-auto mb-4">
                <h3>Affichage</h3>
                <Eye></Eye>
              </div>
              <div className="flex justify-between items-center text-white gap-[1rem] w-fit ">
                <h4>Cases labellisées</h4>
                <Checkbox
                  checked={caseLabels}
                  onCheckedChange={() => {
                    triggerCaseLabels();
                  }}
                ></Checkbox>
              </div>
              <div className="flex justify-between items-center text-white gap-[1rem] w-fit ">
                <h4>Mouvements possibles</h4>
                <Checkbox
                  checked={availableMoves}
                  onCheckedChange={() => {
                    triggerAvailableMoves();
                  }}
                ></Checkbox>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </>
  );
}

export default App;
