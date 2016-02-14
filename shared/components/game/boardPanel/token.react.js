import React from 'react';

const Token = ({tokenPosition}) => {
  console.log('new position', tokenPosition);

  const translations = [
    'translate(-165px, -145px)',
    'translate(-15px, -145px)',
    'translate(135px, -145px)',
    'translate(-165px, -15px)',
    'translate(-15px, -15px)',
    'translate(135px, -15px)',
    'translate(-165px, 115px)',
    'translate(-15px, 115px)',
    'translate(135px, 115px)',
  ]

  const style = {
    position:   'absolute',
    top:        '50%',
    left:       '50%',
    transform:  translations[tokenPosition],
    transition: '0.3s'
  }

  return (
      <svg style={style} width="30" height="30"><circle cx="15" cy="15" r="15" fill="#f92672"></circle></svg>
  )
}

Token.defaultProps = {
  tokenPosition: 8
}

export default Token;
