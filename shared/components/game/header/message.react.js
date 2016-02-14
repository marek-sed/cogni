import React from 'react';

const Message = ({message}) => {

  return (
    <div className="message">
      <h3>Round result: </h3>
      <span>{message}</span>
    </div>
  )
}

Message.defaultProps = {
  message: 'This is some lorem ipsum'
}

export default Message;
