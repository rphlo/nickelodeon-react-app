import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function QueueView(props) {
  const onSelectResult = (e, r) => {
    e.preventDefault()
    props.onSelect(r)
  }

  const getAudioUrl = (data) => {
    if(data) {
      return data.download_url + '.mp3?auth_token=' + props.authToken
    }
    return null
  }
  
  const onAudioDownload = (audioData) => {return (e) => {
      e.preventDefault();
      const url = getAudioUrl(audioData)
      const name = audioData.filename?.split('/')?.pop() + '.mp3'
      if (name && url) {
        const link = document.createElement('a')
        link.setAttribute("download", name)
        link.setAttribute("name", name)
        link.setAttribute("href", url)
        link.click()
      }
  }};

  const onUnQueue = (idx) => {
    props.onUnQueue(idx)
  }

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    opacity: isDragging ? 0.5 : 1,
    ...draggableStyle
  });

  const onAudioDelete = (audioData) => {return (e) => {
    e.preventDefault();
    props.deleteAudio(audioData);
  }};

  const onEditAudioFilename = (song) => {return (e) => {
    e.preventDefault();
    props.editAudioFilename(song);
  }};

    return (
      <div style={{margin: "15px"}}>
        <div>
        <button onClick={props.onShuffleQueue}><i className="fa-solid fa-shuffle"></i></button>
        &nbsp;<button onClick={props.onCloseQueue}><i className="fa-solid fa-times"></i></button>
        </div>
        <DragDropContext onDragEnd={(res) => {props.onDragQueueEnd(res)}}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
        <div style={{marginTop: "15px"}} {...provided.droppableProps} ref={provided.innerRef}>
        {props.queue.map((r, idx)=> (
          <Draggable key={r.id+'-'+idx} draggableId={r.id+'-'+idx} index={idx}>
            {(provided, snapshot) => (
              <div ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={getItemStyle(
                snapshot.isDragging,
                provided.draggableProps.style
              )}>
            <div key={r.id} style={{borderBottom: "1px solid rgb(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignSelf: "center"}}>
                <div style={{display: "flex", justifyContent: "start", alignSelf: "center"}}>
                  <div style={{padding: "5px", whiteSpace: "nowrap"}}><i className="fa-solid fa-compact-disc fa-3x" onClick={()=>onUnQueue(idx)}></i><div style={{display: "inline-block", position: "relative",fontSize: "15px", color: "#fff", backgroundColor: "#09f", padding: "5px 10px", textAlign: "center", marginLeft: "-20px", borderRadius: "50%"}}>{idx + 1}</div></div>
                  <div style={{paddingLeft: "5px"}}>
                    <a href="/" style={{fontSize: "1.2em", textDecoration: "none", fontWeight: "bold", color: "#03a"}} onClick={(e) => onSelectResult(e, r)}>{r.filename.split('/').pop()}</a><br/>
                    <span>/{r.filename}</span><br/>
                    <span><i className="fa-solid fa-user"></i> {r.owner}</span>
                  </div>
                </div>
                <div style={{alignSelf: "center", verticalAlign:"center"}}>
                  {(props.currentUsername === r.owner || props.isSuperuser ) && (
                  <><button onClick={onEditAudioFilename(r)}>
                    <i className="fa-solid fa-edit"></i>
                  </button> </>
                  )}
                  <button onClick={onAudioDownload(r)}>
                    <i className="fa-solid fa-download"></i>
                  </button>
                  {(props.currentUsername === r.owner || props.isSuperuser) && (
                  <> <button onClick={onAudioDelete(r)}>
                    <i className="fa-solid fa-trash"></i>
                  </button></>)}
                </div>
            </div></div>)}
            </Draggable>
        ))}
        {provided.placeholder}
        </div>)}
        </Droppable>
        </DragDropContext>
        {props.queue.length === 0 && (<h3>No item queued</h3>)}
      </div>
    );
  }
  
  export default QueueView;
  