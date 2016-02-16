import React from 'react';

const Token = ({position, opacity, color, radius, top, left}) => {

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
    top:        top,
    left:       left,
    transform:  translations[position],
    transition: '0.3s'
  }

  return (
    <svg style={style} width={radius * 4} height={radius * 4}>
      <circle cx={radius * 2} cy={radius * 2} r={radius} fill={color}></circle>
    </svg>
  )
}

Token.defaultProps = {
  tokenPosition: 8,
  opacity:       1
}

export default Token;
