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
  { movFrom: 18, movTo: 23, isCapture: false },
  { movFrom: 37, movTo: 32, isCapture: false },
  { movFrom: 23, movTo: 29, isCapture: false },
  { movFrom: 34, movTo: 23, isCapture: true },
  { movFrom: 17, movTo: 22, isCapture: false },
  { movFrom: 28, movTo: 17, isCapture: true },
  { movFrom: 19, movTo: 26, isCapture: true },
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

function coordsToNum({ x, y }) {
  return y * 5 + (y % 2 === 0 ? (x + 1) / 2 : (x + 2) / 2);
}

function findDiagonally(fieldNumber, direction, distance) {
  const piece = numToCoords(fieldNumber);
  const pieceToReturn = {
    x: piece.x - direction.x * distance,
    y: piece.y - direction.y * distance,
  };
  return coordsToNum(pieceToReturn); // nr pola na ktore sie ruszymy
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
  let chain = getLongestCaptureChain(
    pieceToMove.noOfField,
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

  return actualBoard.slice();
}

function handleMove(movFrom, movTo, actualBoard) {
  return actualBoard.map((elem) => {
    if (elem.noOfField != movFrom) {
      return elem;
    }
    let newType;
    if (elem.noOfField >= 46 && elem.color === "black") newType = "queen";
    else if (elem.noOfField <= 5 && elem.color === "white") newType = "queen";
    else newType = "piece";
    return { ...elem, noOfField: movTo, type: newType };
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
  fieldNumberFrom,
  fieldNumberTo,
  pieces,
  ogPieceColor,
  piecesAlreadyCaptured = []
) {
  if (fieldNumberFrom === fieldNumberTo) return [];
  const pieceCoords = numToCoords(fieldNumberFrom);

  const possibleCaptureDirections = Object.values(DIAGONALS);

  const possibleCaptures = [];

  for (let direction of possibleCaptureDirections) {
    const pieceToCaptureCoords = addCoords(pieceCoords, direction);

    if (
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
    // @TODO remember which pieces were captured

    const co = coordsToNum(pieceCoordsAfterCapture);
    currentChain.push(
      ...getLongestCaptureChain(co, fieldNumberTo, pieces, ogPieceColor, [
        ...piecesAlreadyCaptured,
        pieceToCaptureCoords,
      ])
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
      setPieces(
        handleMove(
          TEST_GAME3[movIndex - 1].movTo,
          TEST_GAME3[movIndex - 1].movFrom,
          pieces
        )
      );
      setPlayedMoves(removeMoveFromPlayedList(playedMoves));
      setMovIndex(movIndex - 1);
    }
  };
  let nextMove = function () {
    if (movIndex + 1 <= gameLength) {
      setStopButton(true);
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
