import driver from 'mongojs';
import {Map} from 'immutable';

const db = driver('mongodb://marek:marek@ds055915.mongolab.com:55915/cognito',
                  ['sessions', 'games']);
//const db = driver('mongodb://localhost/cognito', ['sessions', 'games', 'players']);

db.on('error', (error) => {
  console.log('db error ', error)
})

db.on('connect', () => {
  console.log('db connected');
})

export function insertSession(session) {

}

export function insertRound(gameId, round, result, phase) {
  const document = round.delete('onTurn').merge(Map({result})).merge(Map({phase})).toJS();

  db.games.update(
    {_id: gameId},
    { $push:
      {rounds: document}},
    () => console.log('record round result ')
  )
}

export function insertGame(game, callback) {
  const document = {
    sessionId: 0,
    gameName:  game.get('gameName'),
    date:      new Date(),
    score:     game.get('score').toJS(),
    rounds:    [],
    players:   game.get('players')
  }

  let insertGameId;
  db.games.save(document, callback);

  return insertGameId;
}
