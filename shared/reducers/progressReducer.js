import {fromJS} from 'immutable';
import {UPDATE_PROGRESS} from '../actions/actionTypes.js';

const initialState = fromJS({progress: [], joining: []});

function reducer(state = initialState, action = {}) {

  switch(action.type) {
  case UPDATE_PROGRESS: return state.set('progress', action.payload.progress)
      .set('joining', action.payload.joining);
  }

  return state;
}

export default reducer;
