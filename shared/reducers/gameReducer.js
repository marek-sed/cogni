import {fromJS, Map} from 'immutable';
import {MOVE, INIT} from '../actions/actionTypes.js';

const player = fromJS({
  firstName: 'John',
  surname:   'Smith',
  role:      'Sender'
})

const gameState = fromJS({
  onTurn: 'Sender',
  phase:  0,
  round:  1,
  score1: 50,
  score2: 75
})

const initialState = fromJS({
  gameId:        1,
  isReady:       false,
  gameState:     gameState,
  player:        player,
  tokenPosition: 4,
  message:       'receiver on correct position',
})

export default function reducer(state = initialState, action = {}) {
  switch(action.type) {
  case INIT: {
    const {gameId, role, firstName, surname} = action.payload;
    const player = Map({firstName, surname, role})
    return state.set('gameId', gameId).set('player', player);
  }
  case MOVE: return state.set('tokenPosition', action.payload.nextPosition);
  }

  return state;
}
