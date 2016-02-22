import React, {Component} from 'react';
import {endSession} from '../actions/setupActions.js';

class ActiveSession extends Component {

  render() {
    const {dispatch, _id, name, numberOfGames, gameTime, turnTime, score1, score2, score3, score4} = this.props;
    const submit = () => dispatch(endSession(_id));
    return (
      <div>
        <div>{`Name ${name}`}</div>
        <div>{`Number of games ${numberOfGames}`}</div>
        <div>{`Game Time ${gameTime}`}</div>
        <div>{`Turn Time ${turnTime}`}</div>
        <div>{`Score gain success ${score1}`}</div>
        <div>{`Score gain when discovered ${score2}`}</div>
        <div>{`Score loss when discovered ${score3}`}</div>
        <div>{`Score gain when ed matches receiver ${score4}`}</div>
        <button style={{backgroundColor: '#57c5f7', marginTop: '20px', textAlign: 'right'}}
          onClick={submit}>End Session</button>
      </div>
    );
  }
}

export default connect(state => ({...state.setup.toJS()}))(ActiveSession);
