import {UPDATE_SETUP_SUCCESS} from '../actions/actionTypes';

function reducer(state = window.__SESSION_INFO__, action) {
  console.log('session info reducer ', state)
  switch (action.type) {
    case UPDATE_SETUP_SUCCESS:
      return state.setIn('isActive', true);
  }
  return state;
}

export default reducer;
