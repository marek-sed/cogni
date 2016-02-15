import React from 'react';
import {startPhase2, backToPhase1} from '../../../actions/gameActions.js';

const LeftButton = ({dispatch, socket, currentRound: {id, onTurn}, gameState: {phase}, player: {role}}) => {
  if(id < 5 || onTurn || role === 'Eavesdropper') {
    return <span></span>;
  }

  if(phase === 1) return <button onClick={() => dispatch(startPhase2(socket))}>start phase 2</button>;
  if(phase === 2) return <button onClick={() => dispatch(backToPhase1(socket))}>back to phase 1</button>;

  return <span></span>;
}


export default LeftButton;
