import { useEffect, useState, createContext, useContext } from "react";
import "./App.css";

const DIAGONALS = {
  northWest: { x: -1, y: -1 },
  northEast: { x: 1, y: -1 },
  southWest: { x: -1, y: 1 },
  southEast: { x: 1, y: 1 },
};

const TEST_GAME = [
  [32, 28],
  [19, 23],
  [28, 19],
  [14, 23],
  [37, 32],
];
const TEST_GAME2 = [
  [32, 28],
  [18, 22],
  [37, 32],
  [12, 18],
  [41, 37],
  [7, 12],
  [46, 41],
  [1, 7],
];
const TEST_GAME3 = [
  { movFrom: 32, movTo: 28, isCapture: false },
  { movFrom: 19, movTo: 23, isCapture: false },
  { movFrom: 28, movTo: 19, isCapture: true },
  { movFrom: 14, movTo: 23, isCapture: true },
  { movFrom: 37, movTo: 32, isCapture: false },
];
const DEFAULT_BOARD = [];

for (let i = 0; i < 50; i++) {
  if (i < 20)
    DEFAULT_BOARD.push({ noOfField: i + 1, color: "black", type: "piece" });
  else if (i > 29)
    DEFAULT_BOARD.push({ noOfField: i + 1, color: "white", type: "piece" });
}

const PlayedMovesContext = createContext();

function findDiagonally(fieldNumber, direction, distance) {
  const piece = numToSiPosition(fieldNumber);
  const pieceToReturn = {
    x: piece.x - direction.x * distance,
    y: piece.y - direction.y * distance,
  };
  return SiToNumPosition(pieceToReturn.x, pieceToReturn.y); // nr pola na ktore sie ruszymy
}

function numToSiPosition(fieldNumber) {
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

function SiToNumPosition(x, y) {
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

function handleMove(movFrom, movTo, actualBoard) {
  let pieceToMove = actualBoard.find((elem) => elem.noOfField === movFrom);
  pieceToMove.noOfField = movTo;
  if (pieceToMove.noOfField >= 46 && pieceToMove.color === "black")
    pieceToMove.type = "queen";
  else if (pieceToMove.noOfField <= 5 && pieceToMove.color === "white")
    pieceToMove.type = "queen";

  return actualBoard.slice();
}

function isCapturePossible(fieldNumber, actualBoard) {
  const piece = numToSiPosition(fieldNumber);

  if (
    actualBoard.find(
      (elem) => elem.noOfField === SiToNumPosition(piece.x + 1, piece.y + 1)
    )
  ) {
    if (
      !actualBoard.find(
        (elem) => elem.noOfField === SiToNumPosition(piece.x + 2, piece.y + 2)
      )
    ) {
      return DIAGONALS.southWest;
    }
  } else if (
    actualBoard.find(
      (elem) => elem.noOfField === SiToNumPosition(piece.x + 1, piece.y - 1)
    )
  ) {
    if (
      !actualBoard.find(
        (elem) => elem.noOfField === SiToNumPosition(piece.x + 2, piece.y - 2)
      )
    ) {
      return DIAGONALS.southEast;
    }
  } else if (
    actualBoard.find(
      (elem) => elem.noOfField === SiToNumPosition(piece.x - 1, piece.y + 1)
    )
  ) {
    if (
      !actualBoard.find(
        (elem) => elem.noOfField === SiToNumPosition(piece.x - 2, piece.y + 2)
      )
    ) {
      return DIAGONALS.northWest;
    }
  } else if (
    actualBoard.find(
      (elem) => elem.noOfField === SiToNumPosition(piece.x - 1, piece.y - 1)
    )
  ) {
    if (
      !actualBoard.find(
        (elem) => elem.noOfField === SiToNumPosition(piece.x - 2, piece.y - 2)
      )
    ) {
      return DIAGONALS.northEast;
    }
  }
  return null;
}

function Board() {
  const [pieces, setPieces] = useState(DEFAULT_BOARD);
  const [stopButtonClicked, setStopButton] = useState(false);
  const [movIndex, setMovIndex] = useState(0);
  const gameLength = TEST_GAME3.length; // DO ZMIANY
  const [playedMoves, setPlayedMoves] = useContext(PlayedMovesContext);
  useEffect(() => {
    let gameInterval = setInterval(() => {
      if (!stopButtonClicked) {
        if (movIndex < TEST_GAME3.length) {
          setPieces(
            handleMove(
              TEST_GAME3[movIndex].movFrom,
              TEST_GAME3[movIndex].movTo,
              pieces
            )
          );
          setPlayedMoves(
            addMoveToPlayedList(playedMoves, [
              TEST_GAME3[movIndex].movFrom,
              TEST_GAME3[movIndex].movTo,
            ])
          );
          setMovIndex(movIndex + 1);
        } else {
          clearInterval(gameInterval);
        }
      }
    }, 1000);

    return () => clearInterval(gameInterval);
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
      handleMove(
        TEST_GAME3[movIndex - 1].movTo,
        TEST_GAME3[movIndex - 1].movFrom,
        pieces
      );
      setPlayedMoves(removeMoveFromPlayedList(playedMoves));
      setMovIndex(movIndex - 1);
    }
  };
  let nextMove = function () {
    if (movIndex + 1 <= gameLength) {
      setStopButton(true);
      handleMove(
        TEST_GAME3[movIndex].movFrom,
        TEST_GAME3[movIndex].movTo,
        pieces
      );
      setPlayedMoves(
        addMoveToPlayedList(playedMoves, [
          TEST_GAME3[movIndex].movFrom,
          TEST_GAME3[movIndex].movTo,
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
            <div className="row">
              {Array(10)
                .fill()
                .map((_, x) => {
                  const white = y % 2 === 0 ? x % 2 === 0 : x % 2 === 1;
                  const noOfField = SiToNumPosition(x, y);
                  const piece = pieces.find(
                    (piece) => piece.noOfField === noOfField
                  );
                  return <Field white={white} piece={piece?.color} />;
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
  const whiteList = whiteMoves.map((elem) => (
    <li>
      {elem[0]}-{elem[1]}
    </li>
  ));
  const blackList = blackMoves.map((elem) => (
    <li>
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

function App() {
  const [playedMoves, setPlayedMoves] = useState([]);
  return (
    <div className="container">
      <PlayedMovesContext.Provider value={[playedMoves, setPlayedMoves]}>
        <Board />
        <MoveList />
      </PlayedMovesContext.Provider>
    </div>
  );
}

export default App;
