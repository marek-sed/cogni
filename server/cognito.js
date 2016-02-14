import {Map, List, Record} from 'immutable';

const PlayerRecord = Record({
  firstName: '',
  surname:   ''
});

let games = Map();
let players = Map();

const makeGame = () => Map({
  isReady:      false,
  phase:        0,
  roles:        List(),
  sender:       {},
  receiver:     {},
  eavesDropper: {},
  rounds:       List()
})


const getGame = (game) => games.has(game) ? games.get(game) : makeGame();

export function registerPlayer(gameId, role, firstName, surname) {
  let game = getGame(gameId);

  if (game.get('roles').has(role)) {
    return 'role is already taken';
  }

  game = game.update('roles', roles => roles.push(role));
  games = games.set(gameId, game);
  players = players.setIn([gameId, role], new PlayerRecord({firstName, surname}));
  console.log(games.toJS());
}
