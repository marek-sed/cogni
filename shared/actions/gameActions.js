import {MOVE, UPDATE_GAME,
        PHASE_CHANGE, PHASE_CHANGE_CONFIRM, PHASE_CHANGE_REJECT,
        BEGIN_ROUND, BEGIN_ROUND_CONTINUE, END_TURN,
        OBSERVERS_TURN, END_ROUND} from './actionTypes.js';

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

export function observersTurn({role, senderEndPosition}) {
  return {
    type:    OBSERVERS_TURN,
    payload: {
      role:              role,
      senderEndPosition: senderEndPosition
    }
  }
}

export function endTurn(socket) {
  socket.emit('endTurn');
  return {
    type:    END_TURN,
    payload: {}
  }
}

export function endRound({phase, result}) {

  return {
    type:    END_ROUND,
    payload: {
      phase:  phase,
      result: result
    }
  }
}

export function startPhase2(socket, phase) {
  socket.emit('phaseChange');
  return {
    type:    PHASE_CHANGE,
    payload: {}
  }
}
