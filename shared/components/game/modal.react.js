import React from 'react';

const Modal = ({gameState: {activeRequest, phase}, socket}) => {

  const style = {
    display:         activeRequest ? 'flex' : 'none',
    flexDirection:   'column',
    justifyContent:  'center',
    alignItems:      'center',
    position:        'absolute',
    backgroundColor: '#f5f4f1',
    opacity:         0.9,
    top:             0,
    bottom:          0,
    left:            0,
    right:           0
  };

  return (
    <div style={style}>
      <div style={{fontSize: '1.2em'}} className="waiting base01">
        waiting for confirmation to swap to phase {phase === 1 ? 2 : 1}</div>
      <div style={{marginTop: '20px', display: 'flex', width: '40%', flex: '0 1', flexDirection: 'row', justifyContent: 'space-around'}}>
        <button className="base08-background">confirm</button>
        <button className="base0A-background">reject</button>
      </div>
    </div>
  )
}

export default Modal;
