import React from 'react';
import InstrumentCircle from './InstrumentCircle';



export default ({isMobile,sendVote,state})=>{


    return(
        <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',position: 'absolute',bottom: isMobile?'7vh':'15vh',width: '100%'}}>
            {Object.keys(state.clips).map((name,index)=>{
              return <InstrumentCircle isMobile={isMobile} sendVote={sendVote} key={index} clips={state.clips[name]} isPolling={state.isPolling} voted={state.voted[name]} finalResults={state.finalResults[name]} votes={state.results[name]} id={index} name={name}   />
            })}        
        </div>
    )
}