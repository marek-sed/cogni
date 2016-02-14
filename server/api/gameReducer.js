import {fromJS} from 'immutable';

const makePlayer = (fn, sn, socket) => fromJS({
  firstName: fn,
  surname:   sn,
  socket:    socket,
});

const makeRound = () => fromJS({
  turn:              0,
  senderMoves:       [],
  receiverMoves:     [],
  eavesDropperMoves: []
})

const makeGame = () => fromJS({
  isReady:      false,
  phase:        0,                // 0 - no ed, 1 - ed
  sender:       {},
  receiver:     {},
  eavesDropper: {},
})

const initialState = fromJS({
  games: {
    1: makeGame()
  }
});

export function gameReducer(state = initialState, action = {}) {

  switch(action.type) {
    default: return state;
  }

  return state;
}
