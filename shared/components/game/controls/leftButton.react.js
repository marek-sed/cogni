import React from 'react';
import {changePhase} from '../../../actions/gameActions.js';

const LeftButton = ({dispatch, socket, currentRound: {index, onTurn}, gameState: {phase}, player: {role}}) => {
  if(role === 'Eavesdropper') {
    return <span></span>;
  }

  if(onTurn === '' && index > 1 && phase === 1) return <button className="button" onClick={() => dispatch(changePhase(socket, 2))}>start phase 2</button>;
  if(onTurn === '' && index > 1 && phase === 2) return <button className="button" onClick={() => dispatch(changePhase(socket, 1))}>back to phase 1</button>;

  return <span></span>;
}


export default LeftButton;
