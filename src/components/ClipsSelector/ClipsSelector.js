import React, { useReducer, useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import ModeRouter from './ModeRouter';


const socketURL = 'https://young-chamber-15519.herokuapp.com';
// const socketURL =  'http://localhost:4000';

const instruments = []


const styleSignalContainer={
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 10,
    alignItems: 'center',
    color:'white'
}

const styleSignal={
  borderRadius:'100%',
  backgroundColor:'green',
  width:20,
  height:20,
  margin: 5
}


let resultsInitial = {}
instruments.forEach(inst=>resultsInitial[inst] = 1)


const initialState = {isPolling: false,voted:{},clips:{},results:{...resultsInitial},finalResults:{}};


function reducer(state, action) {
  switch (action.type) {
    case 'togglePoll':
      let res= {}
      if(!action.state){
        res = {}
        Object.keys(state.results).forEach(inst=>{
          let max = {key:0,value:0};
          Object.keys(state.results[inst]).forEach((clip,index)=>{
            let current = Number(state.results[inst][clip]);
            if(current>max.value){
              max.value = current;
              max.key = index;
            }
          })
          res[inst]=Number(max.key);
        })
      }
      return {...state,voted:{},finalResults:res,isPolling: action.state};   
    case 'disable':
      return {...state,isPolling:false};   
    case 'clips':
      return {...state,clips:action.clips};
    case 'voted':
      return {...state,voted:{...state.voted,[action.instrument]:true}};
    case 'votedTurn':
      return {...state,voted:{...state.voted,[action.instrument]:true}};
    case 'results':
      return {...state,results:action.results};
    case 'final-results':
      return {...state,finalResults:action.results};
    default:
      throw new Error();
  }
}



function ClipsSelector({isMobile,id,userId,clientId}) {
  const currentSocket = useRef(null);  
  const [state, dispatch] = useReducer(reducer, initialState);
  const [connected,setConnected] = useState(false);
  const [mode,setMode] = useState();
  const [turnNum,setTurnNum] = useState();
  const [userInfo,setUserInfo] = useState({name:'Guest'});
  const [otherUserInfo,setOtherUserInfo] = useState();

  useEffect(()=>{
    console.log('Version 1.0.3');
    initSocket();
    // getUserInfo(client)
  },[])

  useEffect(()=>{
    if(clientId&&userId){
      getUserInfo(clientId,userId);
    }
  },[clientId,userId]);



  const getUserInfo=(clientId,userId)=>{
    let url  = 'https://api.twitch.tv/kraken/users/'+userId;
    fetch(url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      headers: {
        'Content-Type': 'application/json',
        'Client-ID': clientId,
        'Accept': 'application/vnd.twitchtv.v5+json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(res=>{
        res.json().then(res=>{
          if(res.display_name){
            let info = {name:res.display_name,logo:res.logo};
            setUserInfo(info);
            setTimeout(() => {
              currentSocket.current.emit('userInfo',info);
            }, 200);
          } 
        }) 
    });
    // return response.json(); // parses JSON response into native JavaScript objects
  }


  const initSocket = () =>{
    const socket = io(socketURL,{secure: true});

    socket.on('connect',()=>{
      setConnected(true);
      socket.emit('client',id);
    });

    socket.on('disconnect',()=>{
      console.log('disconnected');
      setConnected(false);
    });

    socket.on('reconnect',()=>{
      console.log('reconnecting');
    });

    socket.on('mode',(mode)=>{
      setMode(mode);
    })

    socket.connect();    


    socket.on('results',(results)=>{
      dispatch({type:'results',results});      
    })

    socket.on('clips',(clips)=>{
      dispatch({type:'clips',clips:clips});
    })

    socket.on('turn',()=>{
      setTurnNum(0);
      dispatch({type:'togglePoll',state:true})
    })

    socket.on('wait',(turn)=>{
      // dispatch({type:'watchTurn'})
      setOtherUserInfo(turn.info);
      dispatch({type:'disable'});
      setTurnNum(turn.index+1);
    })

    
    

    socket.on('togglePoll',(value)=>{      
      if(value){
        dispatch({type:'togglePoll',state:true})
      }else{
        dispatch({type:'togglePoll',state:false})
      }
    });

    currentSocket.current = socket;
  }


  const sendVote=(value)=>{
    dispatch({type:'voted',instrument:value.inst})
    currentSocket.current.emit('vote',value);
  }

  const sendTurnVote=(value)=>{
    
    dispatch({type:'votedTurn',instrument:value.inst})
    currentSocket.current.emit('vote',value);
    if(Object.keys(state.clips).length===(Object.keys(state.voted).length + 1)){
      console.log('finished');
      currentSocket.current.emit('finishedTurn');
    }
  }


  return (
    <div className={isMobile?'mobile':''}
     >
      {connected?
        <div style={styleSignalContainer}><div style={{...styleSignal,backgroundColor:'green'}}/>Connected</div>
      :
        <div style={styleSignalContainer}><div style={{...styleSignal,backgroundColor:'red'}}/>No Signal</div>
      }
      <ModeRouter otherUserInfo={otherUserInfo} mode={mode} isMobile={isMobile} state={state} turnNum={turnNum} sendVote={sendVote} sendTurnVote={sendTurnVote}    />
    </div>
  )
}

export default ClipsSelector;
