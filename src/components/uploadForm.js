import react from 'react'
import swal from 'sweetalert'
import ReactResumableJs from './resumable'

function UploadForm(props) {
    const urlInput = react.useRef()
    const onSubmit = async (e) => {
        e.preventDefault()
        const url = urlInput.current.value;
        if (!url) {
            return;
        }
        const spotifyTrackIdRe = [
            {pos: 1, re: /^([0-9a-zA-Z]{22})$/},
            {pos: 1, re: /^spotify:track:([0-9a-zA-Z]{22})$/},
            {pos: 2, re: /^(https?:\/\/)?open\.spotify\.com\/track\/([0-9a-zA-Z]{22})(\?si=.+?)$/}
        ];
        const ytVideoIdRe = [
            {pos: 1, re: /^([a-zA-Z0-9_-]{11})$/},
            {pos: 4, re: /^(https?:\/\/)?(www\.|m\.)?youtube\.com\/watch\?(.*&)?v=([a-zA-Z0-9_-]{11})(&.*)?#?$/},
            {pos: 2, re: /^(https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})(\?.*)?#?$/}
        ];
        const youtubeVideoId = ytVideoIdRe.map((regex) => {
            if (regex.re.test(url)) {
              return url.match(regex.re)[regex.pos];
            }
            return null;
        }).filter(el => !!el)[0];
        const spotifyTrackId = spotifyTrackIdRe.map(function(regex) {
            if (regex.re.test(url)) {
              return url.match(regex.re)[regex.pos];
            }
            return null;
        }).filter(el => !!el)[0];
        if (!youtubeVideoId && !spotifyTrackId) {
            swal("Couldn't parse URL into youtube or spotify id", '', 'error');
            return
        }
        if (youtubeVideoId) {
            await props.downloadYoutubeSong(youtubeVideoId);
        }
        if (spotifyTrackId) {
            await props.downloadSpotifySong(spotifyTrackId);
        }
        urlInput.current.value = ""
    }

    return (
        <div style={{margin: "15px"}}>
        <div>
            <form onSubmit={onSubmit}>
                <i className="fa-brands fa-youtube fa-fw fa-2x"></i><i className="fa-brands fa-spotify fa-fw fa-2x"></i><input autoFocus placeholder="Spotify or Youtube URL" ref={urlInput} type="text" className="searchInput"></input> <button type="submit"><i className="fa-solid fa-cloud-arrow-up"></i></button> <button type="submit"> <i className="fa-solid fa-times" onClick={props.onClose}></i></button>
            </form>
        </div>
        <ReactResumableJs
            filetypes={["mp3"]}
            fileAddedMessage="Started!"
            completedMessage="Complete!"
            service={props.apiRoot + "/mp3-upload"}
            textLabel=""
            previousText="Drop your MP3s here"
            disableDragAndDrop={false}
            maxFileSize={10000000000}
            headerObject={{
                Authorization: 'Token ' + props.authToken
            }}
            onFileAdded={(file, resumable) => {
              resumable.upload();
              // TODO: Track upload progress
              props.enqueueSnackbar("MP3 upload started!");
            }}
            startButton={false}
            pauseButton={false}
            cancelButton={false}
            onStartUpload={() => {
                console.log("Start upload");
            }}
            onCancelUpload={() => {
                this.inputDisable = false;
            }}
            onPauseUpload={() =>{
                this.inputDisable = false;
            }}
            onResumeUpload={() => {
                this.inputDisable = true;
            }}
            showFileList={false}
          />
        </div>
    );
}

export default UploadForm;
