import React, { ReactElement, useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { PlaylistView } from '../PlaylistView/PlaylistView';

import {
  getPlaylistRequest,
  savePlaylistRequest,
  getPlaylistById
} from '../../store/modules/playlist';

import { ApplicationState } from '../../store/store';
import { updateQueue } from '../../store/modules/player';
import { updateState, updateTitle } from '../../store/modules/ui';
import { Album } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { openContextMenu } from '../../lib/contextMenu';

import {
  PLAYLIST_CONTENT_CONTEXT_ACTIONS,
  PlaylistContentActions
} from '../../actions/playlistContentActions';

import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActions,
  AlbumActionsGroups
} from '../../actions/albumActions';

import { QUEUE } from '../../routes';

import actionsMap from '../../actions/actions';

export const PlaylistContainer = (): ReactElement => {
  const dispatch = useDispatch();
  const { _id } = useParams();
  const [loading, setLoading] = useState(false);

  const {
    playlist,
    albums,
    currentPlaylistId,
    currentAlbumId,
    currentTrackId
  } = useSelector((state: ApplicationState) => getPlaylistById(state, _id));

  useEffect(() => {
    dispatch(updateTitle(`playlist: ${playlist.title}`));
  }, [playlist.title]);

  useEffect(() => {
    if (playlist._rev) {
      dispatch(updateState({ lastOpenedPlaylistId: playlist._id }));
    }
    setLoading(false);
  }, [playlist._id, playlist._rev]);

  useEffect(() => {
    if (playlist._rev) {
      setLoading(true);
      dispatch(getPlaylistRequest(playlist._id));
    }
  }, [playlist]);

  function onAlbumOrderChange(newOrder: string[]): void {
    dispatch(savePlaylistRequest({ ...playlist, albums: newOrder }));
    if (playlist._id === currentPlaylistId) {
      dispatch(updateQueue(newOrder.map(x => albums[x]._id)));
    }
  }

  function onTitleChange(title: string ): void {
    if (title === playlist.title && playlist._rev) {
      return;
    }
    dispatch(savePlaylistRequest({ ...playlist, title }));
  }

  function onAlbumContextMenu(album: Album): void {
    openContextMenu([
      {
        type: PLAYLIST_CONTENT_CONTEXT_ACTIONS,
        playlist,
        selection: [album._id],
        dispatch
      },
      {
        type: ALBUM_CONTEXT_ACTIONS,
        album,
        queue: playlist.albums,
        dispatch,
        actionGroups: [
          AlbumActionsGroups.PLAYBACK,
          AlbumActionsGroups.SYSTEM,
          AlbumActionsGroups.SEARCH_ONLINE
        ]
      }
    ]);
  }

  function onAlbumDoubleClick(album: Album, track: Track): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      queue: playlist.albums,
      playlistId: playlist._id,
      album,
      trackId: track ? track._id : null,
      dispatch
    }).handler();
  }

  const albumActions = [
    {
      icon: 'minus-circle' as IconName,
      handler: (album: Album): void => {
        actionsMap(PlaylistContentActions.REMOVE_ALBUM)({
          playlist,
          selection: [album._id],
          dispatch
        }).handler();
      },
      title: 'Remove from playlist'
    },
    {
      icon: 'folder-open' as IconName,
      handler: (album: Album): void => {
        actionsMap(AlbumActions.REVEAL_IN_FINDER)({
          album,
          dispatch
        }).handler();
      },
      title: 'Reveal in Finder'
    }
  ];

	return (
    !playlist._id
      ? <Redirect to={QUEUE}/>
      : <CSSTransition
          in={loading}
          timeout={300}
          classNames="playlist-view"
          unmountOnExit>
          <PlaylistView
           albums={albums}
           playlist={playlist}
           isCurrent={currentPlaylistId === playlist._id}
           currentAlbumId={currentAlbumId}
           currentTrackId={currentTrackId}
           albumActions={albumActions}
           onAlbumOrderChange={onAlbumOrderChange}
           onTitleChange={onTitleChange}
           onAlbumContextMenu={onAlbumContextMenu}
           onAlbumDoubleClick={onAlbumDoubleClick}/>
       </CSSTransition>
	);
};
