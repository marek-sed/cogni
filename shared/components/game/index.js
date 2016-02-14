import React, {Component} from 'react';
import {connect} from 'react-redux';
import Header from './header';
import Controls from './controls.react.js';
import BoardPanel from './boardPanel';
import io from 'socket.io-client';

class Game extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {gameId, player} = this.props;
    const socket = io({query: `gameId=${gameId}&role=${player.role}`});
    socket.emit('join', 'this is some text');
  }

  render() {
    const {isReady} = this.props;

    if (!isReady) {
      return <div className="waiting">Waiting for other players</div>
    }

    return (
      <div className="game-panel base00-background">
        <Header {...this.props} />
        <Controls {...this.props} />
        <BoardPanel {...this.props} />
      </div>
    );
  }
}

export default connect(state => ({...state.game.toJS()}))(Game); 
