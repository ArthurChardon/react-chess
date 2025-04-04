import { ChessColor, PieceT } from "../types/pieces";

const tab120 = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, -1, -1, 8, 9, 10, 11, 12, 13, 14, 15, -1, -1,
  16, 17, 18, 19, 20, 21, 22, 23, -1, -1, 24, 25, 26, 27, 28, 29, 30, 31, -1,
  -1, 32, 33, 34, 35, 36, 37, 38, 39, -1, -1, 40, 41, 42, 43, 44, 45, 46, 47,
  -1, -1, 48, 49, 50, 51, 52, 53, 54, 55, -1, -1, 56, 57, 58, 59, 60, 61, 62,
  63, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1,
];
const tab64 = [
  21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 51, 52, 53, 54, 55, 56, 57, 58, 61, 62, 63, 64, 65, 66,
  67, 68, 71, 72, 73, 74, 75, 76, 77, 78, 81, 82, 83, 84, 85, 86, 87, 88, 91,
  92, 93, 94, 95, 96, 97, 98,
];
const moves_rook = [-10, 10, -1, 1];
const moves_bishop = [-11, -9, 11, 9];
const moves_knight = [-12, -21, -19, -8, 12, 21, 19, 8];
export const lts = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const nbs = [...Array(8).keys()].map((i) => i + 1).reverse();

export class MovesController {
  cases: Map<string, PieceT>;
  convertCases: Map<string, number>;
  revertCases: Map<number, string>;
  whiteCheck = false;
  blackCheck = false;
  whiteCanOOO = true;
  whiteCanOO = true;
  blackCanOOO = true;
  blackCanOO = true;

  enPassant = -1;

  whiteAttackedCases: number[] = [];
  blackAttackedCases: number[] = [];

  constructor(
    cases: Map<string, PieceT>,
    convertCases: Map<string, number>,
    revertCases: Map<number, string>,
    computeAttackedCases: boolean,
    whiteCheck: boolean,
    blackCheck: boolean,
    whiteCanOOO: boolean,
    whiteCanOO: boolean,
    blackCanOOO: boolean,
    blackCanOO: boolean
  ) {
    this.cases = cases;
    this.convertCases = convertCases;
    this.revertCases = revertCases;
    this.whiteCheck = whiteCheck;
    this.blackCheck = blackCheck;
    this.whiteCanOOO = whiteCanOOO;
    this.whiteCanOO = whiteCanOO;
    this.blackCanOOO = blackCanOOO;
    this.blackCanOO = blackCanOO;

    if (computeAttackedCases) {
      this.casesAttacked("w");
      this.casesAttacked("b");
    }
  }

  public availableMovesFrom(
    pieceValue: string,
    pieceColor: ChessColor,
    pieceCoords: string
  ): [string, string, string][] {
    const numPieceCase = this.convertCases.get(pieceCoords) ?? null;
    if (numPieceCase === null) return [];

    let availablesCases: [number, number, string][] = [];

    switch (pieceValue) {
      case "p": {
        availablesCases = this.pos2_pawn(numPieceCase, pieceColor);
        break;
      }
      case "r": {
        availablesCases = this.pos2_rook(numPieceCase, pieceColor);
        break;
      }
      case "n": {
        availablesCases = this.pos2_knight(numPieceCase, pieceColor);
        break;
      }
      case "b": {
        availablesCases = this.pos2_bishop(numPieceCase, pieceColor);
        break;
      }
      case "q": {
        availablesCases = this.pos2_rook(numPieceCase, pieceColor).concat(
          this.pos2_bishop(numPieceCase, pieceColor)
        );
        break;
      }
      case "k": {
        availablesCases = this.pos2_king(numPieceCase, pieceColor, false); // à changer le booléen asap
        break;
      }
      default: {
        return [];
      }
    }
    return this.revertNumbsToCoords(availablesCases);
  }

  pos2_bishop(pos1: number, color: ChessColor, sim?: boolean) {
    const availableMoves: [number, number, string][] = [];
    for (const k of moves_bishop) {
      let j = 1;
      while (true) {
        const n = tab120[tab64[pos1] + k * j];
        if (n != -1) {
          //as we are not out of the board
          if (this.isEmpty(n) || this.hasEnemyPiece(n, color)) {
            if (sim || this.simulatePosition(pos1, n)) {
              availableMoves.push([pos1, n, ""]);
            }
          }
        } else {
          // outside the board
          break;
        }
        if (!this.isEmpty(n)) {
          break;
        }
        j = j + 1;
      }
    }
    return availableMoves;
  }

  pos2_knight(pos1: number, color: ChessColor, sim?: boolean) {
    const availableMoves: [number, number, string][] = [];
    for (const i of moves_knight) {
      const n = tab120[tab64[pos1] + i];
      if (n != -1) {
        //as we are not out of the board
        if (this.isEmpty(n) || this.hasEnemyPiece(n, color)) {
          if (sim || this.simulatePosition(pos1, n)) {
            availableMoves.push([pos1, n, ""]);
          }
        }
      }
    }
    return availableMoves;
  }

  pos2_king(
    pos1: number,
    color: ChessColor,
    isAttacked: boolean,
    sim?: boolean
  ) {
    // il faut (pour le pion aussi) gérer les déplacements et les menaces, par exemple sur un roque, le roi peut se déplacer mais pas menacer sur une case
    const availableMoves: [number, number, string][] = [];
    for (const i of moves_rook.concat(moves_bishop)) {
      const n = tab120[tab64[pos1] + i];
      if (n != -1) {
        //as we are not out of the board
        if (this.isEmpty(n) || this.hasEnemyPiece(n, color)) {
          if (sim || this.simulatePosition(pos1, n)) {
            availableMoves.push([pos1, n, ""]);
          }
        }
      }
    }
    if (isAttacked) {
      return availableMoves;
    }
    // castle moves
    if (
      color === "w" &&
      !this.whiteCheck &&
      this.whiteCanOO &&
      this.isEmpty(61) &&
      this.isEmpty(62)
    ) {
      let pathThreatened = false;
      for (const threathenedCase of whiteAttackedCases) {
        if (threathenedCase == 61 || threathenedCase == 62) {
          pathThreatened = true;
          break;
        }
      }
      if (!pathThreatened) {
        availableMoves.push([pos1, 62, "OO"]);
      }
    } else if (
      color === "b" &&
      !this.blackCheck &&
      this.blackCanOO &&
      this.isEmpty(5) &&
      this.isEmpty(6)
    ) {
      let pathThreatened = false;
      for (const threathenedCase of blackAttackedCases) {
        if (threathenedCase == 5 || threathenedCase == 6) {
          pathThreatened = true;
          break;
        }
      }
      if (!pathThreatened) {
        availableMoves.push([pos1, 6, "OO"]);
      }
    }
    if (
      color === "w" &&
      !this.whiteCheck &&
      this.whiteCanOOO &&
      this.isEmpty(57) &&
      this.isEmpty(58) &&
      this.isEmpty(59)
    ) {
      let pathThreatened = false;
      for (const threathenedCase of whiteAttackedCases) {
        if (
          threathenedCase == 57 ||
          threathenedCase == 58 ||
          threathenedCase === 59
        ) {
          pathThreatened = true;
          break;
        }
      }
      if (!pathThreatened) {
        availableMoves.push([pos1, 58, "OOO"]);
      }
    } else if (
      color === "b" &&
      !this.blackCheck &&
      this.blackCanOOO &&
      this.isEmpty(1) &&
      this.isEmpty(2) &&
      this.isEmpty(3)
    ) {
      let pathThreatened = false;
      for (const threathenedCase of blackAttackedCases) {
        if (
          threathenedCase == 1 ||
          threathenedCase == 2 ||
          threathenedCase === 3
        ) {
          pathThreatened = true;
          break;
        }
      }
      if (!pathThreatened) {
        availableMoves.push([pos1, 2, "OOO"]);
      }
    }

    return availableMoves;
  }

  pos2_rook(pos1: number, color: ChessColor, sim?: boolean) {
    const availableMoves: [number, number, string][] = [];
    for (const k of moves_rook) {
      let j = 1;
      while (true) {
        const n = tab120[tab64[pos1] + k * j];
        if (n != -1) {
          //as we are not out of the board
          if (this.isEmpty(n) || this.hasEnemyPiece(n, color)) {
            if (sim || this.simulatePosition(pos1, n)) {
              availableMoves.push([pos1, n, ""]);
            }
          }
        } else {
          // outside the board
          break;
        }
        if (!this.isEmpty(n)) {
          break;
        }
        j = j + 1;
      }
    }
    return availableMoves;
  }

  pos2_pawn(pos1: number, color: ChessColor, sim?: boolean) {
    const availableMoves: [number, number, string][] = [];
    if (color === "w") {
      const n = tab120[tab64[pos1] - 10];
      if (n != -1) {
        if (this.isEmpty(n)) {
          if (sim || this.simulatePosition(pos1, n)) {
            if (n < 8) {
              availableMoves.push([pos1, n, "prom"]);
            } else {
              availableMoves.push([pos1, n, ""]);
            }
          }
        }
      }
      if (pos1 <= 55 && pos1 >= 48) {
        // first row
        if (this.isEmpty(pos1 - 8) && this.isEmpty(pos1 - 16)) {
          if (sim || this.simulatePosition(pos1, pos1 - 16)) {
            availableMoves.push([pos1, pos1 - 16, "2pawn"]);
          }
        }
      }
    } else if (color === "b") {
      const n = tab120[tab64[pos1] + 10];
      if (n != -1) {
        if (this.isEmpty(n)) {
          if (sim || this.simulatePosition(pos1, n)) {
            if (n > 55) {
              availableMoves.push([pos1, n, "prom"]);
            } else {
              availableMoves.push([pos1, n, ""]);
            }
          }
        }
      }
      if (pos1 <= 15 && pos1 >= 8) {
        // first row
        if (this.isEmpty(pos1 + 8) && this.isEmpty(pos1 + 16)) {
          if (sim || this.simulatePosition(pos1, pos1 + 16)) {
            availableMoves.push([pos1, pos1 + 16, "2pawn"]);
          }
        }
      }
    }
    return availableMoves.concat(this.capture_pawn(pos1, color, sim));
  }

  isEmpty(numb: number) {
    return this.getPiece(numb) === null;
  }

  getPiece(numb: number): PieceT | null {
    return this.cases.get(this.revertCases.get(numb) ?? "") ?? null;
  }

  hasEnemyPiece(numb: number, color: ChessColor) {
    // color of the player, numb of the case to be checked in cases
    const piece = this.getPiece(numb);
    if (piece) {
      return piece.color != color;
    }
    return false;
  }

  simulatePosition(pos1: number, pos2: number) {
    //SHOULD BE NAMED: newPositionValid(pos1, pos2)
    const piece1 = this.getPiece(pos1);
    if (piece1) {
      const color = piece1.color;
      const casesCopy: Map<string, PieceT> = new Map<string, PieceT>();

      const coords1 = this.revertCases.get(pos1);
      const coords2 = this.revertCases.get(pos2);

      this.cases.forEach((piece, coords) => {
        if (piece) {
          casesCopy.set(coords, piece);
        }
      });

      if (!coords1 || !coords2) return false;

      casesCopy.set(coords2, piece1);
      casesCopy.delete(coords1);

      const threatsResult = this.refreshThreats(color, casesCopy, true);
      if (threatsResult[1]) {
        return false;
      }
    }
    return true;
  }

  refreshThreats(
    color: ChessColor,
    pieceCases: Map<string, PieceT>,
    sim?: boolean
  ) {
    const shadowController = new MovesController(
      pieceCases,
      this.convertCases,
      this.revertCases,
      false,
      this.whiteCheck,
      this.blackCheck,
      this.whiteCanOOO,
      this.whiteCanOO,
      this.blackCanOOO,
      this.blackCanOO
    );

    const casesOut: number[] = [];
    let pCases: [number, number, string][] = [];

    pieceCases.forEach((piece, coords) => {
      const newCoords = this.convertCases.get(coords) ?? null;
      if (piece && piece.color != color && newCoords !== null) {
        pCases = [];
        switch (piece.type) {
          case "p": {
            pCases = shadowController.capture_pawn(newCoords, piece.color, sim);
            break;
          }
          case "r": {
            pCases = shadowController.pos2_rook(newCoords, piece.color, sim);
            break;
          }
          case "n": {
            pCases = shadowController.pos2_knight(newCoords, piece.color, sim);
            break;
          }
          case "b": {
            pCases = shadowController.pos2_bishop(newCoords, piece.color, sim);
            break;
          }
          case "q": {
            pCases = shadowController
              .pos2_rook(newCoords, piece.color, sim)
              .concat(
                shadowController.pos2_bishop(newCoords, piece.color, sim)
              );
            break;
          }
          case "k": {
            pCases = shadowController.pos2_king(
              newCoords,
              piece.color,
              false,
              sim
            ); // à changer le booléen asap
            break;
          }
        }
        for (const list of pCases) {
          casesOut.push(list[1]);
        }
      }
    });
    const check = this.isChecked(color, pieceCases, casesOut);
    const threatsResults: [number[], boolean] = [casesOut, check];

    return threatsResults;
  }

  capture_pawn(pos1: number, color: ChessColor, sim?: boolean) {
    const availableMoves: [number, number, string][] = [];
    if (color === "w") {
      //Capture upper left
      let n = tab120[tab64[pos1] - 11];
      if (n != -1) {
        if (this.hasEnemyPiece(n, color)) {
          if (sim || this.simulatePosition(pos1, n)) {
            if (n < 8) {
              availableMoves.push([pos1, n, "prom"]);
            } else {
              availableMoves.push([pos1, n, ""]);
            }
          }
        } else if (n == this.enPassant) {
          if (sim || this.simulatePosition(pos1, n)) {
            availableMoves.push([pos1, n, "ep"]);
          }
        }
      }
      //Capture upper right
      n = tab120[tab64[pos1] - 9];
      if (n != -1) {
        if (this.hasEnemyPiece(n, color)) {
          if (sim || this.simulatePosition(pos1, n)) {
            if (n < 8) {
              availableMoves.push([pos1, n, "prom"]);
            } else {
              availableMoves.push([pos1, n, ""]);
            }
          }
        } else if (n == this.enPassant) {
          if (sim || this.simulatePosition(pos1, n)) {
            availableMoves.push([pos1, n, "ep"]);
          }
        }
      }
    } else if (color === "b") {
      //Capture bottom left
      let n = tab120[tab64[pos1] + 11];
      if (n != -1) {
        if (this.hasEnemyPiece(n, color)) {
          if (sim || this.simulatePosition(pos1, n)) {
            if (n > 55) {
              availableMoves.push([pos1, n, "prom"]);
            } else {
              availableMoves.push([pos1, n, ""]);
            }
          }
        } else if (n == this.enPassant) {
          if (sim || this.simulatePosition(pos1, n)) {
            availableMoves.push([pos1, n, "ep"]);
          }
        }
      }
      //Capture bottom right
      n = tab120[tab64[pos1] + 9];
      if (n != -1) {
        if (this.hasEnemyPiece(n, color)) {
          if (sim || this.simulatePosition(pos1, n)) {
            if (n > 55) {
              availableMoves.push([pos1, n, "prom"]);
            } else {
              availableMoves.push([pos1, n, ""]);
            }
          }
        } else if (n == this.enPassant) {
          if (sim || this.simulatePosition(pos1, n)) {
            availableMoves.push([pos1, n, "ep"]);
          }
        }
      }
    }
    return availableMoves;
  }

  casesAttacked(color: ChessColor) {
    // Returns the cases of the colored pieces being threatened
    let cases: number[] = [];

    const threatsResult = this.refreshThreats(color, this.cases);
    cases = threatsResult[0];
    const check = threatsResult[1];

    if (check) {
      if (color === "w") {
        this.whiteCheck = true;
      }
      if (color === "b") {
        this.blackCheck = true;
      }
    } else {
      if (color === "w") {
        this.whiteCheck = false;
      }
      if (color === "b") {
        this.blackCheck = false;
      }
    }
    return cases;
  }

  isChecked(
    color: ChessColor,
    pieceCases: Map<string, PieceT>,
    casesThreatened: number[]
  ) {
    for (const c of casesThreatened) {
      const piece = pieceCases.get(this.revertCases.get(c) ?? "");
      if (piece && piece.type === "k" && piece.color === color) {
        return true;
      }
    }
    return false;
  }

  revertNumbsToCoords(
    results: [number, number, string][]
  ): [string, string, string][] {
    return results.map((result) => [
      this.revertCases.get(result[0]) ?? "",
      this.revertCases.get(result[1]) ?? "",
      result[2],
    ]);
  }
}
