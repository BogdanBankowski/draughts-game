const DIAGONALS = {
  northWest: { x: -1, y: -1 },
  northEast: { x: 1, y: -1 },
  southWest: { x: -1, y: 1 },
  southEast: { x: 1, y: 1 },
};

export const getPieceOnBoard = (pieceCoords, pieces) =>
  pieces.find((elem) => elem.noOfField === coordsToNum(pieceCoords));
export const isInBoard = ({ x, y }) => x < 10 && x > -1 && y > -1 && y < 10;

export const addCoords = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({
  x: x1 + x2,
  y: y1 + y2,
});
export const mulCoords = ({ x: x1, y: y1 }, num) => ({
  x: x1 * num,
  y: y1 * num,
});
export function numToCoords(fieldNumber) {
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

export function coordsToNum({ x, y }) {
  return y * 5 + (y % 2 === 0 ? (x + 1) / 2 : (x + 2) / 2);
}
export function handleCapture(movFrom, movTo, oldBoard) {
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

export function handleMove(movFrom, movTo, actualBoard) {
  return actualBoard.map((elem) => {
    if (elem.noOfField != movFrom) {
      return elem;
    }
    return { ...elem, noOfField: movTo };
  });
}

export function handleTurn(move, pieces) {
  if (move.isCapture) {
    return handleCapture(move.movFrom, move.movTo, pieces);
  } else {
    return handleMove(move.movFrom, move.movTo, pieces);
  }
}

export function getLongestCaptureChain(
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

    if (!isInBoard(fieldAfterPieceToCaptureCoords)) continue;
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

    // jeśli łańcuch się kończy na tym ruchu i nie jest to ruch wybrany przez gracza, pomiń
    if (
      currentChain.length === 1 &&
      coordsToNum(pieceCoordsAfterCapture) !== fieldNumberTo
    ) {
      continue;
    }
    chainsOfCaptures.push(currentChain);
  }

  if (chainsOfCaptures.length === 0) return [];

  const longestChainLength = Math.max(
    ...chainsOfCaptures.map((chain) => chain.length)
  );

  //  where do we end?
  const longestChain = chainsOfCaptures.find(
    (chain) => chain.length === longestChainLength
  );

  return longestChain;
}
