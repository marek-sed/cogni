import React from 'react';

const Modal = ({gameState: {activeRequest, phase}, socket}) => {

  const style = {
    display:         activeRequest ? 'flex' : 'none',
    flexDirection:   'column',
    justifyContent:  'center',
    alignItems:      'center',
    position:        'absolute',
    top:             0,
    bottom:          0,
    left:            0,
    right:           0
  };

  return (
    <div style={style}>
      <div style={{position: 'absolute', zIndex: 0, top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#f5f4f1', opacity: '0.9'}}></div>
      <div style={{zIndex: 2, fontSize: '1.2em'}} className="waiting base01">
        waiting for confirmation to swap to phase {phase === 1 ? 2 : 1}</div>
      <div style={{zIndex: 2, marginTop: '20px', display: 'flex', width: '40%', flex: '0 1', flexDirection: 'row', justifyContent: 'space-around'}}>
        <button className="base08-background">confirm</button>
        <button className="base04-background">reject</button>
      </div>
    </div>
  )
}

export default Modal;
