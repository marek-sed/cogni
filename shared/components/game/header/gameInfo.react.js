import React from 'react';

const colorMap = {
  '':           '#383830',
  Sender:       '#f92672',
  Receiver:     '#a6e22e' ,
  Eavesdropper: '#f2971f'
}

const GameInfo = ({currentRound: {index}, player: {role}, gameState: { phase, score1, score2}}) => {
  const color = colorMap[role];

  return (
    <div className="game-info">
      <div className="round">
        {`Round ${index}`}
      </div>
      <div className="score">
        {`Score ${score1} : ${score2}`}
      </div>
      <div style={{color: color}} className="phase">
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
