import { useEffect } from 'react';

const useMediaSession = (props) => {
  const {
    title = '',
    artist = '',
    album = '',
    artwork = [],

    onPlay,
    onPause,
    onSeekBackward,
    onSeekForward,
    onPreviousTrack,
    onNextTrack,
  } = props;

  const { mediaSession } = navigator;

  useEffect(() => {
    const metadata = new window.MediaMetadata({
      title,
      artist,
      album,
      artwork,
    });
    mediaSession.metadata = metadata;
    return () => mediaSession.metadata = metadata;
  }, [title, artist, album, artwork, mediaSession]);

  useEffect(() => {
    mediaSession.setActionHandler('play', onPlay);
    return () => {
      mediaSession.setActionHandler('play', null);
    };
  }, [onPlay, mediaSession]);
  useEffect(() => {
    mediaSession.setActionHandler('pause', onPause);
    return () => {
      mediaSession.setActionHandler('pause', null);
    };
  }, [onPause, mediaSession]);
  useEffect(() => {
    mediaSession.setActionHandler('seekbackward', onSeekBackward);
    return () => {
      mediaSession.setActionHandler('seekbackward', null);
    };
  }, [onSeekBackward, mediaSession]);
  useEffect(() => {
    mediaSession.setActionHandler('seekforward', onSeekForward);
    return () => {
      mediaSession.setActionHandler('seekforward', null);
    };
  }, [onSeekForward, mediaSession]);
  useEffect(() => {
    mediaSession.setActionHandler('previoustrack', onPreviousTrack);
    return () => {
      mediaSession.setActionHandler('previoustrack', null);
    };
  }, [onPreviousTrack, mediaSession]);
  useEffect(() => {
    mediaSession.setActionHandler('nexttrack', onNextTrack);
    return () => {
      mediaSession.setActionHandler('nexttrack', null);
    };
  }, [onNextTrack, mediaSession]);
};

export default useMediaSession;
