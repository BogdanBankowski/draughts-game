import { useEffect, useState } from "react";
import "./App.css";

// 1. make it pretty
// 2. visibly distinguish white/black field, white/black pieces
function Field({ piece, white }) {
  return <span>{white ? "_" : piece || "X"}</span>;
}

// 1. on component mount, play a set of movements defined in PDN format
// each movement should last 1 second
// the game should stop playing when the game's over

// 2. allow stopping and resuming the game
// 3. allow going one movement forward and back

// 4. display a list of already played movements

// 5. allow playing different games
function Board() {
  const [pieces, setPieces] = useState([
    { noOfField: 1, color: "W" },
    { noOfField: 40, color: "W" },
    { noOfField: 42, color: "B" },
  ]);

  useEffect(() => {
    setTimeout(() => {
      setPieces([
        { noOfField: 1, color: "W" },
        { noOfField: 40, color: "W" },
        { noOfField: 42, color: "B" },
      ])
    }, 3000)
  }, [])

  return Array(10)
    .fill()
    .map((_, y) => {
      return (
        <div>
          {Array(10)
            .fill()
            .map((_, x) => {
              const white = y % 2 === 0 ? x % 2 === 0 : x % 2 === 1;
              const noOfField =
                y * 5 + (y % 2 === 0 ? (x + 1) / 2 : (x + 2) / 2);

              const piece = pieces.find(
                (piece) => piece.noOfField === noOfField
              );

              return <Field white={white} piece={piece?.color} />;
            })}
        </div>
      );
    });
}

function App() {
  return <Board />;
}

export default App;
