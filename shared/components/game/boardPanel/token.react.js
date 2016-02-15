import React from 'react';

const Token = ({currentRound: {onTurn, token: {tokenPosition}}, player: {role}}) => {

  console.log('new tokenPosition', tokenPosition);
  const translations = [
    'translate(-180px, -160px)',
    'translate(-30px, -160px)',
    'translate(120px, -160px)',
    'translate(-180px, -30px)',
    'translate(-30px, -30px)',
    'translate(120px, -30px)',
    'translate(-180px, 100px)',
    'translate(-30px, 100px)',
    'translate(120px, 100px)',
  ]

  const style = {
    position:   'absolute',
    top:        '50%',
    left:       '50%',
    transform:  translations[tokenPosition],
    transition: '0.3s'
  }

  const fillColor = !onTurn ? '#383830'
                  : onTurn === role
                  ? '#f92672'
                  : '#a6e22e';

  return (
      <svg style={style} width="60" height="60"><circle cx="30" cy="30" r="15" fill={fillColor}></circle></svg>
  )
}

Token.defaultProps = {
  tokenPosition: 8
}

export default Token;
