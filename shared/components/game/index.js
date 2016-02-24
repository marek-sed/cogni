import React, {Component} from 'react';
import {connect} from 'react-redux';
import Header from './header';
import Controls from './controls';
import BoardPanel from './boardPanel';
import PhaseChanger from './phaseChanger.react.js';
import {update, move, beginRoundContinue, observersTurn, endRound, changePhaseRequest, changePhaseResponse} from '../../actions/gameActions';
import io from 'socket.io-client';
import {Observable} from 'rx';
import assign from 'object-assign';
import {orderBy} from 'lodash';

function registerEvents(socket, dispatch) {
  Observable.fromEvent(socket, 'move').subscribe(x => dispatch(move(x, false)));
  Observable.fromEvent(socket, 'gameTime').subscribe(time => dispatch(update('gameTime', time)));
  Observable.fromEvent(socket, 'roundTime').subscribe(time => dispatch(update('roundTime', time)));
  Observable.fromEvent(socket, 'gameReady').subscribe(x => dispatch(update('isReady', x)));
  Observable.fromEvent(socket, 'round').subscribe(round => dispatch(beginRoundContinue(round)));
  Observable.fromEvent(socket, 'observersTurn').subscribe(role => dispatch(observersTurn(role)));
  Observable.fromEvent(socket, 'endRound').subscribe(result => dispatch(endRound(result)));
  Observable.fromEvent(socket, 'changePhase').subscribe(actionRequired => dispatch(changePhaseRequest(actionRequired)));
  Observable.fromEvent(socket, 'changePhaseResponse').subscribe(response => dispatch(changePhaseResponse(response)))
}

const colorMap = {
  Sender:       '#f92672',
  Receiver:     '#a6e22e' ,
  Eavesdropper: '#f2971f'
}

const Progress = ({position, scores, role, gameId}) => {

  const color = position === 'right' ? colorMap[role]
               : role === 'Eavesdropper' ? colorMap['Sender'] : colorMap['Eavesdropper'];
  let style = {position: 'absolute',  display: 'flex', top: '20%'};
  const pos = position === 'left' ? {left: 0} : {right: 0};
  style = assign({}, style, pos);
  const sorted = orderBy(scores, ([_, score]) => score, ['desc']);
  console.log(sorted.map(([_, score]) => score));
  const body = sorted.map(([gameName, score], i) => {
    const highlight = gameName === gameId ? {color: color} : {color: '#777'};

    return <tr><td>{i + 1}</td><td style={highlight}>{score}</td></tr>
  });

  const leftHeader = role === 'Eavesdropper' ? 'SR' : 'E';
  const rightHeader = role.substr(0, 1);

  return (
    <div style={style}>
      <table className="progress-table">
        <thead>
          <tr><th>n</th><th>{position === 'left' ? leftHeader : rightHeader}</th></tr>
        </thead>
        <tbody>
          {body}
        </tbody>
      </table>
    </div>
  )
}


class Game extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {dispatch, gameId, player} = this.props;
    const socket = io({query: `gameId=${gameId}&role=${player.role}`});
    this.socket = socket;
    registerEvents(socket, dispatch);
  }

  render() {
    const {isReady, progress, gameId, player: {role}} = this.props;

    if (!isReady) {
      return <div className="waiting">Waiting for other players</div>
    }


    const leftScore = progress.map(x => role === 'Eavesdropper' ? [x.gameName, x.score1] : [x.gameName, x.score2]);
    const rightScore = progress.map(x => role === 'Eavesdropper' ? [x.gameName, x.score2] : [x.gameName, x.score1]);

    return (
      <div style={{position: 'relative', display: 'flex', height: '100%', width: '650px'}}>
       <div className="game-panel base00-background">
          <Header {...this.props} />
          <Controls {...this.props} socket={this.socket} />
          <BoardPanel {...this.props} socket={this.socket} />
          <PhaseChanger {...this.props} socket={this.socket} />
        </div>
       <Progress gameId={gameId} role={role} scores={leftScore} position="left" />
       <Progress gameId={gameId} role={role} scores={rightScore} position="right" />
      </div>
    );
  }
}

export default connect(state => ({...state.game.toJS()}))(Game);
