import React from 'react';
import moment from 'moment';
import 'moment-duration-format';

const BaseInfo = ({player, gameId, gameTime}) => {

  const {firstName, surname} = player;
  const formatTime = (time) => moment.duration(time).format('mm:ss');

  return (
    <div className="basic-info">
      <div>{`${firstName} ${surname}`}</div>
      <div>{`Game ${gameId}`}</div>
      <div>{`Time ${formatTime(gameTime)}`}</div>
    </div>
  )
}

BaseInfo.defaultProps = {
  firstName: 'John',
  surname:   'Smith',
  gameId:    '1'
}

export default BaseInfo;
