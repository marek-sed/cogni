import React from 'react';

const TurnInfo = ({myRole, observedRole, onTurn}) => {

  const mineClassName = onTurn === myRole ? 'role-mine active' : 'role-mine';
  const observedClassName = onTurn === observedRole ? 'role-observed active' : 'role-observed';
  return (
    <div className="turn-info">
      <div className={mineClassName}>{myRole}</div>
      <div className="time">20</div>
      <div className={observedClassName}>{observedRole}</div>
    </div>
  )
}

TurnInfo.defaultProps = {
  myRole:       'Sender',
  observedRole: 'Receiver',
  onTurn:       'Sender'
}

export default TurnInfo;
