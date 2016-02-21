import driver from 'mongojs';

// const db = driver('mongodb://<dbuser>:<dbpassword>@ds055915.mongolab.com:55915/cognito');
const db = driver('mongodb://localhost/cognito', ['sessions', 'games', 'players']);

db.on('error', (error) => {
  console.log('db error ', error)
})

db.on('connect', () => {
  console.log('db connected');
})

export function insertSession(session) {
  
}

export function insertRound(gameId, round, result, phase) {
  const document = {
    
  }
}

export function createGame(game) {
  
}

export function insertPlayer(player) {

}

// database types
const Player = {
  gameId:    Number,
  firstName: String,
  lastName:  String
}

const Move = {
  position: Number,
  time:     Number
};

const Score = {
  score1: Number,
  score2: Number,
};

const Token = {
  signalPosition: Number,
  endPosition:    Number
}

const Round = {
  _id:               Number,
  index:             Number,
  senderMoves:       [Move],
  receiverMoves:     [Move],
  eavesdropperMoves: [Move],
  tokenInfo:         Token,
  phase:             Number,
  result:            Result,
};

// each property can have value 0 - wrong position, 1 - correct signal position
// eaves dropper has additional option 2 - same position as receiver
const Result = {
  sender:       Number,
  receiver:     Number,
  eavesdropper: Number
}

const Game = {
  sessionId: Number,
  gameId:    Number,
  date:      Date,
  score:     Score, // score of last round
  rounds:    [Round]
};
