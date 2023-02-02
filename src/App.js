import react from 'react'
import MediaSession from "./components/mediaSessionWrapper";
import Controls from './components/controls'
import ProgressBar from './components/progressBar'
import LogoutBtn from './components/logoutBtn'
import LoginForm from './components/loginForm'
import SearchView from './components/searchView'
import QueueView from './components/queueView'
import UploadForm from './components/uploadForm'
import { useSnackbar } from 'notistack';

import swal from "sweetalert";

import './App.css'
import React from 'react';

const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty("--app-height", `${window.innerHeight}px`);
  const searchResultDiv = document.getElementById('searchResults');
  doc.style.setProperty("--app-header-height", searchResultDiv ? `${searchResultDiv.offsetTop}px` : '0px');
};

window.addEventListener("resize", appHeight);

const pkg = require('../package.json');

const options = {
  //audio lists model
  apiRoot: localStorage.devserver || pkg.api_homepage,
  authToken: localStorage.getItem('auth_token'),
  username: localStorage.getItem('username'),
  isSuperuser: localStorage.getItem('is_superuser'),
};

const SEARCH = 'search'
const QUEUE = 'queue'
const PLAYER = 'player'
const UPLOAD = 'upload'

function App() {
  const [audioData, setAudioData] = react.useState(null)
  const [audioPlayer, setAudioPlayer] = react.useState(null)
  const [view, setView] = react.useState(PLAYER)
  const [currentTime, setCurrentTime] = react.useState(0)
  const [duration, setDuration] = react.useState(0)
  const [queue, setQueue] = react.useState([])
  const [firstLoadDone, setFirstLoadDone] = react.useState(false)
  const [useAAC, setUseAAC] = react.useState(false)
  const [dl, setDl] = react.useState({})
  
  const downloads = {}
  const toggleAAC = function() {
    setUseAAC(!useAAC);
  }

  const audioEl = react.useCallback((node) => {
    setAudioPlayer(node);
  }, []);

  const [username, setUsername] = react.useState(options.username)
  const [isSuperuser, setIsSuperuser] = react.useState(options.isSuperuser)

  const { enqueueSnackbar } = useSnackbar();

  react.useEffect(() => {
    appHeight()
    const t = localStorage.getItem('current_v2');
    const q = localStorage.getItem('queue_v2');
    try {
      if (q) {
        setQueue(JSON.parse(q));
      }
    } catch {}
    try {
      if (t) {
        setAudioData(JSON.parse(t));
      }
    } catch {}
  }, []);

  react.useEffect(() => {
    appHeight()
  }, [view]);

  react.useEffect(() => {
    if(!options.authToken) {
      setUsername(null)
      return
    } else if (localStorage.getItem('current_v2')) {
      try {
        setAudioData(JSON.parse(localStorage.getItem('current_v2')));
        return
      } catch {}
    }
    (async() => await fetchRandomSong())()
  }, [options.apiRoot, options.authToken])

  react.useEffect(() => {
    localStorage.setItem('queue_v2', JSON.stringify(queue));
  }, [queue])

  react.useEffect(() => {
    localStorage.setItem('username', username);
    if (!username) {
      localStorage.removeItem('username', username);
      localStorage.removeItem('auth_token');
    }
  }, [username])

  react.useEffect(() => {
    if(audioData){
      localStorage.setItem('current_v2', JSON.stringify(audioData));
    } else {
      localStorage.removeItem('current_v2');
    }
  }, [audioData])

  react.useEffect(() => {
    if(audioPlayer && audioData && !firstLoadDone) {
      setFirstLoadDone(true)
      audioPlayer.load()
    }
  }, [audioPlayer, audioData, firstLoadDone])

  const loadAndPlay = () => {
    audioPlayer.load();
    audioPlayer.play();
  } 

  const fetchRandomSong = async () => {
    try {
      const resp = await fetch(`${options.apiRoot}/songs/random/`, {
        method: 'GET',
        credentials: 'omit',
        headers: {
          Authorization: 'Token ' + options.authToken,
          'Content-Type': 'application/json'
        }
      })
      if (resp.status !== 200) {
        throw new Error('Something wrong')
      }
      const data = await resp.json()
      setAudioData(data)
    } catch(e) {
      await onLoggedOut()
    }
  }

  const onAudioEnd = async () => {
    if(queue.length) {
      const q = [...queue];
      const track = q.shift();
      setQueue([...q])
      setAudioData(track);
    } else {
      await fetchRandomSong()
    }
    loadAndPlay()
  }

  const onAudioPlaying = () => {
    setCurrentTime(audioPlayer.currentTime)
    setDuration(audioPlayer.duration)
  } 

  react.useEffect(() => {
    if(audioPlayer) {
      audioPlayer.addEventListener("ended", onAudioEnd, false);
      audioPlayer.addEventListener("timeupdate", onAudioPlaying, false);
      
    }
    return () => {
      audioPlayer?.removeEventListener("ended", onAudioEnd, false);
      audioPlayer?.removeEventListener("timeupdate", onAudioPlaying, false);
    }
  }, [audioPlayer, queue])

  const onPlay = async (e) => {
    try {
      e.preventDefault();
    } catch {};
    await audioPlayer.play()
  }

  const onPause = async (e) => {
    try {
      e.preventDefault();
    } catch {};
    await audioPlayer.pause()
  }

  const onNext = async (e) => {
    try {
      e.preventDefault();
    } catch {};
    if(queue.length) {
      const track = queue.shift();
      setQueue([...queue])
      setAudioData(track); 
    }else {
      await fetchRandomSong()
    }
    try {
    loadAndPlay()
    } catch {}
  }

  const onQueue = (track) => {
    setQueue([...queue, track]);
  }

  const onUnQueue = (idx) => {
    const newQueue = [...queue];
    newQueue.splice(idx, 1);
    setQueue(newQueue);
  }

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onShuffleQueue = () => {
    let q = [...queue];
    for (let i = q.length-1; i > 0; i--) {
      q = reorder(
        q,
        Math.floor(Math.random() * (i+1)),
        i
      );
    }
    setQueue(q);
  }

  const onDragQueueEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const q = reorder(
      queue,
      result.source.index,
      result.destination.index
    );
    setQueue(q);
  }

  const deleteAudio = async (song, cb) => {
    const { apiRoot, authToken } = options;
    const hasConfirmed = await swal('Are you sure you want to delete this file "'+song.filename.split('/').pop()+'"?');
    if (hasConfirmed) {
      await fetch(apiRoot + '/songs/' + song.id,
      {
        method: 'DELETE',
        headers: {
          Authorization: 'Token ' + authToken,
          Accept: "application/json",
          'Content-Type': 'application/json'
        }
      }).then(async (response) => {
        if (response.status === 204) {
          console.log('Song ' + song.id + ' Deleted');
          const q = queue.filter(s => s.id !== song.id);
          setQueue(q);
          const currentId = audioData?.id;
          if (currentId === song.id) {
            if(q.length) {
              const track = q.shift();
              setQueue([...q])
              setAudioData(track); 
            } else {
              await fetchRandomSong()
            }
            try {
              loadAndPlay()
            } catch {}
          }
          cb && cb();
        } else if (response.status === 401) {
          await onLoggedOut()
        } else {
          swal('Something went wrong...', '', 'error');
        }
      }).catch(()=>{
        swal('Something went wrong...', '', 'error');
      });
    }
  };

  const editAudioFilename = async (song, cb) => {
    var newPath = await swal('New file path', {
      content: {
        element: 'input',
        attributes: {
          defaultValue: song.filename,
        }
      }
    });
    if (newPath && newPath !== song.filename) {
        const { apiRoot, authToken } = options;
        await fetch(apiRoot + '/songs/' + song.id,
        {
          method: 'PATCH',
          headers: {
            Authorization: 'Token ' + authToken,
            Accept: "application/json",
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({filename: newPath}),
        }).then(async (response) => {
          if (response.status === 200) {
            const q = queue.map(s => {if(s.id === song.id){s.filename = newPath;}return s});
            setQueue(q);
            const currentId = audioData?.id;
            if (currentId === song.id) {
              setAudioData({...audioData, filename: newPath})
            }
            cb && cb(newPath);
          } else if (response.status === 401) {
            await onLoggedOut()
          } else {
            swal('Something went wrong...', '', 'error');
          }
        }).catch(e => {
          swal('Something went wrong...', '', 'error');
        });
    }
  };

  const onLoggedIn = async ({ username: _username, token, isSuperuser: _isSuperuser}) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('username', _username)
    localStorage.setItem('is_superuser', _isSuperuser) 
    options.authToken = token
    setUsername(_username)
    setIsSuperuser(_isSuperuser)
  }

  const onLoggedOut = async () => {
    setUsername(null);
    setIsSuperuser(null);
    setAudioData(null);
    setFirstLoadDone(false);
    setQueue([]);
  }

  const onSelectAudio = (data) => {
    setAudioData(data)
    loadAndPlay()
  }

  const getAudioUrl = (data) => {
    if(data) {
      return data.download_url + '.' + (useAAC ? 'aac' : 'mp3') +'?auth_token=' + options.authToken
    }
    return null
  }
  
  const onAudioDownload = (e) => {
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
  };
  const onStartDownload = (videoId, taskId, client='Youtube') => {
    enqueueSnackbar(client + ' download "' + videoId + '" started...');
    
    downloads[taskId] = { taskId, videoId, songName: client + " " + videoId, done: false, client };
    setDl({...downloads})
    function fetchStatus (v, t, c) {
      const { apiRoot, authToken } = options;
      fetch(apiRoot + '/tasks/' + t + '/',
      {
        method: 'GET',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + authToken,
        },
    }).then(async function(result){
        const response = await result.json();
        if(!response.pk) {
          if (response.error) {
            enqueueSnackbar((c === 'Youtube' ? 'Youtube video' : 'Spotify track') + ' "' + v + '" download failed', {variant: 'error'});
            delete downloads[t];
            setDl({...downloads})
          } else {
            setTimeout(((a, b, cc) => (() => fetchStatus(a, b, cc)))(v, t, c), 1000);
            downloads[t].songName = response?.song_name || c + " " + v;
            setDl({...downloads})
          }
        } else {
          const name = response.filename.split('/').pop();
          enqueueSnackbar('Song "' + name + '" ready', {variant: 'success'});
          delete downloads[t];
          setDl({...downloads})
        }
      }).catch((e) => {
        console.log(e)
        enqueueSnackbar((c === 'Youtube' ? 'Youtube video' : 'Spotify track') + ' "' + v + '" download failed', {variant: 'error'})
        delete downloads[t];
        setDl({...downloads})
      });
    }
    
    setTimeout(() => fetchStatus(videoId, taskId, client), 1000);
  }

  const downloadYoutubeSong = async (videoId) => {
    const { apiRoot, authToken } = options;
    fetch(
      apiRoot + '/youtube-dl/',
      {
        body: JSON.stringify({
          v: videoId
        }),
        method: 'POST',
        headers: {
          Authorization: 'Token ' + authToken,
          Accept: "application/json",
          'Content-Type': 'application/json'
        }
      }
    )
    .then(async (response) => {
      const data = await response.json();
      onStartDownload(videoId, data.task_id)
    })
    .catch((e) => swal('Oops!', 'Youtube download ' + videoId + ' did not go through...', 'error'));
  }

  const downloadSpotifySong = async (videoId) => {
    const { apiRoot, authToken } = options;
    fetch(
      apiRoot + '/spotify-dl/',
      {
        body: JSON.stringify({
          s: videoId
        }),
        method: 'POST',
        headers: {
          Authorization: 'Token ' + authToken,
          Accept: "application/json",
          'Content-Type': 'application/json'
        }
      }
    )
    .then(async (response) => {
      const data = await response.json();
      onStartDownload(videoId, data.task_id, 'Spotify')
    })
    .catch((e) => swal('Oops!', 'Spotify download ' + videoId + ' did not go through...', 'error'));
  }

  return (
    <>
      {username && (<>
        <ProgressBar audioPlayer={audioPlayer} currentTime={currentTime} duration={duration}></ProgressBar>
        <LogoutBtn apiRoot={options.apiRoot} authToken={options.authToken} onLoggedOut={onLoggedOut}/>
        <Controls audioPlayer={audioPlayer} onPlay={onPlay} onPause={onPause} onNext={onNext} onDownload={onAudioDownload} onSearch={()=>setView(SEARCH)} onShowQueue={()=>setView(QUEUE)} onUpload={()=>setView(UPLOAD)} toggleAAC={toggleAAC} useAAC={useAAC}></Controls>
        { (view === PLAYER || true) && (
        <div style={{margin: "15px"}}>
          <i className="fa-brands fa-itunes-note"></i> <span className="audioTitle">{audioData?.filename?.split('/')?.pop()}</span><br />
          <span className="audioFullTitle"><small>{audioData?.filename}</small></span>
        </div>)}
        { view === SEARCH && (
          <SearchView apiRoot={options.apiRoot} onSelect={onSelectAudio} onLoggedOut={onLoggedOut} onCloseSearch={()=>setView(PLAYER)} currentUsername={username} authToken={options.authToken} isSuperuser={isSuperuser} onQueue={onQueue} queue={queue} deleteAudio={deleteAudio} editAudioFilename={editAudioFilename}></SearchView>
        )}
        { view === QUEUE && (
          <QueueView apiRoot={options.apiRoot} onSelect={onSelectAudio} onCloseQueue={()=>setView(PLAYER)} currentUsername={username} authToken={options.authToken} isSuperuser={isSuperuser} onShuffleQueue={onShuffleQueue} onUnQueue={onUnQueue} queue={queue} onDragQueueEnd={onDragQueueEnd} deleteAudio={deleteAudio} editAudioFilename={editAudioFilename}></QueueView>
        )}
        { view === UPLOAD && (
          <UploadForm apiRoot={options.apiRoot} authToken={options.authToken} downloads={dl} enqueueSnackbar={enqueueSnackbar} onClose={()=>setView(PLAYER)} downloadYoutubeSong={downloadYoutubeSong} downloadSpotifySong={downloadSpotifySong}></UploadForm>
        )}
        <MediaSession
          title={audioData?.filename}
          album="humppakone.com"
          artist="humppakone.com"
          onPlay={onPlay}
          onPause={onPause}
          //onSeekBackward={() => {audioPlayer.currentTime -= 10}}
          //onSeekForward={() => {audioPlayer.currentTime += 10}}
          onNextTrack={onNext}
          artwork={[
            {
              src: audioData?.download_url + '.jpg?auth_token=' + options?.authToken,
              size: "512x512"
            },
          ]}
        />
        <audio ref={audioEl} preload="none" tabIndex="0">
          <source src={getAudioUrl(audioData)}></source>
        </audio>
      </>)}
      {!username && <>
        <LoginForm apiRoot={options.apiRoot} onLoggedIn={onLoggedIn}></LoginForm>
      </>}
    </>
  );
}

export default App;
