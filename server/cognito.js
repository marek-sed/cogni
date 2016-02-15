import {Map, List, Record} from 'immutable';
import {Observable} from 'rx';

const PlayerRecord = Record({
  firstName: '',
  surname:   ''
});

let games = Map();
let rounds = Map();
let players = Map();

const makeGame = () => Map({
  isReady:      false,
  phase:        0,
  roles:        List(),
  Sender:       {},
  Receiver:     {},
  EavesDropper: {},
  rounds:       List()
})


const getGame = (game) => games.has(game) ? games.get(game) : makeGame();

export function registerPlayer(gameId, role, firstName, surname) {
  console.log('registering ', gameId, role);
  let game = getGame(gameId);
  if (game.get('roles').contains(role)) {
    return 'role is already taken';
  }

  game = game.update('roles', roles => roles.push(role));
  games = games.set(gameId, game);
  players = players.setIn([gameId, role], new PlayerRecord({firstName, surname}));
}

const isGameReady = (gameId) => {
  const game = games.get(gameId)
  return game.has('roles') && game.get('roles').size === 3;
}

const getRandomPosition = () => Math.floor(Math.random() * 8) + 1;
const getTokenState = () => ({signalPosition: getRandomPosition(),
                              endPosition:    getRandomPosition(),
                              tokenPosition:  4});
const makeRound = (id, role) => ({
  id:     id,
  onTurn: role,
  token:  getTokenState()
});

export function assignSocketTo(gameId, role, socket) {
  if(!games.has(gameId)) return;
  const gameRoom = 'Game' + gameId;
  games = games.setIn([gameId, 'gameRoom'], gameRoom);
  socket.join(gameRoom);
  games = games.setIn([gameId, 'sockets', role], socket);
  if(isGameReady(gameId)) {
    socket.emit('gameReady', true);
    socket.broadcast.to(gameRoom).emit('gameReady', true);
  }

  console.log('gameId - role', gameId, role);
  registerEvents(socket, gameId, role);
  subscribeToGame(gameId);
}

function registerEvents(socket, gameId, role) {
  switch(role) {
  case 'Sender' : registerSenderEvents(socket, gameId, role); break;
  case 'Receiver' : registerReceiverEvents(socket, gameId, role); break;
  case 'Eavesdropper': registerEavesdropperEvents(socket, gameId, role); break;
  }
}

function registerSenderEvents(socket, gameId, role) {
  const senderSources = {};
  senderSources.move = Observable.fromEvent(socket, 'move');
  senderSources.beginRound = Observable.fromEvent(socket, 'beginRound');
  senderSources.endTurn = Observable.fromEvent(socket, 'endRound');

  games = games.setIn([gameId, 'sources', role], senderSources);
}

function registerReceiverEvents(socket, gameId, role) {
  const receiverSources = {};
  receiverSources.move = Observable.fromEvent(socket, 'move');

  games = games.setIn([gameId, 'sources', role], receiverSources);
}

function registerEavesdropperEvents(socket, gameId, role) {
  const eavesdropperSources = {};
  eavesdropperSources.move = Observable.fromEvent(socket, 'move');

  games = games.setIn([gameId, 'sources', role], eavesdropperSources);
}


function subscribeToGame(gameId) {
  const phase = games.getIn([gameId, 'phase']);
  const SenderSource = games.getIn([gameId, 'sources', 'Sender']);
  const ReceiverSource = games.getIn([gameId, 'sources', 'Receiver']);
  const EavesdropperSource = games.getIn([gameId, 'sources', 'Eavesdropper']);

  const SenderSocket = games.getIn([gameId, 'sockets', 'Sender']);
  const ReceiverSocket = games.getIn([gameId, 'sockets', 'Receiver']);
  const EavesdropperSocket = games.getIn([gameId, 'sockets', 'EavesDropper']);
  
  SenderSource.beginRound.subscribe(beginRound(gameId));
  SenderSource.move.subscribe(nextPosition => moveTo(phase, nextPosition, [ReceiverSocket, EavesdropperSocket]));
  ReceiverSource.move.subscribe(nextPosition => moveTo(phase, nextPosition, [SenderSocket]))
}

const gameTime = 70 * 60 * 1000;
const turnTime = 20 * 1000;
const gameTimer = Observable.interval(500).timeInterval().pluck('interval')
        .scan((acc, x) => acc - x, gameTime).takeWhile(x => x > 0);
const turnTimer = Observable.interval(500).timeInterval().pluck('interval')
        .scan((acc, x) => acc - x, turnTime).takeWhile(x => x > 0);

const startGameTimer = (Sender, gameRoom) => gameTimer.subscribe(time => {Sender.broadcast.to(gameRoom).emit('gameTime', time); Sender.emit('gameTime', time)});

function beginRound(gameId) {
  return () => {
    const {Sender, Receiver, Eavesdropper} = games.getIn([gameId, 'sockets']).toJS();
    const gameRoom = games.getIn([gameId, 'gameRoom']);
    const phase = games.getIn([gameId, 'phase']);

    if(phase === 0) {
      startGameTimer(Sender, gameRoom);
      games = games.setIn([gameId, 'phase'], 1);
    }

    const roundId = rounds.size + 1;
    const round = makeRound(roundId, 'Sender');
    games = games.setIn([gameId, 'currentRoundId'], roundId);
    rounds = rounds.setIn([gameId, roundId], round);
    Sender.emit('round', round);
    Receiver.emit('round', round);

    if(phase === 2) {
      Eavesdropper.emit('round', round);
    }

    games.setIn([gameId, 'endRound'], turnTimer.subscribe(
      x => emitTurnTime(gameId, x),
      () => {},
      () => nextTurn(gameId)
    ));
  }
}

function emitTurnTime(gameId, time) {
  const {Sender, Receiver, Eavesdropper} = games.getIn([gameId, 'sockets']).toJS();
  const phase = games.getIn([gameId, 'phase']);

  Sender.emit('roundTime', time);
  Receiver.emit('roundTime', time);
  if (phase === 2) Eavesdropper.emit('roundTime', time);
}


function nextTurn(gameId) {
  const {Sender, Receiver, Eavesdropper} = games.getIn([gameId, 'sockets']).toJS();
  const phase = games.getIn([gameId, 'phase']);

  const nextRound = makeRound(rounds.size + 1, 'Receiver');
  Sender.emit('nextTurn', nextRound);
  Receiver.emit('nextTurn', nextRound);
  if (phase === 2) Eavesdropper.emit('endTurn', nextRound.set('onTurn', 'Eavesdropper'));

  games = games.setIn([gameId, 'endRound'],
                      turnTimer.subscribe(
                        x => emitTurnTime(gameId, x),
                        () => endRound(gameId)))
}

function endRound(gameId) {
  const {Sender, Receiver, Eavesdropper} = games.getIn([gameId, 'sockets']).toJS();
  const phase = games.getIn([gameId, 'phase']);

  Sender.emit('endRound');
  Receiver.emit('endRound');
  if (phase === 2) Eavesdropper.emit('endRound');
}

function moveTo(nextPosition, phase, [Receiver, Eavesdropper]) {
  Receiver.emit('move', nextPosition);
  if (Eavesdropper && phase === 2) Eavesdropper.emit('move', nextPosition);
}
