import { useEffect, useState, createContext, useContext } from "react";
import { BoardHistoryContext, MovIndexContext, PlayedMovesContext, CurrentGameContext } from "./App";
import { transformIntoGameFormat } from "./databaseOfGames";
import {handleTurn, coordsToNum} from "./draughtsLogic";
import {Title} from "./Title";
import {Field} from "./Field";


export const DEFAULT_BOARD = [];

for (let i = 0; i < 50; i++) {
  if (i < 20)
    DEFAULT_BOARD.push({ noOfField: i + 1, color: "black", type: "piece" });
  else if (i > 29)
    DEFAULT_BOARD.push({ noOfField: i + 1, color: "white", type: "piece" });
}


export function Board() {
    const [boardHistory, setBoardHistory] = useContext(BoardHistoryContext);
    const pieces = boardHistory[boardHistory.length - 1];
    const [stopButtonClicked, setStopButton] = useState(false);
    const [movIndex, setMovIndex] = useContext(MovIndexContext);
    const [playedMoves, setPlayedMoves] = useContext(PlayedMovesContext);
    const [currentGame, setCurrentGame] = useContext(CurrentGameContext);
    const moves = transformIntoGameFormat(currentGame.game);
    useEffect(() => {
      let gameInterval = setTimeout(() => {
        if (!stopButtonClicked) {
          if (movIndex < moves.length) {
            setBoardHistory([
              ...boardHistory,
              handleTurn(moves[movIndex], pieces),
            ]);
            setPlayedMoves(
              addMoveToPlayedList(playedMoves, [
                moves[movIndex].movFrom,
                moves[movIndex].movTo,
              ])
            );
            setMovIndex(movIndex + 1);
          }
        }
      }, 500);
  
      return () => clearTimeout(gameInterval);
    }, [stopButtonClicked, pieces, movIndex]);
  
    let addMoveToPlayedList = function (actualList, move) {
      let playedListToReturn = actualList.slice();
      playedListToReturn.push(move);
      return playedListToReturn;
    };
  
    let removeMoveFromPlayedList = function (actualList) {
      let playedListToReturn = actualList.slice();
      playedListToReturn.pop();
      return playedListToReturn;
    };
  
    let previousMove = function () {
      if (movIndex - 1 >= 0) {
        setStopButton(true);
        setBoardHistory(boardHistory.slice(0, boardHistory.length - 1));
        setPlayedMoves(removeMoveFromPlayedList(playedMoves));
        setMovIndex(movIndex - 1);
      }
    };
    let nextMove = function () {
      if (movIndex + 1 <= moves.length) {
        setStopButton(true);
        setBoardHistory([...boardHistory, handleTurn(moves[movIndex], pieces)]);
        setPlayedMoves(
          addMoveToPlayedList(playedMoves, [
            moves[movIndex].movFrom,
            moves[movIndex].movTo,
          ])
        );
        setMovIndex(movIndex + 1);
      }
    };
    return (
      <div className="board">
        
        {Array(10)
          .fill()
          .map((_, y) => {
            return (
              <div key={y} className="row">
                {Array(10)
                  .fill()
                  .map((_, x) => {
                    const white = y % 2 === 0 ? x % 2 === 0 : x % 2 === 1;
                    const noOfField = coordsToNum({ x, y });
                    const piece = pieces.find(
                      (piece) => piece.noOfField === noOfField
                    );
  
                    return (
                      <Field
                        key={`${x - y}`}
                        white={white}
                        piece={piece?.color}
                      />
                    );
                  })}
              </div>
            );
          })}
        <div className="navbar">
        <button className="navButton" disabled={movIndex <= 0} onClick={() => previousMove()}>
            ⇦
          </button>
          <button
            className="navButton"
            onClick={() => setStopButton(!stopButtonClicked)}
          >
            {stopButtonClicked ? "▶" : "II"}
          </button>
          <button className="navButton" disabled={movIndex >= moves.length} onClick={() => nextMove()}>
            ⇨
          </button>
        </div>
      </div>
    );
  }