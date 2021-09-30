import React from 'react';
import './InstrumentCircle.css';
import { useEffect } from 'react';
import { useState } from 'react';
import muteIcon from './mute.svg';


const sortVotes=(votes)=>{
    if(votes){
        let newVotes = {...votes};
        let muteAmount = votes['-1'];
        delete newVotes[-1];
        let arr = Object.keys(newVotes).map(vote=>newVotes[vote]);
        arr.unshift(muteAmount);
        let sum = arr.reduce(function(a, b){
            return a + b;
        }, 0);
        arr = arr.map(val=>{
            if(val!==0){
                return val/sum;
            }else{
                return 0;
            }
        });
        return arr
    }else{
        return [0];
    }
}

export default function InstrumentCircle({name,voted,votes,sendVote,isPolling,clips,finalResults,isMobile}){
    const [userVote,setUserVote] = useState(undefined);
    const [clipButtons,setClipButtons] = useState([]);
    const [image,setImage] = useState();
    const [lastDefinedResult,setLastDefinedResult] = useState();

    let circlesDistance = isMobile?50:65;

    const handleClick=(clipIndex)=>{
        if(clipIndex===-1){
            sendVote({inst:name,clip:{pos:clipIndex,id:clipIndex}});
        }else{
            sendVote({inst:name,clip:clips[clipIndex]});
        }
        setUserVote(clipIndex);
    }

    useEffect(()=>{
        if(finalResults!==undefined){
            setLastDefinedResult(finalResults);
        }
        let offsetAngle = 360 /( clips.length+1);
        let buttons = [];
        let sortedVotes = sortVotes(votes);
        let voteMarkSize = 0.5;
        buttons = clips.map((item,i)=>{
            let rotateAngle = offsetAngle * (i+1);
            let votesData = sortedVotes[i+1];
            return (
                <div key={name+i}>
                    <li className={`clip-vote-circle ${i===userVote?'chosen':''}`} 
                    style={{
                        transform:"rotate(" + rotateAngle + `deg) translate(0, -${circlesDistance}px) rotate(-` + rotateAngle + "deg)",
                        width:`${voteMarkSize+3*votesData}em`,height:`${voteMarkSize+3*votesData}em`,left:`calc(50% - ${voteMarkSize/2+1.5*votesData}em ${i===userVote?'- 2px':''})`,top:`calc(50% - ${voteMarkSize/2+1.5*votesData}em ${i===userVote?'- 2px':''})`
                        }}/>
                    <li onClick={e=>handleClick(i)} style={{transform:"rotate(" + rotateAngle + `deg) translate(0, -${circlesDistance}px) rotate(-` + rotateAngle + "deg)"}}  className='list-item'><button className={`clip-circle ${i===finalResults?'chosen':''}`} /></li>    
                </div>)
        });
        // let rotateAngle = offsetAngle * (i+1);
        let votesData = sortedVotes[0];
        let mute = <div key={name+'-mute'}>
            <li className={`clip-vote-circle mute ${-1===userVote?'chosen':''}`} 
            style={{
                transform:`translate(0, -${circlesDistance}px)`,
                width:`${voteMarkSize+3*votesData}em`,height:`${voteMarkSize+3*votesData}em`,left:`calc(50% - ${voteMarkSize/2+1.5*votesData}em ${-1===userVote?'- 2px':''})`,top:`calc(50% - ${voteMarkSize/2+1.5*votesData}em ${-1===userVote?'- 2px':''})`
                }}/>
            <li onClick={e=>handleClick(-1)} style={{transform:"rotate(" + 0 + `deg) translate(0, -${circlesDistance}px) rotate(-` + 0 + "deg)"}}  className='list-item mute'>
                <img width='100%' src={muteIcon} alt=""/>
                <button className={`clip-circle mute ${-1===finalResults?'chosen':''}`}>
                </button>
            </li>    
        </div>
        buttons.unshift(mute);
        setClipButtons(buttons);
    },[clips,finalResults,name,userVote,votes])


    useEffect(()=>{
        let imgs = name.match(/\bhttps?:\/\/\S+/gi);
        if(imgs!==null){
            if(imgs.length===clips.length){
                if(lastDefinedResult!==undefined&&(lastDefinedResult!==clips.length)){
                    setImage(imgs[lastDefinedResult]);
                }else{
                    setImage(imgs[0]); 
                }
            }else{
                setImage(imgs[0]);
            }
        }else{
            setImage(undefined);
        }
    },[lastDefinedResult,finalResults])

    return(
        <div className={`instrument-container ${isPolling&&!voted?'polling':''}`}>
            <ul id="list">
                {clipButtons}
                <div className='instrument-knob' style={{transform:`rotate(${360/(clips.length+1)*(finalResults+1)}deg)`}} >
                    <div className='instrument-knob-arrow' />
                </div>
            </ul>
            {/http/.test(name)?<div className="instrument-image-container"><img src={image} className="instrument-image" /></div>:<h1>{name}</h1>}
        </div>
    )
}



