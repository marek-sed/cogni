import React, {Component} from 'react';
import {connect} from 'react-redux';
import io from 'socket.io-client';
import {Observable} from 'rx';
import {updateProgress} from '../actions/progressActions';
import _ from 'lodash';

class Progress extends Component {

  componentDidMount() {
    const {dispatch} = this.props;
    console.log(this.props);
    this.socket = io({query: `role=progress`});
    this.subscription = Observable.fromEvent(this.socket, 'updateProgress')
      .subscribe(data => dispatch(updateProgress(data)));
  }

  componentWillUnmount() {
    this.subscription.dispose();
  }

  render() {
    const {progress, joining} = this.props;
    console.log('progresss props ', this.props);

    const max1 = progress.length > 0 && _.maxBy(progress, o => o.score1).score1;
    const max2 = progress.length > 0 && _.maxBy(progress, o => o.score2).score2;

    const renderLines = progress.map((x, i) => {
      const bgColor = x.score1 === max1 ? '#f92672'
              : x.score2 === max2 ? '#fd971f' : 'white';

      return (
      <tr key={i} style={{backgroundColor: bgColor}}>
        <td>{x.gameName}</td>
        <td>{x.index}</td>
        <td>{x.phase}</td>
        <td>{x.score1}</td>
        <td>{x.score2}</td>
        <td>{x.time}</td>
      </tr>);
    });

      const renderJoiningCell = (player) => {
          if(player) {
              return <td>{player.frstName} {player.surname}</td>
          }

          return <td>not connected</td>;
      }
      const renderJoining = joining.map((x, i) => {
          return (
              <tr key={i}>
                  <td>{x.gameName}</td>
                  {renderJoiningCell(x.players.Sender)}
                  {renderJoiningCell(x.players.Receiver)}
                  {renderJoiningCell(x.players.Eavesdropper)}
              </tr>
          )
      })

    return (
      <div className="progress">
          <div>
              <h3>Joining</h3>
              <table>
                  <thead>
                      <tr>
                          <td>game name</td>
                          <td>Sender</td>
                          <td>Receiver</td>
                          <td>Eavesdropper</td>
                      </tr>
                  </thead>
                  <tbody>
                      {renderJoining}
                  </tbody>
              </table>
          </div>
          <div>
              <h3>Progress</h3>
        <table>
          <thead>
            <tr>
              <th>Game</th>
              <th>Round</th>
              <th>Phase</th>
              <th>Score SE</th>
              <th>Score ED</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {renderLines}
          </tbody>
        </table>
          </div>
      </div>
    )
  }
}

export default connect(state => ({...state.progress.toJS()}))(Progress);
