import React, { ReactElement, useEffect } from 'react';
import { findDOMNode } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { playerSelector } from '../../store/modules/player';
import { AlbumListView } from '../AlbumListView/AlbumListView';
import { Album } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { playTrack } from '../../store/modules/player';
import { updateTitle, UIAlbumView } from '../../store/modules/ui';
import { toObj } from '../../utils/storeUtils';
import {
  ALBUM_CONTEXT_ACTIONS,
  openContextMenu,
  AlbumActionItems
} from '../../utils/contextMenuUtils';
import './QueueView.scss';

export const QueueView = (): ReactElement => {
  const dispatch = useDispatch();
  const {
		currentPlaylist,
    currentAlbum,
    currentAlbumId,
    currentTrack,
		queue
  } = useSelector(playerSelector);

  useEffect(() => {
    dispatch(updateTitle(`playback queue: ${queue.length} albums`));
  }, [queue.length]);

  useEffect(() => {
    const target = findDOMNode(document.getElementById(currentAlbumId)) as HTMLElement;
    if (!target) {
      return;
    }
    setImmediate(() => {
      target.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
    });
  }, [currentAlbumId]);

  function onAlbumContextMenu(album: Album): void {
    openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        album,
        dispatch,
        actions: [
          AlbumActionItems.PLAYBACK,
          AlbumActionItems.SYSTEM,
          AlbumActionItems.SEARCH_ONLINE
        ]
      }
    ]);
  }

  function onAlbumDoubleClick(album: Album, track: Track): void {
    dispatch(playTrack({
      playlistId: currentPlaylist ? currentPlaylist._id : null,
      albumId: album._id,
      trackId: track ? track._id : null
    }));
  }

	return (
		<section className="queue" id="queue">
      <h1>Playback Queue</h1>
      { queue.length > 0
        ? <AlbumListView
            albumView={UIAlbumView.Extended}
            sortable={false}
            albums={toObj(queue)}
            originalOrder={queue.map(({ _id }) => _id)}
            currentAlbumId={currentAlbum ? currentAlbum._id : null}
            currentTrackId={currentTrack ? currentTrack._id : null}
            onAlbumContextMenu={onAlbumContextMenu}
            onAlbumDoubleClick={onAlbumDoubleClick}/>
        : <p className="queue-empty-placeholder">Queue is empty.</p>
      }
		</section>
	);
}
