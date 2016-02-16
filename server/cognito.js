import {Map, List, Record, fromJS} from 'immutable';
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
  registerEvents(socket, gameId, role);
  if(isGameReady(gameId)) {
    subscribeToGame(gameId, role);
    socket.emit('gameReady', true);
    socket.broadcast.to(gameRoom).emit('gameReady', true);
  }
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
  senderSources.endTurn = Observable.fromEvent(socket, 'endTurn');

  games = games.setIn([gameId, 'sources', role], senderSources);
}

function registerReceiverEvents(socket, gameId, role) {
  const receiverSources = {};
  receiverSources.move = Observable.fromEvent(socket, 'move');
  receiverSources.endTurn = Observable.fromEvent(socket, 'endTurn');

  games = games.setIn([gameId, 'sources', role], receiverSources);
}

function registerEavesdropperEvents(socket, gameId, role) {
  const eavesdropperSources = {};
  eavesdropperSources.move = Observable.fromEvent(socket, 'move');
  eavesdropperSources.endTurn = Observable.fromEvent(socket, 'endTurn');

  games = games.setIn([gameId, 'sources', role], eavesdropperSources);
}


function subscribeToGame(gameId) {
  const SenderSource = games.getIn([gameId, 'sources', 'Sender']);
  const ReceiverSource = games.getIn([gameId, 'sources', 'Receiver']);
  const EavesdropperSource = games.getIn([gameId, 'sources', 'Eavesdropper']);

  const SenderSocket = games.getIn([gameId, 'sockets', 'Sender']);
  const ReceiverSocket = games.getIn([gameId, 'sockets', 'Receiver']);
  const EavesdropperSocket = games.getIn([gameId, 'sockets', 'EavesDropper']);

  SenderSource.beginRound.subscribe(beginRound(gameId));
  SenderSource.move.subscribe(nextPosition => moveTo(gameId, nextPosition, 'Sender', [ReceiverSocket, EavesdropperSocket]));
  SenderSource.endTurn.subscribe(() => observersTurn(gameId));

  ReceiverSource.move.subscribe(nextPosition => moveTo(gameId, nextPosition, 'Receiver', [SenderSocket]))
  ReceiverSource.endTurn.subscribe(() => endRound(gameId));

  EavesdropperSource.move.subscribe(nextPosition => recordMovement(gameId, nextPosition, 'Eavesdropper'));
  EavesdropperSource.endTurn.zip(ReceiverSource.endTurn).subscribe(() => endRound(gameId));
}

const gameTime = 70 * 60 * 1000;
const turnTime = 5 * 1000;
const gameTimerSource = Observable.interval(500).timeInterval().pluck('interval') .scan((acc, x) => acc - x, gameTime);

const turnTimerSource = Observable.interval(500).timeInterval().pluck('interval') .scan((acc, x) => acc - x, turnTime);

const startGameTimer = (Sender, gameRoom) => gameTimerSource.takeWhile(x => x > 0).subscribe(time => {Sender.broadcast.to(gameRoom).emit('gameTime', time); Sender.emit('gameTime', time)});

function beginRound(gameId) {
  console.log('beginRound');
  return () => {
    const {Sender, Receiver, Eavesdropper} = games.getIn([gameId, 'sockets']).toJS();
    const gameRoom = games.getIn([gameId, 'gameRoom']);
    const phase = games.getIn([gameId, 'phase']);

    if(phase === 0) {
      startGameTimer(Sender, gameRoom);
      games = games.setIn([gameId, 'phase'], 1);
    }

    const gameRounds = rounds.get(gameId);
    const roundId = gameRounds ? gameRounds.size + 1 : 1;
    const startPosition = Map({position: 4, time: Date.now()});
    const round = makeRound(roundId, 'Sender');
    games = games.setIn([gameId, 'currentRoundId'], roundId);
    rounds = rounds.setIn([gameId, roundId], fromJS(round));
    rounds = rounds.setIn([gameId, roundId, 'moves', 'Sender'], List.of(startPosition));
    Sender.emit('round', round);
    Receiver.emit('round', round);

    if(phase === 2) {
      Eavesdropper.emit('round', round);
    }

    games = games.setIn([gameId, 'turnTimerSubscription'], turnTimerSource.takeWhile(x => x > 0).subscribe(
      x => emitTurnTime(gameId, x),
      () => {},
      () => observersTurn(gameId, roundId)
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


function observersTurn(gameId, roundId) {
  console.log('observersTurn');
  const {Sender, Receiver, Eavesdropper} = games.getIn([gameId, 'sockets']).toJS();
  const phase = games.getIn([gameId, 'phase']);
  const ttsub = games.getIn([gameId, 'turnTimerSubscription']);
  if(!ttsub.isDisposed) ttsub.dispose();

  const startPosition = Map({position: 4, time: Date.now()});
  rounds = rounds.setIn([gameId, roundId, 'moves', 'Receiver'], List.of(startPosition))
    .setIn([gameId, roundId, 'moves', 'Eavesdropper'], List.of(startPosition));

  const senderMoves = rounds.getIn([gameId, roundId, 'moves', 'Sender']);
  const senderEndPosition = senderMoves ? senderMoves.last().get('position') : 4;
  Sender.emit('observersTurn', {role: 'Receiver', senderEndPosition: senderEndPosition});
  Receiver.emit('observersTurn', {role: 'Receiver', senderEndPosition: senderEndPosition});
  if (phase === 2) Eavesdropper.emit('observersTurn', {role: 'Eavesdropper', senderEndPosition: senderEndPosition});

  games = games.setIn([gameId, 'turnTimerSubscription'],
                      turnTimerSource.takeWhile(x => x > 0).subscribe(
                        x => emitTurnTime(gameId, x),
                        () => {},
                        () => endRound(gameId)))
}

function endRound(gameId) {
  console.log('endRound');
  const {Sender, Receiver, Eavesdropper} = games.getIn([gameId, 'sockets']).toJS();
  const phase = games.getIn([gameId, 'phase']);
  const ttsub = games.getIn([gameId, 'turnTimerSubscription']);
  if(!ttsub.isDisposed) ttsub.dispose();

  Sender.emit('endRound', phase);
  Receiver.emit('endRound', phase);
  if (phase === 2) Eavesdropper.emit('endRound', phase);
}

function moveTo(gameId, nextPosition, role, [Sender, Receiver, Eavesdropper]) {
  const phase = games.getIn([gameId, 'phase']);

  recordMovement(gameId, nextPosition, role);
  if (Sender) Sender.emit('move', nextPosition);
  if (Receiver) Receiver.emit('move', nextPosition);
  if (Eavesdropper && phase === 2) Eavesdropper.emit('move', nextPosition);
}

function recordMovement(gameId, position, role) {
  const roundId = games.getIn([gameId, 'currentRoundId']);
  const time = Date.now();
  console.log('rounds', rounds.getIn([gameId, roundId, 'moves']).toJS());
  rounds = rounds.updateIn([gameId, roundId, 'moves', role],
              moves => moves.push(fromJS({position: position, time: time})))
}
