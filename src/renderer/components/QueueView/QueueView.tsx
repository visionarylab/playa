import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { playerSelector } from '../../store/modules/player';
import { AlbumListView } from '../AlbumListView/AlbumListView';
import { Album } from '../../store/modules/album';
import { Artist } from '../../store/modules/artist';
import { Track } from '../../store/modules/track';
import { playTrack } from '../../store/modules/player';
import { updateTitle, UIDragTypes } from '../../store/modules/ui';
import { toObj } from '../../utils/storeUtils';
import { openContextMenu } from '../../lib/contextMenu';
import scrollTo from '../../lib/scrollTo';
import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActionsGroups
} from '../../actions/albumActions';

import './QueueView.scss';

export const QueueView = (): ReactElement => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
		currentPlaylist,
    currentAlbum,
    currentAlbumId,
    currentTrack,
		queue
  } = useSelector(playerSelector);

  useEffect(() => {
    dispatch(updateTitle({
      main: t('queue.title.main'),
      sub: t('queue.title.sub', { length: queue.length })
    }));
  }, [queue.length]);

  useEffect(() => {
    scrollTo({
      selector: `#album-${currentAlbumId}`,
      block: 'nearest',
      behavior: 'smooth'
    });
  }, [currentAlbumId]);

  function onAlbumContextMenu({
    album,
    artist
  }: {
    album: Album;
    artist: Artist;
  }): void {
    openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        artist,
        selection: [album],
        queue: queue.map(({ _id }) => _id),
        dispatch,
        actionGroups: [
          AlbumActionsGroups.QUEUE,
          AlbumActionsGroups.PLAYBACK,
          AlbumActionsGroups.EDIT,
          AlbumActionsGroups.SYSTEM,
          AlbumActionsGroups.SEARCH_ONLINE
        ]
      }
    ]);
  }

  function onAlbumDoubleClick({
    album,
    track
  }: {
    album: Album;
    track: Track;
  }): void {
    dispatch(playTrack({
      playlistId: currentPlaylist ? currentPlaylist._id : null,
      albumId: album._id,
      trackId: track ? track._id : null
    }));
  }

	return (
		<section className="queue" id="queue">
      { queue.length > 0
        ? <AlbumListView
            albums={toObj(queue)}
            originalOrder={queue.map(({ _id }) => _id)}
            currentAlbumId={currentAlbum ? currentAlbum._id : null}
            currentTrackId={currentTrack ? currentTrack._id : null}
            dragType={UIDragTypes.QUEUE_ALBUMS}
            onAlbumContextMenu={onAlbumContextMenu}
            onAlbumDoubleClick={onAlbumDoubleClick}/>
        : <p className="queue-empty-placeholder">{t('queue.empty')}</p>
      }
		</section>
	);
}
