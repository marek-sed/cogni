import React, {Component} from 'react';
import Tiles from './tiles.react.js';
import Token from './token.react.js';
import {Observable} from 'rx'; 
import {move} from '../../../actions/gameActions.js';

const toMoveBy = evt => {
  console.log('evt', evt.which);
  switch(evt.which) {
    case 37: return -1;
    case 38: return -3;
    case 39: return 1;
    case 40: return 3;
    default: return 0;
  }
};

const canMove = (moveBy, tokenPosition) => {
  console.log('moveBy', moveBy);
  if(moveBy === -1 || moveBy === 1) {
    return Math.floor(tokenPosition / 3) === Math.floor((tokenPosition + moveBy) / 3);
  }
  
  return 0 <= tokenPosition + moveBy && tokenPosition + moveBy < 9;
}

class Board extends Component {

  componentDidMount() {
    const {dispatch} = this.props;

    this.disposeKeyUp = Observable
      .fromEvent(document.body, 'keyup')
      .map(toMoveBy)
      .throttle(300 /* ms */)
      .filter(moveBy => canMove(moveBy, this.props.tokenPosition))
      .subscribe(moveBy => dispatch(move(this.props.tokenPosition + moveBy)));
  }

  componentDidUnMount() {
    this.disposeKeyUp();
  }

  render() {
    return (
      <div className="tokenizer">
        <Tiles {...this.props} />
        <Token {...this.props} />
      </div>
    )
  }
}

export default Board;
