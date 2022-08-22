function Controls(props) {
    return (
        <div style={{margin: "15px"}}>
        { (!props.audioPlayer || props.audioPlayer?.paused) ?
        <button onClick={props.onPlay}><i className="fa-solid fa-play fa-fw"></i></button>
        : <button onClick={props.onPause}><i className="fa-solid fa-pause fa-fw"></i></button>}
        &nbsp;<button onClick={props.onNext}><i className="fa-solid fa-forward"></i></button>
        &nbsp;<button onClick={props.onDownload}><i className="fa-solid fa-download"></i></button>
        &nbsp;<button onClick={props.onSearch}><i className="fa-solid fa-magnifying-glass"></i></button>
        &nbsp;<button onClick={props.onShowQueue}><i className="fa-solid fa-list"></i></button>
        &nbsp;<button onClick={props.onUpload}><i className="fa-solid fa-cloud-arrow-up"></i></button>
        &nbsp;<button onClick={props.toggleAAC} style={{fontSize: "0.5em"}}><span style={{fontSize: !props.useAAC ? "1.5em" : "1em"}}>MP3</span><span>|</span><span style={{fontSize: props.useAAC ? "1.5em" : "1em"}}>AAC</span></button>
        </div>
    );
}

export default Controls;
