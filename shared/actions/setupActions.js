import {UPDATE_SETUP, UPDATE_SETUP_SUCCESS} from './actionTypes.js';

export function update(key, value) {
  return {
    type:    UPDATE_SETUP,
    payload: {key, value}
  }
}

function postSession(session) {
  return fetch('/createSession', {
    method:      'POST',
    headers:     {'Content-Type': 'application/json'},
    credentials: 'same-origin',
    body:        JSON.stringify(session)
  })
}

function endSessionPost() {
  return fetch('/endSession', {
    method:      'POST',
    headers:     {'Content-Type': 'application/json'},
    credentials: 'same-origin',
  })
}

function handleResponse(response) {
  console.log('response', response);
  if (response.ok) {
    return response;
  }

  const error = new Error(response);
  error.response = response;
  throw error;
}

export function createSession(session) {
  return dispatch => postSession(session)
    .then(handleResponse)
    .then(res => res.json())
    .then(res => dispatch(success(res)))
    .catch(() => dispatch(failed()));
}

export function endSession(_id) {
  return dispatch => {
    dispatch({type: 'END SESSION'});
    endSessionPost(_id)
    .then(handleResponse)
    .then(() => alert('session ended'))
    .catch(() => alert('failed to end session'));
  }
}

export function success(session) {
  return {
    type:    UPDATE_SETUP_SUCCESS,
    payload: {
      session: session
    }
  }
}

export function failed() {
  alert('failed something went wrong');
}

