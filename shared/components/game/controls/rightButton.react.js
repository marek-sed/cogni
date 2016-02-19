import React from 'react';
import {beginRound, endTurn} from '../../../actions/gameActions.js';

const RightButton = ({dispatch, socket, isStarted, currentRound: {onTurn}, player: {role}}) => {
  const _beginRound = () => dispatch(beginRound(socket));
  if(onTurn === role) return <button onClick={() => dispatch(endTurn(socket))}>end turn</button>;
  if(onTurn === '' && role === 'Sender' && !isStarted) return <button onClick={_beginRound}>start first round</button>;
  if(onTurn === '' && role === 'Sender' && isStarted) return <button onClick={_beginRound}>next round</button>;

  return <span></span>;
}

export default RightButton;
