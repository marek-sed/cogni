import React, {Component} from 'react';
import {connect} from 'react-redux';
import Slider from 'rc-slider';
import {update, createSession} from '../actions/setupActions.js';
import ActiveSession from './activeSession.react.js';

class Setup extends Component {

  render() {
    const {dispatch, isActive, name, numberOfGames, gameTime, turnTime, score1, score2, score3, score4} = this.props;
    if(isActive) {
      return <ActiveSession {...this.props} />
    }

    const updateName = evt => dispatch(update('name', evt.target.value));
    const updateSlider = key => value => dispatch(update(key, Number(value)));
    const submit = () => dispatch(createSession({name, numberOfGames, gameTime, turnTime, score1, score2, score3, score4}));
    return (
      <div className="progress">
        <div className="row">
          <label htmlFor="sessionName">Name of the session</label>
          <input placeholder="enter session name" style={{borderBottom: '1px solid #57c5f7', padding: '0'}} name="sessionName" value={name} onChange={updateName} />
        </div>
        <div className="row">
          <div>
            <label htmlFor="numberOfGames">Number of games</label>
            <div>{numberOfGames}</div>
          </div>
          <Slider min={1} max={10} dots={true} value={numberOfGames} onChange={updateSlider('numberOfGames')} />
        </div>
        <div className="row">
          <div>
            <label htmlFor="gameTime">Game time in minutes</label>
            <div>{gameTime}</div>
          </div>
          <Slider min={20} max={110} step={10}  dots={true} value={gameTime} onChange={updateSlider('gameTime')} />
        </div>
        <div className="row">
          <div>
            <label htmlFor="turnTime">Turn time in seconds</label>
            <div>{turnTime}</div>
          </div>
          <Slider min={5} max={60} step={5} dots={true} value={turnTime} onChange={updateSlider('turnTime')} />
        </div>
        <div className="row">
          <div>
            <label htmlFor="score1">Score gain when success</label>
            <div>{score1}</div>
          </div>
          <Slider min={5} max={100} step={5} value={score1} onChange={updateSlider('score1')} />
        </div>
        <div className="row">
          <div>
            <label htmlFor="score2">Score gain when discovered ED</label>
            <div>{score2}</div>
          </div>
          <Slider min={5} max={100} step={5} value={score2} onChange={updateSlider('score2')} />
        </div>
        <div className="row">
          <div>
            <label htmlFor="score3">Score loss when discovered S</label>
            <div>{score3}</div>
          </div>
          <Slider min={5} max={200} step={5} value={score3} onChange={updateSlider('score3')} />
        </div>
        <div className="row">
          <div>
            <label htmlFor="score4">Score gain when eavesdropper matches receiver</label>
            <div>{score4}</div>
          </div>
          <Slider min={5} max={25} step={5} dots={true} value={score4} onChange={updateSlider('score4')} />
        </div>
        <button style={{backgroundColor: '#57c5f7', marginTop: '20px', textAlign: 'right'}}
          onClick={submit}>Create Session</button>
      </div>
    )
  }
}

export default connect(state => ({...state.setup.toJS()}))(Setup);
