import {Map, List, Seq, Record, fromJS} from 'immutable';
import {Observable} from 'rx';
import shortid from 'shoritd';

const PlayerRecord = Record({
  gameId:    0,
  firstName: '',
  surname:   ''
});

let games = Map();
let players = Map();
const initialScore = Map({score1: 0, score2: 0});

const getRandomPosition = () => Math.floor(Math.random() * 8) + 1;
const getTokenState = () => ({signalPosition: getRandomPosition(),
                              endPosition:    getRandomPosition(),
                              tokenPosition:  4});

const makeRound = (index, role) => fromJS({
  _id:    shortid.generate(),
  index:  index,
  onTurn: role,
  token:  getTokenState()
});

const makeGame = (gameName) => Map({
  _id:           shortid.generate(),
  gameName:      gameName,
  isReady:       false,
  isStarted:     false,
  phase:         1,
  activeRequest: false,
  score:         initialScore,
  rounds:        List(),
  Sender:        null,
  Receiver:      null,
  EavesDropper:  null,
  timer:         {}
})


const getGame = (gameName) => games.has(gameName) ? games.get(gameName) : makeGame(gameName);

export function registerPlayer(gameName, role, firstName, surname) {
  console.log('registering ', gameName, role);
  let game = getGame(gameName);
  if (game.get(role)) {
    return 'role is already taken';
  }

  game = game.set(role, true);
  games = games.set(gameName, game);
  players = players.setIn([gameName, role], new PlayerRecord({firstName, surname}));
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
    recordPlayers(gameName);
    subscribeToGame(gameName, role);
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

  SenderSource.beginRound.subscribe(beginRound(gameName));
  SenderSource.move.subscribe(nextPosition => moveTo(gameName, nextPosition, 'Sender', {ReceiverSocket, EavesdropperSocket}));
  SenderSource.endTurn.subscribe(() => evaluateSenderPosition(gameName));
  SenderSource.changePhaseRequest.subscribe(() => changePhaseRequest(gameName, {ReceiverSocket, EavesdropperSocket}));
  SenderSource.changePhaseResponse.subscribe(response => changePhaseResponse(gameName, {ReceiverSocket, EavesdropperSocket}, response));

  ReceiverSource.move.subscribe(nextPosition => moveTo(gameName, nextPosition, 'Receiver', {SenderSocket}))
  subscribeToEndOfRoundPhase1(gameName, ReceiverSource);
  ReceiverSource.changePhaseRequest.subscribe(() => changePhaseRequest(gameName, {SenderSocket, EavesdropperSocket}));
  ReceiverSource.changePhaseResponse.subscribe(response => changePhaseResponse(gameName, {SenderSocket, EavesdropperSocket}, response));

  EavesdropperSource.move.subscribe(nextPosition => recordMovement(gameName, nextPosition, 'Eavesdropper'));
}

function subscribeToEndOfRoundPhase1(gameName, receiverSource) {
  games = games.setIn([gameName, 'endOfRoundSubscription'],
                      receiverSource.endTurn.subscribe(() => evaluateEndOfRound(gameName)));
}

function subscribeToEndOfRoundPhase2(gameName, eavesdropperSource, receiverSource) {
  games = games.setIn([gameName, 'endOfRoundSubscription'],
                      eavesdropperSource.endTurn.zip(receiverSource.endTurn)
                      .subscribe(() => evaluateEndOfRound(gameName)));
}

const gameTime = 70 * 60 * 1000;
const turnTime = 20 * 1000;
const gameTimerSource = Observable.interval(500).timeInterval().pluck('interval') .scan((acc, x) => acc - x, gameTime);

const turnTimerSource = Observable.interval(500).timeInterval().pluck('interval') .scan((acc, x) => acc - x, turnTime);

const startGameTimer = (Sender, gameName) => {
  return gameTimerSource.takeWhile(x => x > 0).subscribe(time =>{
    Sender.broadcast.to(gameName).emit('gameTime', time);
    Sender.emit('gameTime', time);
    games.setIn([gameName, 'remainingTime'], time);
  });
};

function beginRound(gameName) {
  console.log('beginRound');
  return () => {
    const {Sender, Receiver, Eavesdropper} = games.getIn([gameName, 'sockets']).toJS();
    const phase = games.getIn([gameName, 'phase']);
    const isStarted = games.getIn([gameName, 'isStarted']);

    if(!isStarted) {
      startGameTimer(Sender, gameName);
      games = games.setIn([gameName, 'isStarted'], true);
    }

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

    if(phase === 2) {
      Eavesdropper.emit('round', round);
    }

    games = games.setIn([gameName, 'turnTimerSubscription'], turnTimerSource.takeWhile(x => x > 0).subscribe(
      x => emitTurnTime(gameName, x),
      () => {},
      () => evaluateSenderPosition(gameName)
    ));
  }
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
  const expectedEndPosition = lastRound.getIn(['token', 'tokenPosition']);
  const senderMoves = lastRound.getIn(['moves', 'Sender']);
  const actualEndPosition = senderMoves.last().get('position');
  const gameScore = games.getIn([gameName, 'score']);

  console.log('expected', expectedEndPosition, 'actual', actualEndPosition );
  if (expectedEndPosition === actualEndPosition) observersTurn(gameName);
  else endRound(gameName, {message: 'WRONG POSITION, sender on incorrect end position',
                         score1:  gameScore.get('score1'),
                         score2:  gameScore.get('score2')});
}

function getResultPhase1(expected, receiverPosition, gameScore) {
  if(expected === receiverPosition) return {message: 'SUCCESS, receiver on correct position',
                                            score1:  gameScore.get('score1'),
                                            score2:  gameScore.get('score2')};

  return {message: 'INCORRECT, receiver on incorrect position',
          score1:  gameScore.get('score1'),
          score2:  gameScore.get('score2')};
}

function getResultPhase2(expected, receiverPosition, eavesdropperPosition, gameScore) {
  if (expected === eavesdropperPosition && receiverPosition === expected) return {
    message:   'DISCOVERED, receiver and evasdropper on correct position',
    score1:    gameScore.get('score1') - 100,
    score2:    gameScore.get('score2') + 50,
    positions: [1, 1, 1]};

  if (expected === eavesdropperPosition && receiverPosition !== expected) return {
    message:   'DISCOVERED, receiver on wrong position',
    score1:    gameScore.get('score1') - 100,
    score2:    gameScore.get('score2') + 50,
    positions: [1, 0, 1]};

  // not discovered reciever correct
  if (expected !== eavesdropperPosition && receiverPosition === expected) return {
    message:   'NOT DISCOVERED, receiver on correct position',
    score1:    gameScore.get('score1') + 10,
    score2:    gameScore.get('score2'),
    positions: [1, 1, 0]};

  if (eavesdropperPosition === receiverPosition) return {
    message:   'NOT DISCOVERED, receiver and eavesdropper on same position',
    score1:    gameScore.get('score1'),
    score2:    gameScore.get('score2') + 5,
    positions: [1, 0, 2]}

  if (eavesdropperPosition !== receiverPosition) return {
    message:   'NOT DISCOVERED, receiver and eavesdropper on differnt position',
    score1:    gameScore.get('score1'),
    score2:    gameScore.get('score2'),
    positions: [1, 0, 0]}
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
  console.log('is ttsub disposed', ttsub, ttsub.isDisposed);
  if(ttsub !== 'disposed') ttsub.dispose();
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
                        () => evaluateEndOfRound(gameName)))
}

function endRound(gameName, result) {
  console.log('endRound');
  const {Sender, Receiver, Eavesdropper} = games.getIn([gameName, 'sockets']).toJS();
  const phase = games.getIn([gameName, 'phase']);
  const ttsub = games.getIn([gameName, 'turnTimerSubscription']);
  if(ttsub !== 'disposed') ttsub.dispose();
  const endOfRoundSub = games.getIn([gameName, 'endOfRoundSubscription']);
  if(endOfRoundSub && endOfRoundSub !== 'disposed') endOfRoundSub.dispose();

  recordResult(result);
  emitProgress();
  Sender.emit('endRound', {phase, result});
  Receiver.emit('endRound', {phase, result});
  if (phase === 2) Eavesdropper.emit('endRound', {phase, result});
}

function moveTo(gameName, nextPosition, role, {SenderSocket, ReceiverSocket, EavesdropperSocket}) {
  const phase = games.getIn([gameName, 'phase']);

  recordMovement(gameName, nextPosition, role);
  if (SenderSocket) SenderSocket.emit('move', nextPosition);
  if (ReceiverSocket) ReceiverSocket.emit('move', nextPosition);
  if (EavesdropperSocket && phase === 2) EavesdropperSocket.emit('move', nextPosition);
}

function changePhaseRequest(gameName, {SenderSocket, ReceiverSocket, EavesdropperSocket}) {
  const phase = games.getIn([gameName, 'phase']);
  console.log('change phase request');
  if (SenderSocket) SenderSocket.emit('changePhase', true);
  if (ReceiverSocket) ReceiverSocket.emit('changePhase', true);
  if (EavesdropperSocket && phase === 2) EavesdropperSocket.emit('changePhase', false);
}

function changePhaseResponse(gameName, {SenderSocket, ReceiverSocket, EavesdropperSocket}, response) {
  const phase = games.getIn([gameName, 'phase']);
  const nextPhase = phase === 1 ? 2 : 1;
  games = games.setIn([gameName, 'phase'], nextPhase);

  changeEndOfRoundSource(gameName, nextPhase, response);

  if(SenderSocket) SenderSocket.emit('changePhaseResponse', {response, phase: nextPhase});
  if(ReceiverSocket) ReceiverSocket.emit('changePhaseResponse', {response, phase: nextPhase});
  if(EavesdropperSocket) EavesdropperSocket.emit('changePhaseResponse', {response, phase: nextPhase});
}

function changeEndOfRoundSource(gameName, nextPhase, response) {
  if(!response) return;
  const sub = games.getIn([gameName, 'endOfRoundSubscription']);
  const ReceiverSource = games.getIn([gameName, 'sources', 'Receiver']);
  const EavesdropperSource = games.getIn([gameName, 'sources', 'Eavesdropper']);
  console.log(sub);
  if(sub && sub !== 'disposed') sub.dispose();

  games = games.setIn([gameName, 'endOfRoundSubscription'],
                      nextPhase === 2
                      ? subscribeToEndOfRoundPhase2(gameName, EavesdropperSource, ReceiverSource)
                      : subscribeToEndOfRoundPhase1(gameName, ReceiverSource))
}

function recordPlayers(gameName) {
  console.log(gameName, players.get(gameName).toJS());
}

function recordMovement(gameName, position, role) {
  const time = Date.now();
  games = games.updateIn([gameName, 'rounds'], rounds =>
                         rounds.update(-1,
                                       round => round.updateIn(['moves', role],
                                                               moves => moves.push(fromJS({
                                                                 position: position,
                                                                 time:     time})))));

  console.log('rounds', games.getIn([gameName, 'rounds', -1, 'moves']).toJS());
}

function recordResult(gameName, result) {
  const roundId = games.getIn([gameName, 'currentRoundId']);

  games = games.setIn([gameName, 'score', 'score1'], result.score1);
  games = games.setIn([gameName, 'score', 'score2'], result.score2);
  console.log('record result ')
  console.log('game', gameName, 'round', roundId, 'result', result );
}

let progress;
export function connectProgress(socket) {
  console.log('progress connected');
  progress = socket;
  emitProgress();
}

function emitProgress() {
  const data = Seq(games).reduce((acc, x, key) => (
    acc.push({
      gameName: key,
      round:    x.get('rounds').size,
      score1:   x.getIn(['score', 'score1']),
      score2:   x.getIn(['score', 'score2']),
      phase:    x.getIn(['phase']),
      time:     x.get('remainingTime')
    })), List([]));

  progress.emit('updateProgress', data.toJS());
}
