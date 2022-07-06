import react from 'react'

function ProgressBar(props) {
    const progressBarDiv = react.useRef()
    
    const printTime = (t) => {
        const prependZero = (x) => {
          return ('0' + x).slice(-2);
        };
        t = Math.round(t);
        var h = Math.floor(t / 3600),
            m = Math.floor((t % 3600) / 60),
            s = t % 60;
        if (h === 0) {
          return [m, prependZero(s)].join(':')
        }
        return [h, prependZero(m), prependZero(s)].join(':');
    };
      
    const getProgressText = () => {
        const currentTime = props.audioPlayer?.currentTime || 0
        const duration = props.audioPlayer?.duration || 0
        return printTime(currentTime) + '/' + printTime(duration);
    };

    const getProgressPerc = () => {
        const currentTime = props.audioPlayer?.currentTime || 0
        const duration = props.audioPlayer?.duration || 0
        const perc = duration === 0 ? 0 : Math.max(0, Math.min(100, currentTime/duration*100))
        return perc
    }

    const onClickProgressBar = (e) => {
        const perc = e.pageX / progressBarDiv.current.clientWidth;
        if (props.audioPlayer) {
            const targetTime = (props.audioPlayer.duration || 0) * perc
            props.audioPlayer.currentTime = targetTime;
        }
    }

    return (
        <div ref={progressBarDiv} style={{width: '100%', height: "40px"}} onClick={onClickProgressBar}>
            <span style={{position: "fixed", top: "10px", right: "5px", fontWeight: "bold"}}>{getProgressText()}</span>
            <span style={{display: 'inline-block', position: "relative", top: "-6px", height: '10px', width: getProgressPerc() + '%', backgroundColor: 'black'}}></span>
        </div>
    );
}

export default ProgressBar;
  