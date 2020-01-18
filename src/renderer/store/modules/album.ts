import { ipcRenderer as ipc } from 'electron';
import { EntityHashMap, toObj, ensureAll, updateId } from '../../utils/storeUtils';

import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_ALBUM_GET_LIST_REQUEST,
  IPC_ALBUM_CONTENT_REQUEST
} = IPC_MESSAGES;

export const VARIOUS_ARTISTS_ID = '_various-artists';

export interface Album {
  _id: string;
  artist: string;
  title: string;
  year?: number;
  type: string;
  created: string;
  path: string;
  tracks: string[];
}

export function getDefaultAlbum(): Album {
  const now = new Date().toISOString();
  return {
    _id: null,
    artist: '',
    title: '',
    type: 'album',
    created: now,
    path: '',
    tracks: []
  };
}

export interface AlbumState {
  allById: EntityHashMap<Album>;
}

export const ALBUM_GET_LIST_REQUEST     = 'playa/album/GET_LIST_REQUEST';
export const ALBUM_GET_LIST_RESPONSE    = 'playa/album/GET_LIST_RESPONSE';
export const ALBUM_GET_CONTENT_REQUEST  = 'playa/album/GET_CONTENT_REQUEST';
export const ALBUM_GET_CONTENT_RESPONSE = 'playa/album/GET_CONTENT_RESPONSE';

interface GetAlbumListRequestAction {
  type: typeof ALBUM_GET_LIST_REQUEST;
  ids: string[];
}

interface GetAlbumListResponseAction {
  type: typeof ALBUM_GET_LIST_RESPONSE;
  results: Album[];
}

interface GetAlbumContentRequestAction {
  type: typeof ALBUM_GET_CONTENT_REQUEST;
  album: Album;
}

interface GetAlbumContentResponseAction {
  type: typeof ALBUM_GET_CONTENT_RESPONSE;
  album: Album;
}

export type AlbumActionTypes =
    GetAlbumListRequestAction
  | GetAlbumListResponseAction
  | GetAlbumContentRequestAction
  | GetAlbumContentResponseAction;

export const getAlbumListRequest = (ids: string[]): Function =>
  async (dispatch: Function): Promise<void> => {
    dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results: await ipc.invoke(IPC_ALBUM_GET_LIST_REQUEST, ids)
    });
  }

export const getAlbumContentRequest = (album: Album): Function =>
  async (dispatch: Function): Promise<void> => {
    dispatch({
      type: ALBUM_GET_CONTENT_RESPONSE,
      album: await ipc.invoke(IPC_ALBUM_CONTENT_REQUEST, album)
    });
  }

export const getAlbumContentResponse = (album: Album): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_GET_CONTENT_RESPONSE,
      album
    });
  }

const INITIAL_STATE = {
  allById: {}
};

export default function reducer(
  state: AlbumState = INITIAL_STATE,
  action: AlbumActionTypes
): AlbumState {
  switch (action.type) {
    case ALBUM_GET_LIST_RESPONSE:
      return {
        ...state,
        allById: {
          ...state.allById,
          ...toObj(ensureAll<Album>(action.results, getDefaultAlbum))
        }
      };
    case ALBUM_GET_CONTENT_RESPONSE:
      return {
        ...state,
        allById: updateId(state.allById, action.album._id, action.album)
      };
    case ALBUM_GET_CONTENT_REQUEST:
    case ALBUM_GET_LIST_REQUEST:
    default:
			return state;
  }
}
