import React from 'react';
import TurnInfo from './turnInfo.react.js';
import Board from './board.react.js';

const BoardPanel = (props) => {
  console.log(props);
  return (
    <div className="board-panel">
      <TurnInfo {...props} />
      <Board {...props} />
    </div>
  )
}

export default BoardPanel;
