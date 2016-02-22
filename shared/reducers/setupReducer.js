import {fromJS} from 'immutable';
import {UPDATE_SETUP} from '../actions/actionTypes.js';

const initialState = fromJS({
  name:          '',
  numberOfGames: 4,
  gameTime:      70,
  turnTime:      20,
  score1:        10,
  score2:        50,
  score3:        100,
  score4:        5
});


function reducer(state = initialState, action={}) {

  switch(action.type) {
  case UPDATE_SETUP:
    const {key, value} = action.payload;
    return state.set(key, value);
  }

  return state;
}

export default reducer;
