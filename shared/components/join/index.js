import React  from 'react';
import { connect }            from 'react-redux';
import {update, submit} from '../../actions/formDataActions';
import InputRow from './inputRow.react.js';
import SelectRow from './selectRow.react.js';
import _ from 'lodash';

const roleOptions = [
  {value: '', label: ''},
  {value: 'Sender', label: 'Sender'},
  {value: 'Receiver', label: 'Receiver'},
  {value: 'Eavesdropper', label: 'Eavesdropper'}
];


const getGameOptions = count => _.range(1, count + 1).map(x => ({value: x, label: 'Game ' + x}));
const Join = ({numberOfGames, isActive, dispatch, firstName, surname, game, role}) => {
  console.log('session info ', numberOfGames, isActive);

  const _update = key => evt => dispatch(update(key, evt.target.value));
  const validate = (firstName, surname, game, role) => (firstName || surname || game || role);


  const submitForm = (e) => {
    if(!validate(firstName, surname, game, role)){
      alert('all fields are mandatory');
      e.preventDefault();
      return;
    }

    dispatch(submit(firstName, surname, game, role));
    e.preventDefault();
  };

  if(!isActive) {
    return <div>There is no active session</div>;
  }

  return (
    <div className="base00-background join-game-panel">
      <h1 className="base08">Cognito</h1>
      <span>welcome to cognito, select a game and role you have been assigned</span>

      <div className="form">
        <InputRow id="firstName" label="First Name"
          placeholder="Enter your first name"
          value={firstName}
          onChange={_update('firstName')} />
        <InputRow id="surname" label="Surname"
          placeholder="Enter your surname"
          value={surname}
          onChange={_update('surname')} />
        <SelectRow id="game" value={game} label="Select game to join"
          options={[{value: 0, label: ''}, ...getGameOptions(numberOfGames)]}
          onChange={_update('game')}/>
        <SelectRow id="role" value={role} label="Select role to play"
          options={roleOptions}
          onChange={_update('role')} />
        <input className="form-submit base05 base08-background" type="submit" value="Join" onClick={submitForm} />
      </div>
    </div>
  );
}


export default connect(state => ({...state.formData.toJS(),
                                  numberOfGames: state.sessionInfo.numberOfGames,
                                  isActive:  state.sessionInfo.isActive}))(Join);
