import React from 'react';

const Token = ({position, opacity, color}) => {

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
    opacity:    opacity,
    top:        '50%',
    left:       '50%',
    transform:  translations[position],
    transition: '0.3s'
  }

  return (
      <svg style={style} width="60" height="60"><circle cx="30" cy="30" r="15" fill={color}></circle></svg>
  )
}

Token.defaultProps = {
  tokenPosition: 8,
  opacity: 1
}

export default Token;
