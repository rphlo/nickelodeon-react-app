import React, { Fragment } from 'react';

import { HAS_MEDIA_SESSION } from '../constant';
import useMediaSession from '../useMediaSession';

import MediaSession from './mediaSession';

const MediaSessionWrapper = (props) => {
  if (!HAS_MEDIA_SESSION) {
    return <Fragment>{props.children || null}</Fragment>;
  }
  return <MediaSession {...props} />;
};

export { HAS_MEDIA_SESSION, useMediaSession };
export default MediaSessionWrapper;