import {fromJS} from 'immutable';
import {UPDATE_PROGRESS} from '../actions/actionTypes.js';
import moment from 'moment';

const initialState = fromJS({data: [
  {gameId: 0, phase: 1, score1: 350, score2: 90, time: moment(Date.now()).format('mm:ss')},
  {gameId: 1, phase: 0, score1: 50, score2: 1290,time: moment(Date.now()).format('mm:ss')},
  {gameId: 2, phase: 1, score1: 50, score2: 290,time: moment(Date.now()).format('mm:ss')},
  {gameId: 3, phase: 0, score1: 150, score2: 90, time: moment(Date.now()).format('mm:ss')},
  {gameId: 4, phase: 1, score1: 450, score2: 90, time: moment(Date.now()).format('mm:ss')},
]});

function reducer(state = initialState, action = {}) {

  switch(action.type) {
  case UPDATE_PROGRESS: return state.set('data', action.payload.progress);
  }

  return state;
}

export default reducer;
