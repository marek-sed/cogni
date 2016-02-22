import {UPDATE_SETUP} from './actionTypes.js';

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
    .then(() => alert('session created'))
    .catch(() => alert('failed to create a session'));
}
