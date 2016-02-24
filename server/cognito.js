import {Map, List, Seq, Record, fromJS} from 'immutable';
import {Observable} from 'rx';
import {insertGame, insertRound, insertSession, updateGameEnd} from './db.js';

console.log('cognito runs');
const PlayerRecord = Record({
  firstName: '',
  surname:   ''
});

let currentSession = Map({
  isActive: false
});

let games = Map();
let gameTimers = Map();
let subscriptions = Map();
const initialScore = Map({score1: 0, score2: 0});

const getRandomPosition = () => Math.floor(Math.random() * 8) + 1;
const getTokenState = () => ({signalPosition: getRandomPosition(),
                              endPosition:    getRandomPosition(),
                              tokenPosition:  4});

const makeRound = (index, role) => fromJS({
  index:  index,
  onTurn: role,
  token:  getTokenState(),
  moves:  {}
});

const makeGame = (gameName) => Map({
  gameName:      gameName,
  isReady:       false,
  isStarted:     false,
  phase:         1,
  activeRequest: false,
  score:         initialScore,
  rounds:        List(),
  Sender:        false,
  Receiver:      false,
  EavesDropper:  false,
  timer:         {}
})

const getGame = (gameName) => games.has(gameName) ? games.get(gameName) : makeGame(gameName);

export function createSession(session) {
  currentSession = currentSession.merge(Map(session));
  currentSession = currentSession.set('isActive', true);
  insertSession(currentSession, (err, doc) => {
    currentSession = currentSession.set('_id', doc._id);
    setupTimers(currentSession.get('gameTime'), currentSession.get('turnTime'));
    console.log('insert session', err);
  });

  return currentSession.toJS();
}

export function getSession() {
  return currentSession.toJS();
}

export function registerPlayer(gameName, role, firstName, surname) {
  console.log('registering ', gameName, role);
  let game = getGame(gameName);
  if (game.get(role)) {
    return 'role is already taken';
  }

  game = game.set(role, true);
  game = game.setIn(['players', role], new PlayerRecord({firstName, surname}));
  games = games.set(gameName, game);
  games = games.setIn([gameName, 'playes', role], new PlayerRecord({firstName, surname}));
}

const isGameReady = (gameName) => {
  const game = games.get(gameName)
  return game.get('Sender') && game.get('Receiver') && game.get('Eavesdropper');
}

export function assignSocketTo(gameName, role, socket) {
  if(!games.has(gameName)) return;
  socket.join(gameName);
  games = games.setIn([gameName, 'sockets', role], socket);
  registerEvents(socket, gameName, role);
  if(isGameReady(gameName)) {
    subscribeToGame(gameName, role);
    const game = games.get(gameName);
    recordGame(game);
    socket.emit('gameReady', true);
    socket.broadcast.to(gameName).emit('gameReady', true);
  }

}

function registerEvents(socket, gameName, role) {
  switch(role) {
  case 'Sender' : registerSenderEvents(socket, gameName, role); break;
  case 'Receiver' : registerReceiverEvents(socket, gameName, role); break;
  case 'Eavesdropper': registerEavesdropperEvents(socket, gameName, role); break;
  }
}

function registerSenderEvents(socket, gameName, role) {
  const senderSources = {};
  senderSources.move = Observable.fromEvent(socket, 'move');
  senderSources.beginRound = Observable.fromEvent(socket, 'beginRound');
  senderSources.endTurn = Observable.fromEvent(socket, 'endTurn');
  senderSources.changePhaseRequest = Observable.fromEvent(socket, 'changePhase');
  senderSources.changePhaseResponse = Observable.fromEvent(socket, 'changePhaseResponse');

  games = games.setIn([gameName, 'sources', role], senderSources);
}

function registerReceiverEvents(socket, gameName, role) {
  const receiverSources = {};
  receiverSources.move = Observable.fromEvent(socket, 'move');
  receiverSources.endTurn = Observable.fromEvent(socket, 'endTurn');
  receiverSources.changePhaseRequest = Observable.fromEvent(socket, 'changePhase');
  receiverSources.changePhaseResponse = Observable.fromEvent(socket, 'changePhaseResponse');

  games = games.setIn([gameName, 'sources', role], receiverSources);
}

function registerEavesdropperEvents(socket, gameName, role) {
  const eavesdropperSources = {};
  eavesdropperSources.move = Observable.fromEvent(socket, 'move');
  eavesdropperSources.endTurn = Observable.fromEvent(socket, 'endTurn');

  games = games.setIn([gameName, 'sources', role], eavesdropperSources);
}

function subscribeToGame(gameName) {
  const SenderSource = games.getIn([gameName, 'sources', 'Sender']);
  const ReceiverSource = games.getIn([gameName, 'sources', 'Receiver']);
  const EavesdropperSource = games.getIn([gameName, 'sources', 'Eavesdropper']);

  const SenderSocket = games.getIn([gameName, 'sockets', 'Sender']);
  const ReceiverSocket = games.getIn([gameName, 'sockets', 'Receiver']);
  const EavesdropperSocket = games.getIn([gameName, 'sockets', 'Eavesdropper']);
  subscriptions = subscriptions.set(gameName,
                                  List.of(
                                    SenderSource.beginRound.subscribe(beginRound(gameName)),
                                    SenderSource.move.subscribe(nextPosition => moveTo(gameName, nextPosition, 'Sender', {ReceiverSocket, EavesdropperSocket})),
                                    SenderSource.endTurn.subscribe(() => evaluateSenderPosition(gameName)),
                                    SenderSource.changePhaseRequest.subscribe(() => changePhaseRequest(gameName, {ReceiverSocket, EavesdropperSocket})),
                                    SenderSource.changePhaseResponse.subscribe(response => changePhaseResponse(gameName, {ReceiverSocket, EavesdropperSocket}, response)),

                                    ReceiverSource.move.subscribe(nextPosition => moveTo(gameName, nextPosition, 'Receiver', {SenderSocket})),
                                    ReceiverSource.changePhaseRequest.subscribe(() => changePhaseRequest(gameName, {SenderSocket, EavesdropperSocket})),
                                    ReceiverSource.changePhaseResponse.subscribe(response => changePhaseResponse(gameName, {SenderSocket, EavesdropperSocket}, response)),

                                    EavesdropperSource.move.subscribe(nextPosition => recordMovement(gameName, nextPosition, 'Eavesdropper'))
                                  ));
    subscribeToEndOfRoundPhase1(gameName, ReceiverSource);
}

function subscribeToEndOfRoundPhase1(gameName, receiverSource) {
  console.log('subscribeToEndOfRoundPhase1');
  const sub = receiverSource.endTurn.subscribe(() => evaluateEndOfRound(gameName));
  subscriptions = subscriptions.update(gameName, subs => subs.push(sub));
  games = games.setIn([gameName, 'endOfRoundSubscription'], sub);
}

function subscribeToEndOfRoundPhase2(gameName, eavesdropperSource, receiverSource) {
  console.log('subscribeToEndOfRoundPhase2');
  const sub = eavesdropperSource.endTurn.zip(receiverSource.endTurn).subscribe(() => evaluateEndOfRound(gameName));
  subscriptions = subscriptions.update(gameName, subs => subs.push(sub));
  games = games.setIn([gameName, 'endOfRoundSubscription'], sub);
}

let gameTimerSource;
let turnTimerSource;

function setupTimers(gameTime, turnTime) {
  const gt = gameTime * 60 * 1000;
  const tt = (turnTime + 0.5) * 1000;
  gameTimerSource = Observable.interval(500).timeInterval().pluck('interval').scan((acc, x) => acc - x, gt);
  turnTimerSource = Observable.interval(500).timeInterval().pluck('interval').scan((acc, x) => acc - x, tt);
}

const startGameTimer = (Sender, gameName) => {
  return gameTimerSource.takeWhile(x => x > 0)
    .subscribe(time => {
      Sender.broadcast.to(gameName).emit('gameTime', time);
      Sender.emit('gameTime', time);
      games.setIn([gameName, 'remainingTime'], time);
    },
               () => {},
               () => endGame(gameName));
};

const startGame = (Sender, gameName) => {
  gameTimers = gameTimers.set(gameName, startGameTimer(Sender, gameName));
  games = games.setIn([gameName, 'isStarted'], true);
};

function beginRound(gameName) {
  console.log('beginRound');
  return () => {
    const {Sender, Receiver, Eavesdropper} = games.getIn([gameName, 'sockets']).toJS();
    const phase = games.getIn([gameName, 'phase']);
    const isStarted = games.getIn([gameName, 'isStarted']);

    if(!isStarted) startGame(Sender, gameName);

    const rounds = games.getIn([gameName, 'rounds']);
    const roundIndex = rounds.size;
    const startPosition = Map({position: 4, time: Date.now()});
    const round = makeRound(roundIndex, 'Sender');
    games = games.updateIn([gameName, 'rounds'],
                           rounds => rounds.push(round));

    games = games.updateIn([gameName, 'rounds', roundIndex, 'moves'],
                           moves => moves.set('Sender', List.of(startPosition))
                           .set('Receiver', List.of(startPosition))
                           .set('Eavesdropper', List.of(startPosition)));

    Sender.emit('round', round);
    Receiver.emit('round', round);

    if(phase === 2) Eavesdropper.emit('round', round);

    games = games.setIn([gameName, 'turnTimerSubscription'], turnTimerSource.takeWhile(x => x > 0).subscribe(
      x => emitTurnTime(gameName, x),
      () => {},
      () => evaluateSenderPosition(gameName)
    ));
  };
}

function emitTurnTime(gameName, time) {
  const {Sender, Receiver, Eavesdropper} = games.getIn([gameName, 'sockets']).toJS();
  const phase = games.getIn([gameName, 'phase']);

  Sender.emit('roundTime', time);
  Receiver.emit('roundTime', time);
  if (phase === 2) Eavesdropper.emit('roundTime', time);
}

function evaluateSenderPosition(gameName) {
  console.log('evaluteSenderPosition');
  const lastRound = games.getIn([gameName, 'rounds']).last();
  const expectedEndPosition = lastRound.getIn(['token', 'endPosition']);
  const senderMoves = lastRound.getIn(['moves', 'Sender']);
  const actualEndPosition = senderMoves.last().get('position');
  const gameScore = games.getIn([gameName, 'score']);

  console.log('expected', expectedEndPosition, 'actual', actualEndPosition, gameName, gameScore );
  if (expectedEndPosition === actualEndPosition) observersTurn(gameName);
  else endRound(gameName, {message:   'WRONG POSITION, sender on incorrect end position',
                           score1:    gameScore.get('score1'),
                           score2:    gameScore.get('score2'),
                           positions: [0]});
}

function getResultPhase1(expected, receiverPosition, gameScore) {
  if(expected === receiverPosition) return {message:   'SUCCESS, receiver on correct position',
                                            score1:    gameScore.get('score1'),
                                            score2:    gameScore.get('score2'),
                                            positions: [1, 1]};

  return {message:   'INCORRECT, receiver on incorrect position',
          score1:    gameScore.get('score1'),
          score2:    gameScore.get('score2'),
          positions: [1, 0]};
}

function getResultPhase2(expected, receiverPosition, eavesdropperPosition, gameScore) {
  if (expected === eavesdropperPosition && receiverPosition === expected) return {
    message:   'DISCOVERED, receiver and evasdropper on correct position',
    score1:    gameScore.get('score1') - currentSession.get('score3'),
    score2:    gameScore.get('score2') + currentSession.get('score2'),
    positions: [1, 1, 1]};

  if (expected === eavesdropperPosition && receiverPosition !== expected) return {
    message:   'DISCOVERED, receiver on wrong position',
    score1:    gameScore.get('score1') - currentSession.get('score3'),
    score2:    gameScore.get('score2') + currentSession.get('score2'),
    positions: [1, 0, 1]};

  // not discovered reciever correct
  if (expected !== eavesdropperPosition && receiverPosition === expected) return {
    message:   'NOT DISCOVERED, receiver on correct position',
    score1:    gameScore.get('score1') + currentSession.get('score1'),
    score2:    gameScore.get('score2'),
    positions: [1, 1, 0]};

  if (eavesdropperPosition === receiverPosition) return {
    message:   'NOT DISCOVERED, receiver and eavesdropper on same position',
    score1:    gameScore.get('score1'),
    score2:    gameScore.get('score2') + currentSession.get('score4'),
    positions: [1, 0, 2]
  };

  if (eavesdropperPosition !== receiverPosition) return {
    message:   'NOT DISCOVERED, receiver and eavesdropper on differnt position',
    score1:    gameScore.get('score1'),
    score2:    gameScore.get('score2'),
    positions: [1, 0, 0]
  };
}

function evaluateEndOfRound(gameName) {
  console.log('evaluate end of round');
  const currentRound = games.getIn([gameName, 'rounds']).last();
  const gameScore = games.getIn([gameName, 'score']);
  const phase = games.getIn([gameName, 'phase']);
  const expectedEndPostion = currentRound.getIn(['token', 'signalPosition']);
  const receiverMoves = currentRound.getIn(['moves', 'Receiver']);
  const eavesdropperMoves = currentRound.getIn(['moves', 'Eavesdropper']);
  const receiverEndPosition = receiverMoves.last().get('position');
  const eavesdropperEndPosition = eavesdropperMoves.last().get('position');

  const result = phase === 1
          ? getResultPhase1(expectedEndPostion, receiverEndPosition, gameScore)
          : getResultPhase2(expectedEndPostion, receiverEndPosition, eavesdropperEndPosition, gameScore);

  endRound(gameName, result);
}

function observersTurn(gameName) {
  console.log('observersTurn');
  const ttsub = games.getIn([gameName, 'turnTimerSubscription']);
  ttsub.dispose();
  const {Sender, Receiver, Eavesdropper} = games.getIn([gameName, 'sockets']).toJS();
  const phase = games.getIn([gameName, 'phase']);

  const currentRound = games.getIn([gameName, 'rounds']).last();
  const senderMoves = currentRound.getIn(['moves', 'Sender']);
  const senderEndPosition = senderMoves.last().get('position');
  Sender.emit('observersTurn', {role: 'Receiver', senderEndPosition: senderEndPosition});
  Receiver.emit('observersTurn', {role: 'Receiver', senderEndPosition: senderEndPosition});
  if (phase === 2) Eavesdropper.emit('observersTurn', {role: 'Eavesdropper', senderEndPosition: senderEndPosition});

  games = games.setIn([gameName, 'turnTimerSubscription'],
                      turnTimerSource.takeWhile(x => x > 0).subscribe(
                        x => emitTurnTime(gameName, x),
                        () => {},
                        () => evaluateEndOfRound(gameName)));
}

function endRound(gameName, result) {
  console.log('endRound', result);
  const {Sender, Receiver, Eavesdropper} = games.getIn([gameName, 'sockets']).toJS();
  const phase = games.getIn([gameName, 'phase']);
  const ttsub = games.getIn([gameName, 'turnTimerSubscription']);
  ttsub.dispose();

  recordRound(gameName, result);
  const progress = getProgress();
  emitProgress(progress);
  Sender.emit('endRound', {phase, result, progress});
  Receiver.emit('endRound', {phase, result, progress});
  if (phase === 2) Eavesdropper.emit('endRound', {phase, result, progress});
}

function endGame(gameName, endReason = 'finished') {
  const sub = gameTimers.get(gameName);
  console.log('sub', sub);
  if(!sub.m.isDisposed) sub.dispose();

  cleanSubscriptions(gameName);
  updateGameEnd(games.get(gameName), endReason);
  games = games.delete(gameName);
  if(games.isEmpty()) {
    currentSession = Map({isActive: false});
  }
}

function cleanSubscriptions(gameName) {
  const gameSubs = subscriptions.get(gameName);
  gameSubs.forEach(sub => sub.dispose());
}

export function endSession() {
  const names = games.toList().flatMap(game => game.get('gameName'));
  console.log(names);
  console.log(gameTimers);
  names.forEach(x => endGame(x, 'terminated'));
  games = Map();
  gameTimers = Map();
}

function moveTo(gameName, nextPosition, role, {SenderSocket, ReceiverSocket, EavesdropperSocket}) {
  const phase = games.getIn([gameName, 'phase']);

  recordMovement(gameName, nextPosition, role);
  if (SenderSocket) SenderSocket.emit('move', nextPosition);
  if (ReceiverSocket) ReceiverSocket.emit('move', nextPosition);
  if (EavesdropperSocket && phase === 2) EavesdropperSocket.emit('move', nextPosition);
}

function changePhaseRequest(gameName, {SenderSocket, ReceiverSocket, EavesdropperSocket}) {
  if (SenderSocket) SenderSocket.emit('changePhase', true);
  if (ReceiverSocket) ReceiverSocket.emit('changePhase', true);
  if (EavesdropperSocket) EavesdropperSocket.emit('changePhase', false);
}

function changePhaseResponse(gameName, {SenderSocket, ReceiverSocket, EavesdropperSocket}, response) {
  const phase = games.getIn([gameName, 'phase']);
  let nextPhase = phase;

  if(response) {
    nextPhase = phase === 1 ? 2 : 1;
    games = games.setIn([gameName, 'phase'], nextPhase);
    changeEndOfRoundSource(gameName, nextPhase);
  }

  if(SenderSocket) SenderSocket.emit('changePhaseResponse', {response, phase: nextPhase});
  if(ReceiverSocket) ReceiverSocket.emit('changePhaseResponse', {response, phase: nextPhase});
  if(EavesdropperSocket) EavesdropperSocket.emit('changePhaseResponse', {response, phase: nextPhase});
}

function changeEndOfRoundSource(gameName, nextPhase) {
  const sub = games.getIn([gameName, 'endOfRoundSubscription']);
  const ReceiverSource = games.getIn([gameName, 'sources', 'Receiver']);
  const EavesdropperSource = games.getIn([gameName, 'sources', 'Eavesdropper']);
  sub.dispose();

  if (nextPhase === 2) subscribeToEndOfRoundPhase2(gameName, EavesdropperSource, ReceiverSource)
  else subscribeToEndOfRoundPhase1(gameName, ReceiverSource);
}

function recordMovement(gameName, position, role) {
  const time = Date.now();
  games = games.updateIn([gameName, 'rounds'], rounds =>
                         rounds.update(-1,
                                       round => round.updateIn(['moves', role],
                                                               moves => moves.push(fromJS({
                                                                 position: position,
                                                                 time:     time})))));
}

function recordRound(gameName, result) {
  games = games.setIn([gameName, 'score', 'score1'], result.score1);
  games = games.setIn([gameName, 'score', 'score2'], result.score2);

  const currentRound = games.getIn([gameName, 'rounds']).last();
  const phase = games.getIn([gameName, 'phase']);
  const gameId = games.getIn([gameName, '_id']);
  insertRound(gameId, currentRound, result, phase);
}

function recordGame(game) {
  console.log('record game');
  const gameName = game.get('gameName');
  const sessionId = currentSession.get('_id');
  insertGame(sessionId, game, (err, doc) => {
    games = games.setIn([gameName, '_id'], doc._id);
    console.log('record game', err);
  });
}

let progress;
export function connectProgress(socket) {
  console.log('progress connected');
  progress = socket;
  emitProgress(getProgress());
}

function getProgress() {
  return Seq(games).reduce((acc, x) => (
    acc.push({
      gameName: x.get('gameName'),
      round:    x.get('rounds').size,
      score1:   x.getIn(['score', 'score1']),
      score2:   x.getIn(['score', 'score2']),
      phase:    x.getIn(['phase']),
      time:     x.get('remainingTime')
    })), List([]));
}

function emitProgress(data) {
  if(progress) progress.emit('updateProgress', data.toJS());
}
