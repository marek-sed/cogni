import React from 'react';
import Tile from './tile.react.js';
import _ from 'lodash';

const Tiles = ({signalPosition, endPosition}) => {
  const getText = id => id === signalPosition ? 'signal'
                    : id === endPosition
                    ? 'end'
                    : '';

  const tiles = _.range(0, 9).map(x => <Tile key={x} text={getText(x)} />);
  return (
    <div className="board">
      {tiles}
    </div>
  )
}

Tiles.defaultProps = {
  signalPosition: 0,
  endPosition:    5
}

export default Tiles;
