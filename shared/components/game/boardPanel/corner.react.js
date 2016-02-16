import React from 'react';

const Corner = () => {

  const color = '#f92672';
  const style = {
    position:   'absolute',
    opacity:    1,
    top:        '0%',
    right:      '0%',
    transition: '0.3s'
  }

  return (
    <svg style={style} width="152" height="132"><path d="M132 0 L152 0 L152 16 Z" fill={color}></path></svg>
  )
}

Corner.defaultProps = {
  tokenPosition: 8,
  opacity:       1
}

export default Corner;
