import {fromJS, Map} from 'immutable';
import {MOVE, INIT, UPDATE_GAME, BEGIN_ROUND_CONTINUE,
        OBSERVERS_TURN, END_ROUND,
        PHASE_CHANGE, PHASE_CHANGE_REJECT, PHASE_CHANGE_CONFIRM} from '../actions/actionTypes.js';

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
  phase:         0,
  score1:        0,
  score2:        0,
  activeRequest: true,
})

const initialState = fromJS({
  gameId:       1,
  gameTime:     70 * 60 * 1000,
  roundTime:    20 * 1000,
  isReady:      false,
  gameState:    gameState,
  player:       player,
  currentRound: round,
  message:      'no rounds played',
})

export default function reducer(state = initialState, action = {}) {
  switch(action.type) {
  case INIT: {
    const {gameId, role, firstName, surname} = action.payload;
    const player = Map({firstName, surname, role})
    return state.set('gameId', gameId).set('player', player);
  }
  case MOVE: return state.setIn(['currentRound', 'token', 'tokenPosition'], action.payload.nextPosition);
  case UPDATE_GAME: return state.set(action.payload.key, action.payload.value);
  case BEGIN_ROUND_CONTINUE: return state.set('currentRound', fromJS(action.payload.round))
  case OBSERVERS_TURN: return state.setIn(['currentRound', 'onTurn'], action.payload.role)
      .setIn(['currentRound', 'token', 'tokenPosition'], 4).setIn(['currentRound', 'token', 'senderEndPosition'], action.payload.senderEndPosition);
  case END_ROUND: return state.setIn(['currentRound', 'onTurn'], '')
      .update('gameState',gameState => gameState.merge(Map({phase:  action.payload.phase,
                                                            score1: action.payload.result.score1,
                                                            score2: action.payload.result.score2})))
      .set('message', action.payload.result.message);
  case PHASE_CHANGE: return state.setIn(['gameState', 'activeRequest'], true);
  case PHASE_CHANGE_CONFIRM: return state
      .updateIn(gameState => gameState.set('phase', action.payload.phase).set('activeRequest', false));
  case PHASE_CHANGE_REJECT: return state.setIn(['gameState', 'activeRequest'], false);
  }

  return state;
}
