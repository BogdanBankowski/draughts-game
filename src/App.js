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

function coordsToNum(x, y) {
  return y * 5 + (y % 2 === 0 ? (x + 1) / 2 : (x + 2) / 2);
}

function findDiagonally(fieldNumber, direction, distance) {
  const piece = numToCoords(fieldNumber);
  const pieceToReturn = {
    x: piece.x - direction.x * distance,
    y: piece.y - direction.y * distance,
  };
  return coordsToNum(pieceToReturn.x, pieceToReturn.y); // nr pola na ktore sie ruszymy
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

function handleCapture(movFrom, movTo, actualBoard) {
  let pieceToMove = actualBoard.find((elem) => elem.noOfField === movFrom);
  let pieceOnSi = numToCoords(pieceToMove.noOfField);
  let direction = isCapturePossible(pieceToMove.noOfField, actualBoard);
  if (direction) {
    let pieceToDeleteCoords = {
      x: pieceOnSi.x + direction.x,
      y: pieceOnSi.y + direction.y,
    };

    pieceOnSi.x += 2 * direction.x;
    pieceOnSi.y += 2 * direction.y;
    pieceToMove.noOfField = coordsToNum(pieceOnSi.x, pieceOnSi.y);

    let pieceToDeleteNum = coordsToNum(
      pieceToDeleteCoords.x,
      pieceToDeleteCoords.y
    );
    let pieceToDelete = actualBoard.find(
      (elem) => elem.noOfField === pieceToDeleteNum
    );
    pieceToDelete.noOfField = undefined;
  }

  return actualBoard.slice();
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
  pieces.find(
    (elem) => elem.noOfField === coordsToNum(pieceCoords.x, pieceCoords.y)
  );

function isCapturePossible(fieldNumber, pieces) {
  const pieceCoords = numToCoords(fieldNumber);
  const piece = getPieceOnBoard(pieceCoords, pieces);

  const possibleCaptureDirections = Object.values(DIAGONALS);

  for (let direction of possibleCaptureDirections) {
    const pieceToCaptureCoords = addCoords(pieceCoords, direction);
    const fieldAfterPieceToCaptureCoords = addCoords(
      pieceCoords,
      mulCoords(direction, 2)
    );
    if (
      getPieceOnBoard(pieceToCaptureCoords, pieces)?.color !== piece.color &&
      !getPieceOnBoard(fieldAfterPieceToCaptureCoords, pieces)
    ) {
      return direction;
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
    let gameInterval = setTimeout(() => {
      if (!stopButtonClicked) {
        if (movIndex < TEST_GAME3.length) {
          setPieces(handleTurn(TEST_GAME3[movIndex], pieces));
          setPlayedMoves(
            addMoveToPlayedList(playedMoves, [
              TEST_GAME3[movIndex].movFrom,
              TEST_GAME3[movIndex].movTo,
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
                  const noOfField = coordsToNum(x, y);

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
