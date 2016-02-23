import {fromJS, Map} from 'immutable';
import {MOVE, INIT, UPDATE_GAME, BEGIN_ROUND, BEGIN_ROUND_CONTINUE,
        OBSERVERS_TURN, END_TURN, END_ROUND,
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
  index:  0,
  onTurn: '',
  token:  token
})

const gameState = fromJS({
  phase:  1,
  score1: 0,
  score2: 0
})

const phaseChanger = fromJS({
  activeRequest:  false,
  actionRequired: false
})

const initialState = fromJS({
  gameId:          1,
  gameTime:        70 * 60 * 1000,
  roundTime:       20 * 1000,
  isStarted:       false,
  isReady:         false,
  gameState:       gameState,
  player:          player,
  roundInProgress: false,
  currentRound:    round,
  message:         '',
  phaseChanger:    phaseChanger
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
  case BEGIN_ROUND: return state.set('isStarted', true);
  case BEGIN_ROUND_CONTINUE: return state.set('currentRound', fromJS(action.payload.round))
      .set('roundInProgress', true);
  case OBSERVERS_TURN: return state.setIn(['currentRound', 'onTurn'], action.payload.role)
      .setIn(['currentRound', 'token', 'tokenPosition'], 4).setIn(['currentRound', 'token', 'senderEndPosition'], action.payload.senderEndPosition);
  case END_TURN: return state.setIn(['currentRound', 'onTurn'], '');
  case END_ROUND: return state.setIn(['currentRound', 'onTurn'], '')
      .update('gameState',gameState => gameState.merge(Map({phase:  action.payload.phase,
                                                            score1: action.payload.result.score1,
                                                            score2: action.payload.result.score2})))
      .set('message', action.payload.result.message)
      .set('roundInProgress', false);
  case PHASE_CHANGE: return state.setIn(['phaseChanger', 'activeRequest'], true)
      .setIn(['phaseChanger', 'actionRequired'], action.payload.actionRequired);
  case PHASE_CHANGE_CONFIRM: return state
      .update('gameState', gameState => gameState.set('phase', action.payload.phase))
                .update('phaseChanger', pc => pc.merge(phaseChanger));
  case PHASE_CHANGE_REJECT: return state.setIn(['phaseChanger', 'activeRequest'], false);
  }

  return state;
}
