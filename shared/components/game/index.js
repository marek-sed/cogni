import React, {Component} from 'react';
import {connect} from 'react-redux';
import Header from './header';
import Controls from './controls';
import BoardPanel from './boardPanel';
import {update, move, beginRoundContinue, observersTurn, endRound} from '../../actions/gameActions';
import io from 'socket.io-client';
import {Observable} from 'rx';

function registerEvents(socket, dispatch) {
  Observable.fromEvent(socket, 'move').subscribe(x => dispatch(move(x, false)));
  Observable.fromEvent(socket, 'gameTime').subscribe(time => dispatch(update('gameTime', time)));
  Observable.fromEvent(socket, 'roundTime').subscribe(time => dispatch(update('roundTime', time)));
  Observable.fromEvent(socket, 'gameReady').subscribe(x => dispatch(update('isReady', x)));
  Observable.fromEvent(socket, 'round').subscribe(round => dispatch(beginRoundContinue(round)));
  Observable.fromEvent(socket, 'observersTurn').subscribe(role => dispatch(observersTurn(role)));
  Observable.fromEvent(socket, 'endRound').subscribe(phase => dispatch(endRound(phase)));
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
    const {isReady} = this.props;

    if (!isReady) {
      return <div className="waiting">Waiting for other players</div>
    }

    return (
      <div className="game-panel base00-background">
        <Header {...this.props} />
        <Controls {...this.props} socket={this.socket} />
        <BoardPanel {...this.props} socket={this.socket} />
      </div>
    );
  }
}

export default connect(state => ({...state.game.toJS()}))(Game); 
