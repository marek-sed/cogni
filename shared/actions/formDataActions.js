import {UPDATE, INIT } from './actionTypes';
import { routeActions } from 'react-router-redux';

export function update(key, value) {
  return {
    type:    UPDATE,
    payload: {
      key:   key,
      value: value
    }
  }
}

function join(firstName, surname, game, role) {
  return fetch('/join', {
    method:      'POST',
    headers:     {'Content-Type': 'application/json'},
    credentials: 'same-origin',
    body:        JSON.stringify({firstName, surname, game, role})
  })
}

function showError(error) {
    alert(error);
}

function handleResponse(response) {
  console.log(response, 'response is');
  if (response.ok) {
    return response;
  }

  return Promise.reject(response);
}

function initGame(firstName, surname, game, role) {
  return {
    type:    INIT,
    payload: {
      firstName: firstName,
      surname:   surname,
      gameId:    game,
      role:      role
    }
  }
}

export function submit(firstName, surname, game, role) {
  console.log(JSON.stringify({firstName, surname, game, role}));
  return dispatch => join(firstName, surname, game, role)
    .then(handleResponse)
    .then(() => {
      dispatch(initGame(firstName, surname, game, role));
      dispatch(routeActions.push('/game'));
    })
    .catch(error => {
      error.json().then(r => {
        console.log('error is', r)
        alert(r.error);
      });
    });
}

