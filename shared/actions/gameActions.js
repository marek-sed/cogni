import {MOVE} from './actionTypes.js';

export function move(nextPosition) {
  return {
    type:    MOVE,
    payload: {
      nextPosition: nextPosition
    }
  }
}
