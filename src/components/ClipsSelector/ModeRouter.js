import React from 'react';
import PollingMode from './PollingMode';
import TurnMode from './TurnMode';



export default ({mode,turnNum,sendTurnVote,sendVote,isMobile,state,otherUserInfo})=>{


    switch (mode) {
        case 0:
          return (
              <PollingMode isMobile={isMobile} state={state} sendVote={sendVote} />
          );
        case 1:
          return (
            <div 
            style={{display: 'flex',
            justifyContent: 'center',
            height: '80vh',
            alignItems: 'center',
            color:'white'
            }} >
              {turnNum!==undefined?<h2 style={{color:'white',padding:10,borderRadius:10,textAlign:'center'}}>{turnNum===0?`It's your turn! Choose the next loops`:`${otherUserInfo?`it's ${otherUserInfo.name}'s turn, ${turnNum} turns to go! `:`${turnNum} turns to go! `}`}</h2>:'Wait...'}
              <TurnMode turnNum={turnNum} isMobile={isMobile} state={state} sendVote={sendTurnVote} />
            </div>
          );
        default:
          return (
            <div className="App">
              Waiting for mode
            </div>
          );
    }
}