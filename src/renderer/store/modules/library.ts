import { intersection, uniq, without } from 'lodash';
import { ipcRenderer as ipc } from 'electron';
import { toArray } from '../../utils/storeUtils';

import {
  Playlist,
  PLAYLIST_GET_LIST_RESPONSE
} from './playlist';

import {
  Album,
  ALBUM_GET_LIST_RESPONSE
} from './album';

import {
  PLAYER_UPDATE_QUEUE
} from './player';

import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_ALBUM_GET_LATEST_REQUEST,
  IPC_ALBUM_DELETE_LIST_REQUEST,
  IPC_PLAYLIST_SAVE_LIST_REQUEST,
  IPC_ALBUM_GET_STATS_REQUEST
} = IPC_MESSAGES;

const DEFAULT_LATEST_ALBUM_LIMIT = 10;

export type Artist = {
  name: string;
  count: number;
}

export interface LibraryState {
  latestAlbumId: Album['_id'];
  latest: Album['_id'][];
  artists: Artist[];
}

export const LIBRARY_GET_LATEST_REQUEST   = 'playa/library/GET_LATEST_REQUEST';
export const LIBRARY_GET_LATEST_RESPONSE  = 'playa/library/GET_LATEST_RESPONSE';
export const LIBRARY_ADD_TO_LATEST_ALBUMS = 'playa/library/ADD_TO_LATEST_ALBUMS';
export const LIBRARY_GET_ARTISTS_REQUEST  = 'playa/library/GET_ARTISTS_REQUEST';
export const LIBRARY_GET_ARTISTS_RESPONSE = 'playa/library/GET_ARTISTS_RESPONSE';

interface LibraryGetLatestRequestAction {
  type: typeof LIBRARY_GET_LATEST_REQUEST;
}

interface LibraryGetLatestResponseAction {
  type: typeof LIBRARY_GET_LATEST_RESPONSE;
  results: Album[];
}

interface AddAlbumsToLatestLibraryAction {
  type: typeof LIBRARY_ADD_TO_LATEST_ALBUMS;
  albums: Album[];
}

interface LibraryGetArtistsRequestAction {
  type: typeof LIBRARY_GET_ARTISTS_REQUEST;
}

interface LibraryGetArtistsResponseAction {
  type: typeof LIBRARY_GET_ARTISTS_RESPONSE;
  artists: Artist[];
}


export type LibraryActionTypes =
    LibraryGetLatestRequestAction
  | LibraryGetLatestResponseAction
  | AddAlbumsToLatestLibraryAction
  | LibraryGetArtistsRequestAction
  | LibraryGetArtistsResponseAction;

export const getLatestRequest = (
  dateFrom = new Date().toISOString(),
  limit = DEFAULT_LATEST_ALBUM_LIMIT
): Function =>
  async (dispatch: Function): Promise<void> => {
    const results: Album[] = await ipc.invoke(IPC_ALBUM_GET_LATEST_REQUEST, dateFrom, limit);
    dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results
    });
    dispatch({
      type: LIBRARY_GET_LATEST_RESPONSE,
      results
    });
  }

export const addAlbumsToLibrary = (albums: Album[]): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: LIBRARY_ADD_TO_LATEST_ALBUMS,
      albums
    });
    dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results: albums
    });
  }

export const removeAlbums = (albumsToRemove: Album[]): Function =>
  async (dispatch: Function, getState: Function): Promise<void> => {
    const {
      library,
      albums,
      player,
      playlists
    } = getState();
    const currentAlbums: Album[] = library.latest.map((_id: Album['_id']) => albums.allById[_id]);
    const queue: Album['_id'][] = player.queue;
    const albumsToRemoveIDs = albumsToRemove.map(({ _id }) => _id);
    const results = await ipc.invoke(IPC_ALBUM_DELETE_LIST_REQUEST, albumsToRemove);

    if (results.length === 0) {
      return;
    }

    dispatch({
      type: LIBRARY_GET_LATEST_RESPONSE,
      results: currentAlbums.filter(({ _id }) => albumsToRemoveIDs.indexOf(_id) < 0)
    });
    dispatch({
      type: PLAYER_UPDATE_QUEUE,
      queue: queue.filter(_id => albumsToRemoveIDs.indexOf(_id) < 0)
    });

    const playlistsToUpdate =
      toArray(playlists.allById)
      .filter(({ albums: albumIDs }) =>
        intersection(albumIDs, albumsToRemoveIDs).length > 0
      ).map((playlist: Playlist) => {
        return {
          ...playlist,
          albums: without(playlist.albums, ...albumsToRemoveIDs)
        }
      });

    if (playlistsToUpdate.length === 0) {
      return;
    }
    const updatedPlaylists: Array<{ id: string; rev: string; ok: boolean }>
      = await ipc.invoke(IPC_PLAYLIST_SAVE_LIST_REQUEST, playlistsToUpdate);

    dispatch({
      type: PLAYLIST_GET_LIST_RESPONSE,
      playlists: updatedPlaylists.map(({ id, rev: _rev }) => ({
        ...playlistsToUpdate.find(({ _id }) => _id === id),
        _rev
      }))
    });
  }

export const getArtists = (): Function =>
  async (dispatch: Function, getState: Function): Promise<void> => {
    const { library } = getState();
    if (library.artists.length > 0) {
      return;
    }
    const results = await ipc.invoke(IPC_ALBUM_GET_STATS_REQUEST, 'artist');
    const artists = results.reduce((
      memo: Artist[],
      { key: name, value: count }: { key: string; value: number }
    ) => {
      memo.push({ name, count });
      return memo;
    }, []);
    dispatch({
      type: LIBRARY_GET_ARTISTS_RESPONSE,
      artists
    });
  }

const INITIAL_STATE = {
  latest: [] as Album['_id'][],
  latestAlbumId: null as Album['_id'],
  artists: [] as Artist[]
};

function getLatestAlbumId(albums: Album[]): Album['_id'] {
  if (!albums.length) {
    return '0';
  }
  return [...albums].sort((a: Album, b: Album) =>
    new Date(b.created).getTime() - new Date(a.created).getTime()
  )[0]._id;
}

export default function reducer(
  state: LibraryState = INITIAL_STATE,
  action: LibraryActionTypes
): LibraryState {
  switch (action.type) {
    case LIBRARY_GET_LATEST_RESPONSE:
      return {
        ...state,
        latestAlbumId: getLatestAlbumId(action.results),
        latest: action.results.map(({ _id }) => _id)
      };
    case LIBRARY_ADD_TO_LATEST_ALBUMS:
      return {
        ...state,
        latestAlbumId: getLatestAlbumId(action.albums),
        latest: uniq([...action.albums.map(({ _id }) => _id), ...state.latest])
      };
    case LIBRARY_GET_ARTISTS_RESPONSE:
      return {
        ...state,
        artists: action.artists
      };
    case LIBRARY_GET_LATEST_REQUEST:
    case LIBRARY_GET_ARTISTS_REQUEST:
		default:
			return state;
  }
}
