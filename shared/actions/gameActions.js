import {MOVE, UPDATE_GAME, PHASE_2, PHASE_1, BEGIN_ROUND, BEGIN_ROUND_CONTINUE, END_TURN} from './actionTypes.js';

export function move(nextPosition, socket) {
  if (socket) socket.emit('move', nextPosition);

  return {
    type:    MOVE,
    payload: {
      nextPosition: nextPosition
    }
  }
}

export function update(key, value) {
  return {
    type:    UPDATE_GAME,
    payload: {
      key:   key,
      value: value
    }
  }
}

export function beginRound(socket) {
  socket.emit('beginRound', {});
  return {
    type:    BEGIN_ROUND,
    payload: {}
  }
}

export function beginRoundContinue(round) {

  return {
    type:    BEGIN_ROUND_CONTINUE,
    payload: {
      round: round
    }
  }
}

export function endTurn() {
  return {
    type:    END_TURN,
    payload: {}
  }
}

export function startPhase2() {
  return {
    type:    PHASE_2,
    payload: {}
  }
}

export function backToPhase1() {
  return {
    type:    PHASE_1,
    payload: {}
  }
}
