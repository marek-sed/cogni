import React from 'react';

const GameInfo = ({currentRound: {id}, gameState: { phase, score1, score2}}) => {

  return (
    <div className="game-info">
      <div className="round">
        {`Round ${id}`}
      </div>
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
  score1: 10,
  score2: 15,
  phase:  5
}

export default GameInfo;
