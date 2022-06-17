import react from 'react'

function SearchView(props) {
    const searchForm = react.useRef()
    const queryInput = react.useRef()
    const [result, setResult] = react.useState(null)

    const onSearch = async (e) => {
        e.preventDefault()
        const query = queryInput.current.value
        const resp = await fetch(
            props.apiRoot + '/songs?' + new URLSearchParams({q: query}),
            {
                method: 'GET',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Token ' + props.authToken,
                },
            }
        )
        if(resp.status === 200) {
            const data = await resp.json()
            setResult(data)
        }
    }

    react.useEffect(() => {
      if(searchForm.current) {
        searchForm.current.addEventListener('submit', onSearch)
      }
    }, [searchForm.current])
  

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

  const onAudioDelete = (audioData) => {return (e) => {
    e.preventDefault();
    props.deleteAudio(audioData, ()=>{
      if(result){
        const r = result.filter(s => s.id !== audioData.id)
        setResult(r);
      }
    });
  }};

  const onEditAudioFilename = (song) => {return (e) => {
    e.preventDefault();
    props.editAudioFilename(song, (newPath)=>{
      if(result){
        const r = result.map(s => {if(s.id === song.id){s.filename = newPath;}return s});
        setResult(r);
      }
    });
  }};

  const onQueue = (track) => {
    props.onQueue(track)
  }

  const trackQueueOrder = (track) => {
    const {queue} = props;
    const ids = queue.map(r=>r.id)
    if (ids.includes(track.id)){
      return ids.indexOf(track.id) + 1;
    }
    return null
  }

    return (
      <div style={{margin: "15px"}}>
        <form ref={searchForm}>
          <input className="searchInput" autoFocus ref={queryInput} name="search" type='search' placeholder='Search' autoComplete="off"></input>&nbsp;
          <button type="submit"><i className="fa-solid fa-magnifying-glass"></i></button>&nbsp;
          <button onClick={props.onCloseSearch}><i className="fa-solid fa-times"></i></button>
        </form>
        <div style={{marginTop: "15px"}}>
        {result && result.map((r)=> (
            <div key={r.id} style={{borderBottom: "1px solid rgb(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignSelf: "center"}}>
                <div style={{display: "flex", justifyContent: "start", alignSelf: "center"}}>
                  <div style={{padding: "5px"}}><i className="fa-solid fa-compact-disc fa-3x" onClick={()=>onQueue(r)}></i>{trackQueueOrder(r) && <div style={{display: "inline-block", position: "relative",fontSize: "15px", color: "#fff", backgroundColor: "#09f", padding: "5px 10px", textAlign: "center", marginLeft: "-20px", borderRadius: "50%"}}>{trackQueueOrder(r)}</div>}</div>
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
            </div>
        ))}
        {result && result.length === 0 && (<h3>No result</h3>)}
        </div>
      </div>
    );
  }
  
  export default SearchView;
  