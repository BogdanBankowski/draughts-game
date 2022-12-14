import { useEffect, useState, createContext, useContext } from "react";
import "./App.css";

const TEST_GAME = [[32,28],[19,23],[28,19],[14,23],[37,32]];
const TEST_GAME2 = [[32,28],[18,22],[37,32],[12,18],[41,37],[7,12],[46,41],[1,7]];
const DEFAULT_BOARD = []

for (let i=0;i<50;i++){
  if (i<20) DEFAULT_BOARD.push({ noOfField: i+1, color: "black", type: 'piece' });
  else if(i>29) DEFAULT_BOARD.push({ noOfField: i+1, color: "white", type:'piece' });
}

// 1. make it pretty
// 2. visibly distinguish white/black field, white/black pieces

const PlayedMovesContext = createContext();



function Field({ piece, white }) {
  if (white){
    return <div className='field-white'></div>
  }
  else if(!piece){
    return <div className='field-black'></div>
  }
  else {
    return <div className='field-black'><div className={piece+'-piece'}></div> </div>
  }
}
// 2. allow stopping and resuming the game
// 3. allow going one movement forward and back

// 4. display a list of already played movements

// 5. allow playing different games

function isRowEven(field){
  return(field % 10 >5 ? true : false);
}
// normalne ruchy + bicia do tyłu i do przodu obsłużone. Brakuje ruchów damką bić damką i wielobić 
function handleMove(movFrom, movTo,actualBoard) {
 // let pieceToCapture = null;
  
// movFrom:19 movTo:28 doZbicia:23
 /* if(Math.abs(movFrom-movTo)===11){
    if(isRowEven(movFrom)){
      movFrom > movTo ? pieceToCapture = actualBoard.find(elem =>(elem.noOfField === movFrom-6)) : pieceToCapture = actualBoard.find(elem =>(elem.noOfField === movTo-6))
    } 
    else if(!isRowEven(movFrom)){
      movFrom > movTo ? pieceToCapture = actualBoard.find(elem =>(elem.noOfField === movFrom-5)) : pieceToCapture = actualBoard.find(elem =>(elem.noOfField === movTo-5))
    } 
  }
  else if(Math.abs(movFrom-movTo===9)){
    if(isRowEven(movFrom)){
      console.log('test1');
      movFrom > movTo ? pieceToCapture = actualBoard.find(elem =>(elem.noOfField === movFrom-5)) : pieceToCapture = actualBoard.find(elem =>(elem.noOfField === movTo-5))
    } 
    else if(!isRowEven(movFrom)){
      movFrom > movTo ? pieceToCapture = actualBoard.find(elem =>(elem.noOfField === movFrom-4)) : pieceToCapture = actualBoard.find(elem =>(elem.noOfField === movTo-4))
    } 
  }
  if(pieceToCapture==!null) pieceToCapture.noOfField = null; */
  console.log({actualBoard,movFrom,movTo});
  let pieceToMove = actualBoard.find(elem => (
    elem.noOfField === movFrom
  ));
  pieceToMove.noOfField = movTo;
  if (pieceToMove.noOfField>=46 && pieceToMove.color === 'black') pieceToMove.type = 'queen';
  else if(pieceToMove.noOfField<=5 && pieceToMove.color === 'white') pieceToMove.type = 'queen';

  return actualBoard.slice();
}



  function Board() {
  const [pieces, setPieces] = useState(DEFAULT_BOARD);
  const [stopButtonClicked, setStopButton] = useState(false);
  const [movIndex, setMovIndex] = useState(0);
  const gameLength = TEST_GAME2.length; // DO ZMIANY
  const [playedMoves, setPlayedMoves] = useContext(PlayedMovesContext);
  useEffect(() => {

    
   let gameInterval = setInterval(() => {
      
      if(!stopButtonClicked){
        if(movIndex<TEST_GAME2.length){
          setPieces(handleMove(TEST_GAME2[movIndex][0],TEST_GAME2[movIndex][1],pieces))
          setPlayedMoves(addMoveToPlayedList(playedMoves,[TEST_GAME2[movIndex][0],TEST_GAME2[movIndex][1]]));
          setMovIndex(movIndex+1);
        }
        else{
          clearInterval(gameInterval);
        }   
          
      }}
    , 1000)

    return () => clearInterval(gameInterval)

  }
  , [stopButtonClicked,pieces,movIndex]); // PYTANIE: PO CO TUTAJ movIndex
  
  let addMoveToPlayedList = function(actualList, move){
    let playedListToReturn = actualList.slice();
    playedListToReturn.push(move);
    return playedListToReturn;
  }

  let removeMoveFromPlayedList = function(actualList){
    let playedListToReturn = actualList.slice();
    playedListToReturn.pop();
    return playedListToReturn;
  }

  let previousMove = function(){
     if(movIndex-1>=0){
      setStopButton(true);
      handleMove(TEST_GAME2[movIndex-1][1],TEST_GAME2[movIndex-1][0],pieces);
      setPlayedMoves(removeMoveFromPlayedList(playedMoves));
      setMovIndex(movIndex-1)
    }
  }
  let nextMove = function(){
    if(movIndex+1<=gameLength){
      setStopButton(true);
      handleMove(TEST_GAME2[movIndex][0],TEST_GAME2[movIndex][1],pieces);
      setPlayedMoves(addMoveToPlayedList(playedMoves,[TEST_GAME2[movIndex][0],TEST_GAME2[movIndex][1]]));
      setMovIndex(movIndex+1);
    }
  }


  return <div className='board'>{Array(10)
    .fill()
    .map((_, y) => {
      return (
        <div className='row'>
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
    })} 
    <div className='navbar'>
    
    <button className='navButton' onClick = {() => previousMove()}>⇦</button>
    <button className='navButton' onClick={() => setStopButton(!stopButtonClicked)}>{stopButtonClicked?'▶':'II'}</button>
    <button className='navButton' onClick = {() => nextMove()}>⇨</button>
    </div>
    </div> 
   ;
}

// USE EFFECT, SETINTERVAL, SETTIMEOUT


function MoveList(){
  let [playedMoves,] = useContext(PlayedMovesContext);
  const whiteMoves = playedMoves.filter((elem,indx)=>indx%2===0);
  const blackMoves = playedMoves.filter((elem,indx)=>indx%2===1);
  const whiteList = whiteMoves.map((elem) => <li>{elem[0]}-{elem[1]}</li>);
  const blackList = blackMoves.map((elem) => <li>{elem[0]}-{elem[1]}</li>);
  return (
    <div>
    <h1>Moves List</h1>
    <div className='moves-list'>
      <ul className='white-list'>{whiteList}</ul>
      <ul>{blackList}</ul>
    </div>
    </div>
  )
}




function App() {
  const [playedMoves, setPlayedMoves] = useState([]);
  return (
    <div className='container'>
    <PlayedMovesContext.Provider value={[playedMoves, setPlayedMoves]}>
      <Board />
      <MoveList />
    </PlayedMovesContext.Provider>
    </div>
  )
}

export default App;