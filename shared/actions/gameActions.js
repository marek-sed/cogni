import {MOVE, UPDATE_GAME,
        PHASE_CHANGE, PHASE_CHANGE_CONFIRM, PHASE_CHANGE_REJECT,
        BEGIN_ROUND, BEGIN_ROUND_CONTINUE, END_TURN,
        OBSERVERS_TURN, END_ROUND } from './actionTypes.js';

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

export function changePhase(socket, phase) {
  if(socket) socket.emit('changePhase', phase);
  return {
    type:    PHASE_CHANGE,
    payload: {
      actionRequired: false
    }
  }
}

export function changePhaseRequest(actionRequired) {
  return {
    type:    PHASE_CHANGE,
    payload: {
      actionRequired: actionRequired
    }
  }
}

export function changePhaseResponse({phase, response}) {
  return response ? changeConfirm(null, phase)
    : changeReject(null);
}

export function changeConfirm(socket, phase) {
  if(socket) socket.emit('changePhaseResponse', true);
  return {
    type:    PHASE_CHANGE_CONFIRM,
    payload: {
      phase: phase
    }
  }
}

export function changeReject(socket) {
  if(socket) socket.emit('changePhaseResponse', false);
  return {
    type:    PHASE_CHANGE_REJECT,
    payload: {}
  }
}
