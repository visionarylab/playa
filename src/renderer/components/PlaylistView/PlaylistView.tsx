import React, { ReactElement, FC, useState, useEffect, useCallback } from 'react';
import cx from 'classnames';
import { PlaylistViewTitle } from './PlaylistViewTitle/PlaylistViewTitle';
import { AlbumView } from './AlbumView/AlbumView';
import { CompactAlbumView } from './CompactAlbumView/CompactAlbumView';
import { Playlist } from '../../store/modules/playlist';
import { Album } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { UIAlbumView } from '../../store/modules/ui';
import { EntityHashMap, immutableMove } from '../../utils/storeUtils';
import './PlaylistView.scss';

type PlaylistViewProps = {
  albums: EntityHashMap<Album>;
  playlist: Playlist;
  isCurrent: boolean;
  currentAlbumId: Album['_id'];
  currentTrackId: Track['_id'];
  onTitleChange: Function;
  onAlbumOrderChange: Function;
  onAlbumContextMenu: Function;
};

export const PlaylistView: FC<PlaylistViewProps> = ({
  albums,
  playlist,
  isCurrent = false,
  currentAlbumId,
  currentTrackId,
  onAlbumOrderChange,
  onTitleChange,
  onAlbumContextMenu
}) => {
  const [albumView, setAlbumView] = useState(UIAlbumView.Extended);
  const [albumOrder, setAlbumOrder] = useState([]);
  const hasAlbums = Object.keys(albums).length > 0 && playlist.albums.length > 0;

  useEffect(() => {
    if (playlist.albums.length > 0) {
      setAlbumOrder(playlist.albums);
    }
  }, [playlist.albums]);

  const onAlbumMove = useCallback((dragIndex: number, hoverIndex: number): void => {
    const newOrder = immutableMove<Album['_id']>(albumOrder, dragIndex, hoverIndex);
    setAlbumOrder(newOrder);
  }, [albumOrder]);

  function onDragEnd(): void {
    onAlbumOrderChange(albumOrder);
  }

  function onAlbumViewSwitchClick(): void {
    setAlbumView(albumView === UIAlbumView.Compact ? UIAlbumView.Extended : UIAlbumView.Compact);
  }

  function renderAlbumViewSwitch(): ReactElement {
    return <button
      className="button playlist-album-view-switch"
      onClick={onAlbumViewSwitchClick}>Switch View</button>
  }

  function renderAlbum(album: Album, index: number): ReactElement {
    // #TODO investigate render issue
    if (!album) {
      return null;
    }
    switch (albumView) {
      case UIAlbumView.Extended:
        return (
          <li key={album._id}>
            <AlbumView
              isCurrent={album._id === currentAlbumId}
              currentTrackId={currentTrackId}
              playlistId={playlist._id}
              album={album}
              onContextMenu={onAlbumContextMenu}/>
          </li>
        );
      case UIAlbumView.Compact:
        return (
          <li key={album._id}>
            <CompactAlbumView
              playlistId={playlist._id}
              album={album}
              index={index}
              isCurrent={album._id === currentAlbumId}
              onDragEnd={onDragEnd}
              onAlbumMove={onAlbumMove}
              onContextMenu={onAlbumContextMenu}/>
          </li>
        );
    }
  }

  const playlistClasses = cx('playlist-view', { 'is-current': isCurrent });
	return (
		<section className={playlistClasses}>
      <header className="playlist-header">
        {renderAlbumViewSwitch()}
        <PlaylistViewTitle
          playlist={playlist}
          onTitleChange={onTitleChange}/>
      </header>
      {
        hasAlbums
          ? <ol className="album-list">{albumOrder.map((_id, index) => renderAlbum(albums[_id], index))}</ol>
          : <p className="playlist-empty-placeholder">Playlist is empty.</p>
      }
    </section>
	);
}
