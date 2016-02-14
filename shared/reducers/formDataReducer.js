import {fromJS} from 'immutable';
import {UPDATE} from '../actions/actionTypes.js';

const initialState = fromJS({
  firstName:      '',
  surname:        '',
  game:           0,
  role:           '',
});

function reducer(state = initialState, action = {}) {
  switch(action.type) {
  case UPDATE: {
    const {key, value} = action.payload;
    return state.set(key, value);
  }

  default: return state;
  }

  return state;
}

export default reducer;
