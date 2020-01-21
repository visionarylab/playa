import { ipcRenderer as ipc, Event } from 'electron';
import React, { ReactElement, FC, useState, useEffect } from 'react';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PlaylistViewTitle } from './PlaylistViewTitle/PlaylistViewTitle';
import { AlbumListView } from '../AlbumListView/AlbumListView';
import { Playlist } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { UIAlbumView } from '../../store/modules/ui';
import { EntityHashMap } from '../../utils/storeUtils';
import { formatDate } from '../../utils/datetimeUtils';
import './PlaylistView.scss';

import { IPC_MESSAGES } from '../../../constants';
const { IPC_UI_TOGGLE_ALBUM_VIEW } = IPC_MESSAGES;

type PlaylistViewProps = {
  albums: EntityHashMap<Album>;
  playlist: Playlist;
  isCurrent: boolean;
  currentAlbumId: Album['_id'];
  currentTrackId: Track['_id'];
  onTitleChange: Function;
  onAlbumOrderChange: Function;
  onAlbumContextMenu: Function;
  onAlbumDoubleClick: Function;
};

export const PlaylistView: FC<PlaylistViewProps> = ({
  albums,
  playlist,
  isCurrent = false,
  currentAlbumId,
  currentTrackId,
  onAlbumOrderChange,
  onTitleChange,
  onAlbumContextMenu,
  onAlbumDoubleClick
}) => {
  const [albumView, setAlbumView] = useState(UIAlbumView.Extended);
  const hasAlbums = Object.keys(albums).length > 0 && playlist.albums.length > 0;

  useEffect(() => {
    const handler = (_event: Event, _albumView: UIAlbumView): void => {
      setAlbumView(_albumView);
    };
    ipc.on(IPC_UI_TOGGLE_ALBUM_VIEW, handler);
    return (): typeof ipc => ipc.removeListener(IPC_UI_TOGGLE_ALBUM_VIEW, handler);
  }, []);


  function renderActionButtons(): ReactElement {
    return (
      <div className="playlist-view-actions">
        <button
          className={cx('playlist-view-action-button', { 'is-current': albumView === UIAlbumView.Extended })}
          onClick={(): void => setAlbumView(UIAlbumView.Extended)}>
          <FontAwesomeIcon icon="list-alt" className="playlist-icon" fixedWidth/>
        </button>
        <button
          className={cx('playlist-view-action-button', { 'is-current': albumView === UIAlbumView.Compact })}
          onClick={(): void => setAlbumView(UIAlbumView.Compact)}>
          <FontAwesomeIcon icon="th-list" className="playlist-icon" fixedWidth/>
        </button>
      </div>
    );
  }

  const date = formatDate({
    date: playlist.created,
    options: { year: 'numeric', month: 'long', day: 'numeric' }
  });

  const playlistClasses = cx('playlist-view', { 'is-current': isCurrent });
	return (
		<section className={playlistClasses}>
      <header className="playlist-header">
        <div className="playlist-header-row">
          <PlaylistViewTitle
            playlist={playlist}
            onTitleChange={onTitleChange}/>
        </div>
        { renderActionButtons() }
        <p className="playlist-info header-like">Created on {date}</p>
      </header>
      { hasAlbums
        ? <AlbumListView
            sortable={true}
            albums={albums}
            albumView={albumView}
            originalOrder={playlist.albums}
            currentAlbumId={currentAlbumId}
            currentTrackId={currentTrackId}
            onAlbumOrderChange={onAlbumOrderChange}
            onAlbumContextMenu={onAlbumContextMenu}
            onAlbumDoubleClick={onAlbumDoubleClick}/>
        : <p className="playlist-empty-placeholder">Playlist is empty.</p>
      }
    </section>
	);
}
