import React from 'react';
import {changeReject, changeConfirm} from '../../actions/gameActions.js';

const Confirmation = ({nextPhase, onConfirm, onReject}) => {

  return (
    <div style={{zIndex: 2, display: 'flex', width: '100%', justifyContent: 'center', flexDirection: 'column', height: '100%'}}>
      <div style={{display: 'inline-block', fontSize: '1.1em', textAlign: 'center'}}>
        {`Start phase ${nextPhase}?`}
      </div>
      <div style={{margin: '0 auto', marginTop: '20px', display: 'flex', height: '100%', width: '30%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <button className="base08-background" onClick={onConfirm}>confirm</button>
        <button className="base04-background" onClick={onReject}>reject</button>
      </div>
    </div>
  )
}

const Content = ({children, className}) => {
  return (
    <div style={{zIndex: 2, fontSize: '1.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'}} className={className}>
      {children}
    </div>
  );
}

const PhaseChanger = ({dispatch, phaseChanger: {activeRequest, actionRequired}, gameState: {phase}, socket}) => {

  const style = {
    display:        activeRequest ? 'flex' : 'none',
    flexDirection:  'column',
    justifyContent: 'center',
    alignItems:     'center',
    position:       'absolute',
    top:            0,
    bottom:         0,
    left:           0,
    right:          0,
  };
  const nextPhase = phase === 1 ? 2 : 1;
  const content = actionRequired
                ? <Confirmation nextPhase={nextPhase}
                    onConfirm={() => dispatch(changeConfirm(socket, nextPhase))}
                    onReject={() => dispatch(changeReject(socket))}/>
                : `waiting for confirmation to swap to phase ${nextPhase}`;
  return (
    <div style={style}>
      <div style={{position: 'absolute', zIndex: 0, top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#f5f4f1', opacity: '0.9'}}>
      </div>
      <Content className="wainting base01">
        {content}
      </Content>
    </div>
  )
}

export default PhaseChanger;
