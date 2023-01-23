import { useEffect, useState, createContext, useContext } from "react";
import "./App.css";
import { transformIntoGameFormat, gamesDatabase } from "./databaseOfGames.js";
import { Board, DEFAULT_BOARD } from "./Board.jsx";
import { MoveList } from "./PlayedMoves.jsx";
import { Navbar } from "./Navbar";
import { Title } from "./Title";
/* 
Refactor k
Podział aplikacji na pliki k
Odpowiedni Display partii(nazwiska nad partią itp)
zawijanie movelisty k
nr ruchów na moveliscie [k???]
bugi w rekurencji fest
bug z borderami planszy po dodaniu tytulu
*/

export const PlayedMovesContext = createContext();
export const CurrentGameContext = createContext();
export const BoardHistoryContext = createContext();
export const MovIndexContext = createContext();

function App() {
  const [playedMoves, setPlayedMoves] = useState([]);
  const [currentGame, setCurrentGame] = useState(gamesDatabase[0]);
  const [boardHistory, setBoardHistory] = useState([DEFAULT_BOARD]);
  const [movIndex, setMovIndex] = useState(0);
  return (
    <div className="page">
      <CurrentGameContext.Provider value={[currentGame, setCurrentGame]}>
        <PlayedMovesContext.Provider value={[playedMoves, setPlayedMoves]}>
          <MovIndexContext.Provider value={[movIndex, setMovIndex]}>
            <BoardHistoryContext.Provider
              value={[boardHistory, setBoardHistory]}
            >
              <div className="title">
                <Title names={currentGame.title} result={currentGame.result} />
              </div>
              <div className="main-content">
                <Navbar />
                <Board />

                <MoveList />
              </div>
            </BoardHistoryContext.Provider>
          </MovIndexContext.Provider>
        </PlayedMovesContext.Provider>
      </CurrentGameContext.Provider>
    </div>
  );
}

export default App;
