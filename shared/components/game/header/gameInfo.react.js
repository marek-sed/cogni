import React from 'react';

const GameInfo = ({phase, score1, score2}) => {

  return (
    <div className="game-info">
      <div className="score">
        {`Score ${score1} : ${score2}`}
      </div>
      <div className="phase">
        <div>{`Phase ${phase}`}</div>
      </div>
    </div>
  )
}

GameInfo.defaultProps = {
  score1: 50,
  score2: 75,
  phase:  0
}

export default GameInfo;
