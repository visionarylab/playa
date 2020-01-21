import React, { FC, useEffect } from 'react';
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

type QueueViewProps = {

};

export const QueueView: FC<QueueViewProps> = () => {
  const dispatch = useDispatch();
  const {
		currentPlaylist,
    currentAlbum,
    currentTrack,
		queue
  } = useSelector(playerSelector);

  useEffect(() => {
    dispatch(updateTitle(`playback queue: ${queue.length} albums`));
  }, [queue.length]);

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
		<section className="queue">
      <h1>playback queue</h1>
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
