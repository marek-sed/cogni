import React from 'react';
import LeftButton from './leftButton.react.js';
import RightButton from './rightButton.react.js';


const Controls = (props) => {
  return (
    <div className="controls">
      <LeftButton {...props}/>
      <RightButton {...props}/>
    </div>
  )
}

export default Controls;
