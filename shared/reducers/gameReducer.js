import {fromJS, Map} from 'immutable';
import {MOVE, INIT, UPDATE_GAME, BEGIN_ROUND_CONTINUE} from '../actions/actionTypes.js';

const player = fromJS({
  firstName: 'John',
  surname:   'Smith',
  role:      'Sender'
})

const token = fromJS({
  tokenPosition:  4,
  endPosition:    4,
  signalPosition: 4
})

const round = fromJS({
  id:     1,
  onTurn: '',
  token:  token
})

const gameState = fromJS({
  phase:  0,
  score1: 0,
  score2: 0
})

const initialState = fromJS({
  gameId:       1,
  gameTime:     50 * 60 * 1000,
  roundTime:    10 * 1000,
  isReady:      false,
  gameState:    gameState,
  player:       player,
  currentRound: round,
  message:      'receiver on correct position',
})

export default function reducer(state = initialState, action = {}) {
  switch(action.type) {
  case INIT: {
    const {gameId, role, firstName, surname} = action.payload;
    const player = Map({firstName, surname, role})
    return state.set('gameId', gameId).set('player', player);
  }
  case MOVE: return state.setIn(
    ['currentRound', 'token', 'tokenPosition'],
    action.payload.nextPosition);
  case UPDATE_GAME: return state.set(action.payload.key, action.payload.value);
  case BEGIN_ROUND_CONTINUE: return state.set('currentRound', fromJS(action.payload.round))
  }

  return state;
}
