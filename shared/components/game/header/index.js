import React from 'react';
import BaseInfo from './baseInfo.react.js';
import GameInfo from './gameInfo.react.js';
import Message from './message.react.js';

const Header = (props) => {

  return (
    <div className="header">
      <BaseInfo {...props} />
      <GameInfo {...props} />
      <Message {...props} />
    </div>
  )
}

export default Header;
