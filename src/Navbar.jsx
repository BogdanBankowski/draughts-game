import { useEffect, useState, createContext, useContext } from "react";
import { CurrentGameContext, BoardHistoryContext, MovIndexContext, PlayedMovesContext } from "./App";
import { gamesDatabase } from "./databaseOfGames";
import { DEFAULT_BOARD } from "./Board";

export function Navbar() {
    let [currentGame, setCurrentGame] = useContext(CurrentGameContext);
    let [boardHistory, setBoardHistory] = useContext(BoardHistoryContext);
    let [movIndex, setMovIndex] = useContext(MovIndexContext);
    let [playedMoves, setPlayedMoves] = useContext(PlayedMovesContext);
    // useEffect w boardzie z currentGame w zaleznosciach resetujący caly stan
  
    const gamesDatabaseCopy = gamesDatabase.slice();
    const gamesToDisplay = gamesDatabaseCopy.filter(
      (elem) => elem.title !== currentGame.title
    );
    function handleGameSwap(e) {
      const targetGame = gamesDatabase.find((elem) => elem.title === e.target.id);
      setCurrentGame(targetGame);
      setBoardHistory([DEFAULT_BOARD]);
      setMovIndex(0);
      setPlayedMoves([]);
    }
  
    return (
      <div className="games-navbar">
        <ul>
          {gamesToDisplay.map((value, index) => {
            return (
              <div>
                <li
                  id={value.title}
                  onClick={(e) => handleGameSwap(e)}
                  key={index}
                  className="game"
                >
                  {value.title}
                </li>
                <li className="result" key={index + "result"}>
                  {value.result}
                </li>
              </div>
            );
          })}
        </ul>
      </div>
    );
  }