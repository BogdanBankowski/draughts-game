import { PlayedMovesContext } from "./App";
import { useEffect, useState, createContext, useContext } from "react";


export function MoveList() {
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
        <h1 className='moves-list-title'>Moves List</h1>
        <div className="moves-list">
          <ul className="white-list">{whiteList}</ul>
          <ul>{blackList}</ul>
        </div>
      </div>
    );
  }