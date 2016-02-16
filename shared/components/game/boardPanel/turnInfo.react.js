import React from 'react';
import moment from 'moment';
import 'moment-duration-format';

const colorMap = {
  '':           '#383830',
  Sender:       '#f92672',
  Receiver:     '#a6e22e' ,
  Eavesdropper: '#f2971f'
}

const TurnInfo = ({player: {role}, currentRound: {onTurn}, roundTime}) => {

  const roleColor = colorMap[role];
  const observedRoleColor = colorMap[role === 'Sender' ? 'Receiver' : 'Sender'];
  role = role === 'Eavesdropper' ? 'ED' : role;
  const observedRole = role === 'Sender' ? 'Receiver' : 'Sender';

  const mineClassName = onTurn === role ? 'role-mine active-mine' : 'role-mine';
  const observedClassName = onTurn === observedRole ? 'role-observed active-observed' : 'role-observed';

  const formatTime = (time) => moment.duration(time, 'ms').format('ss');

  return (
    <div className="turn-info">
      <div style={{color: roleColor}} className={mineClassName}>{role}</div>
      <div className="time">{formatTime(roundTime)}</div>
      <div style={{color: observedRoleColor}} className={observedClassName}>{observedRole}</div>
    </div>
  )
}

TurnInfo.defaultProps = {
  myRole:       'Sender',
  observedRole: 'Receiver',
  onTurn:       'Sender'
}

export default TurnInfo;
