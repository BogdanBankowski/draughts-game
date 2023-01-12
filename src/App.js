import { useEffect, useState, createContext, useContext } from "react";
import "./App.css";
import { transformIntoGameFormat, gamesDatabase } from "./databaseOfGames.js";

/* 
Refactor k
Podział aplikacji na pliki k
Odpowiedni Display partii(nazwiska nad partią itp)
zawijanie movelisty k
nr ruchów na moveliscie [k???]
bugi w rekurencji fest
*/

const DIAGONALS = {
  northWest: { x: -1, y: -1 },
  northEast: { x: 1, y: -1 },
  southWest: { x: -1, y: 1 },
  southEast: { x: 1, y: 1 },
};

const shownGame = gamesDatabase[4];
const TEST_GAME3 = transformIntoGameFormat(shownGame.game);
console.log(TEST_GAME3);
const DEFAULT_BOARD = [];

for (let i = 0; i < 50; i++) {
  if (i < 20)
    DEFAULT_BOARD.push({ noOfField: i + 1, color: "black", type: "piece" });
  else if (i > 29)
    DEFAULT_BOARD.push({ noOfField: i + 1, color: "white", type: "piece" });
}

const PlayedMovesContext = createContext();
const CurrentGameContext = createContext();
const BoardHistoryContext = createContext();
const MovIndexContext = createContext();

function numToCoords(fieldNumber) {
  const y = Math.floor((fieldNumber - 1) / 5);

  if (fieldNumber % 10 === 0) {
    const x = 8;
    return { x: x, y: y };
  } else if (fieldNumber % 10 >= 6) {
    const x = ((fieldNumber % 10) - 6) * 2;
    return { x: x, y: y };
  } else {
    const x = (fieldNumber % 10) * 2 - 1;
    return { x: x, y: y };
  }
}

function coordsToNum({ x, y }) {
  return y * 5 + (y % 2 === 0 ? (x + 1) / 2 : (x + 2) / 2);
}

function Field({ piece, white }) {
  if (white) {
    return <div className="field-white"></div>;
  } else if (!piece) {
    return <div className="field-black"></div>;
  } else {
    return (
      <div className="field-black">
        <div className={piece + "-piece"}></div>{" "}
      </div>
    );
  }
}

function handleCapture(movFrom, movTo, oldBoard) {
  let actualBoard = JSON.parse(JSON.stringify(oldBoard));
  let pieceToMove = actualBoard.find((elem) => elem.noOfField === movFrom);
  let pieceOnSi = numToCoords(pieceToMove.noOfField);
  let chain = getLongestCaptureChain(
    numToCoords(movFrom),
    movTo,
    actualBoard,
    getPieceOnBoard(pieceOnSi, actualBoard).color
  );
  for (const direction of chain) {
    let pieceToDeleteCoords = {
      x: pieceOnSi.x + direction.x,
      y: pieceOnSi.y + direction.y,
    };

    pieceOnSi.x += 2 * direction.x;
    pieceOnSi.y += 2 * direction.y;
    pieceToMove.noOfField = coordsToNum(pieceOnSi);

    let pieceToDeleteNum = coordsToNum(pieceToDeleteCoords);
    let pieceToDelete = actualBoard.find(
      (elem) => elem.noOfField === pieceToDeleteNum
    );
    pieceToDelete.noOfField = undefined;
  }

  return actualBoard;
}

function handleMove(movFrom, movTo, actualBoard) {
  return actualBoard.map((elem) => {
    if (elem.noOfField != movFrom) {
      return elem;
    }
    return { ...elem, noOfField: movTo };
  });
}

function handleTurn(move, pieces) {
  if (move.isCapture) {
    return handleCapture(move.movFrom, move.movTo, pieces);
  } else {
    return handleMove(move.movFrom, move.movTo, pieces);
  }
}

const addCoords = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({
  x: x1 + x2,
  y: y1 + y2,
});
const mulCoords = ({ x: x1, y: y1 }, num) => ({ x: x1 * num, y: y1 * num });

const getPieceOnBoard = (pieceCoords, pieces) =>
  pieces.find((elem) => elem.noOfField === coordsToNum(pieceCoords));

function getLongestCaptureChain(
  pieceCoords,
  fieldNumberTo,
  pieces,
  ogPieceColor,
  piecesAlreadyCaptured = []
) {
  if (coordsToNum(pieceCoords) === fieldNumberTo) return [];

  const possibleCaptures = [];

  for (let direction of Object.values(DIAGONALS)) {
    const pieceToCaptureCoords = addCoords(pieceCoords, direction);

    if (
      // sprawdzamy czy przeskakiwalismy juz przez pionka znajdujacego sie na polu ktore teraz rozważamy
      piecesAlreadyCaptured.find(
        (pos) =>
          pieceToCaptureCoords.x === pos.x && pieceToCaptureCoords.y === pos.y
      )
    )
      continue;

    const fieldAfterPieceToCaptureCoords = addCoords(
      pieceCoords,
      mulCoords(direction, 2)
    );
    if (
      getPieceOnBoard(pieceToCaptureCoords, pieces) &&
      getPieceOnBoard(pieceToCaptureCoords, pieces).color !== ogPieceColor &&
      !getPieceOnBoard(fieldAfterPieceToCaptureCoords, pieces)
    ) {
      possibleCaptures.push(direction);
    }
  }

  const chainsOfCaptures = [];

  for (const captureDirection of possibleCaptures) {
    const currentChain = [captureDirection];
    const pieceToCaptureCoords = addCoords(pieceCoords, captureDirection);

    const pieceCoordsAfterCapture = addCoords(
      pieceCoords,
      mulCoords(captureDirection, 2)
    );

    currentChain.push(
      ...getLongestCaptureChain(
        pieceCoordsAfterCapture,
        fieldNumberTo,
        pieces,
        ogPieceColor,
        [...piecesAlreadyCaptured, pieceToCaptureCoords]
      )
    );

    chainsOfCaptures.push(currentChain);
  }

  const longestChainLength = Math.max(
    ...chainsOfCaptures.map((chain) => chain.length)
  );

  //  where do we end?
  const longestChain = chainsOfCaptures.find(
    (chain) => chain.length === longestChainLength
  );

  return longestChain;
}

function Board() {
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
        <button className="navButton" onClick={() => previousMove()}>
          ⇦
        </button>
        <button
          className="navButton"
          onClick={() => setStopButton(!stopButtonClicked)}
        >
          {stopButtonClicked ? "▶" : "II"}
        </button>
        <button className="navButton" onClick={() => nextMove()}>
          ⇨
        </button>
      </div>
    </div>
  );
}

function MoveList() {
  let [playedMoves] = useContext(PlayedMovesContext);
  const whiteMoves = playedMoves.filter((elem, indx) => indx % 2 === 0);
  const blackMoves = playedMoves.filter((elem, indx) => indx % 2 === 1);
  const whiteList = whiteMoves.map((elem, i) => (
    <li key={i}>
      {elem[0]}-{elem[1]}
    </li>
  ));
  const blackList = blackMoves.map((elem, i) => (
    <li key={i}>
      {elem[0]}-{elem[1]}
    </li>
  ));
  return (
    <div>
      <h1>Moves List</h1>
      <div className="moves-list">
        <ul className="white-list">{whiteList}</ul>
        <ul>{blackList}</ul>
      </div>
    </div>
  );
}

function Title(props) {
  return (
    <div className="title">
      <span className="names">{props.names}</span>{" "}
      <span className="result">{props.result}</span>
    </div>
  );
}

function Navbar() {
  let [currentGame, setCurrentGame] = useContext(CurrentGameContext);
  let [boardHistory, setBoardHistory] = useContext(BoardHistoryContext);
  let [movIndex, setMovIndex] = useContext(MovIndexContext);
  let [playedMoves, setPlayedMoves] = useContext(PlayedMovesContext);

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

function App() {
  const [playedMoves, setPlayedMoves] = useState([]);
  const [currentGame, setCurrentGame] = useState(gamesDatabase[0]);
  const [boardHistory, setBoardHistory] = useState([DEFAULT_BOARD]);
  const [movIndex, setMovIndex] = useState(0);
  return (
    <div>
      <Title names={shownGame.title} result={shownGame.result} />
      <div className="container">
        <CurrentGameContext.Provider value={[currentGame, setCurrentGame]}>
          <PlayedMovesContext.Provider value={[playedMoves, setPlayedMoves]}>
            <MovIndexContext.Provider value={[movIndex, setMovIndex]}>
              <BoardHistoryContext.Provider
                value={[boardHistory, setBoardHistory]}
              >
                <Navbar />
                <Board />
              </BoardHistoryContext.Provider>
            </MovIndexContext.Provider>
            <MoveList />
          </PlayedMovesContext.Provider>
        </CurrentGameContext.Provider>
      </div>
    </div>
  );
}

export default App;
