import React from 'react';
import moment from 'moment';

const BaseInfo = ({firstName, surname, gameId}) => {

  const formatTime = () => moment().format('mm:ss');

  return (
    <div className="basic-info">
      <div>{`${firstName} ${surname}`}</div>
      <div style={{marginLeft: '-20px'}}>{`Game ${gameId}`}</div>
      <div>{`Time ${formatTime()}`}</div>
    </div>
  )
}

BaseInfo.defaultProps = {
  firstName: 'John',
  surname:   'Smith',
  gameId:    '1'
}

export default BaseInfo;
