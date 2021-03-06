import { escapeRegExp }from 'lodash';
import { ipcRenderer as ipc } from 'electron';
import createCachedSelector from 're-reselect';
import {
  EntityHashMap,
  toObj,
  toArray,
  removeIds,
  ensureAll,
  updateId
} from '../../utils/storeUtils';
import { VARIOUS_ARTIST_KEY, NUMERIC_KEY } from '../../utils/artistUtils';
export const VARIOUS_ARTISTS_ID = 'V/A';

import { ApplicationState } from '../store';

export type Artist = {
  _id: string;
  _rev?: string;
  name: string;
  picture?: string;
  noDiscogsResults?: boolean;
}

export function getDefaultArtist(): Artist {
  return {
    _id: null,
    _rev: null,
    name: '',
    picture: null,
    noDiscogsResults: false
  };
}

export const VariousArtist = {
  ...getDefaultArtist(),
  _id: VARIOUS_ARTISTS_ID,
  name: VARIOUS_ARTISTS_ID
};

export const selectors = {
  state: ({ artists }: { artists: ArtistState }): ArtistState => artists,
  allById: ({ artists }: { artists: ArtistState }): EntityHashMap<Artist> => artists.allById,
  findById: ({ artists }: { artists: ArtistState }, id: Artist['_id']): Artist => artists.allById[id] || getDefaultArtist(),
  findByList: ({ artists }: { artists: ArtistState }, ids: Artist['_id'][]): Artist[] => ids.map(id => artists.allById[id]),
  findByLetter: ({ artists }: { artists: ArtistState }, letter: string): Artist[] => {
    if (letter === VARIOUS_ARTIST_KEY) {
      return [VariousArtist];
    }
    return Object.values(artists.allById).filter(({ name }) => {
      return (letter.match(/[a-z]/) && name.charAt(0).toLowerCase() === letter)
        || (!name.charAt(0).toLowerCase().match(/[a-z]/) && name !== VARIOUS_ARTISTS_ID && letter === NUMERIC_KEY);
    });
  }
};

import {
  Album,
  ALBUM_GET_LIST_RESPONSE
} from './album';

import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_ARTIST_GET_ALL_REQUEST,
  IPC_ARTIST_SAVE_REQUEST,
  IPC_ARTIST_DELETE_REQUEST,
  IPC_ALBUM_FIND_REQUEST,
  IPC_ARTIST_PICTURE_GET_REQUEST,
  IPC_ARTIST_PICTURE_GET_FROM_URL_REQUEST
} = IPC_MESSAGES;

export const ARTIST_GET_ALL_REQUEST   = 'playa/artists/GET_ALL_REQUEST';
export const ARTIST_GET_ALL_RESPONSE  = 'playa/artists/GET_ALL_RESPONSE';
export const ARTIST_GET_LIST_RESPONSE = 'playa/artists/GET_LIST_RESPONSE';
export const ARTIST_SAVE_REQUEST      = 'playa/artists/SAVE_REQUEST';
export const ARTIST_SAVE_RESPONSE     = 'playa/artists/SAVE_RESPONSE';
export const ARTIST_DELETE_REQUEST    = 'playa/artists/DELETE_REQUEST';
export const ARTIST_DELETE_RESPONSE   = 'playa/artists/DELETE_RESPONSE';

interface GetAllArtistRequestAction {
  type: typeof ARTIST_GET_ALL_REQUEST;
}

interface GetAllArtistResponseAction {
  type: typeof ARTIST_GET_ALL_RESPONSE;
  artists: Artist[];
}

interface GetArtistListResponseAction {
  type: typeof ARTIST_GET_LIST_RESPONSE;
  artists: Artist[];
}

interface SaveArtistRequestAction {
  type: typeof ARTIST_SAVE_REQUEST;
  artist: Artist;
}

interface SaveArtistResponseAction {
  type: typeof ARTIST_SAVE_RESPONSE;
  artist: Artist;
}

interface DeleteArtistRequestAction {
  type: typeof ARTIST_DELETE_REQUEST;
  artist: Artist;
}

interface DeleteArtistResponseAction {
  type: typeof ARTIST_DELETE_RESPONSE;
  artist: Artist;
}

export type ArtistActionTypes =
    GetAllArtistRequestAction
  | GetAllArtistResponseAction
  | GetArtistListResponseAction
  | SaveArtistRequestAction
  | SaveArtistResponseAction
  | DeleteArtistRequestAction
  | DeleteArtistResponseAction;

export const getArtistReleases = ({ _id }: Artist): Function =>
  async (dispatch: Function): Promise<void> => {
    const results = await ipc.invoke(IPC_ALBUM_FIND_REQUEST, { artist: _id });
    dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results
    });
  }

export const getAllArtistsRequest = (): Function =>
  async (dispatch: Function): Promise<void> => {
    const artists = await ipc.invoke(IPC_ARTIST_GET_ALL_REQUEST);
    dispatch({
      type: ARTIST_GET_ALL_RESPONSE,
      artists
    });
  }

export const saveArtistRequest = (artist: Artist): Function =>
  async (dispatch: Function): Promise<void> => {
    const savedArtist = await ipc.invoke(IPC_ARTIST_SAVE_REQUEST, artist);
    dispatch({
      type: ARTIST_SAVE_RESPONSE,
      artist: savedArtist
    });
  }

export const deleteArtistRequest = (artist: Artist): Function =>
  async (dispatch: Function): Promise<void> => {
    const deletedArtist = await ipc.invoke(IPC_ARTIST_DELETE_REQUEST, artist);
    dispatch({
      type: ARTIST_DELETE_RESPONSE,
      artist: deletedArtist
    });
  }

export const getArtistPictureRequest = (artist: Artist): Function =>
  async (dispatch: Function): Promise<void> => {
    if (artist.picture || artist.noDiscogsResults) {
      return;
    }
    const picture = await ipc.invoke(IPC_ARTIST_PICTURE_GET_REQUEST, artist);
    const savedArtist = await ipc.invoke(IPC_ARTIST_SAVE_REQUEST, {
      ...artist,
      picture,
      noDiscogsResults: !picture
    });
    dispatch({
      type: ARTIST_SAVE_RESPONSE,
      artist: savedArtist
    });
  }

export const getArtistPictureFromUrlRequest = (
  artist: Artist,
  url: string
): Function =>
  async (dispatch: Function): Promise<void> => {
    const picture = await ipc.invoke(IPC_ARTIST_PICTURE_GET_FROM_URL_REQUEST, artist, url);
    const savedArtist = await ipc.invoke(IPC_ARTIST_SAVE_REQUEST, {
      ...artist,
      picture,
      noDiscogsResults: !picture
    });
    dispatch({
      type: ARTIST_SAVE_RESPONSE,
      artist: savedArtist
    });
  }

export interface ArtistState {
  allById: EntityHashMap<Artist>;
  isLoading: boolean;
}

export const getAlbumsByArtist = createCachedSelector(
  selectors.findById,
  ({ albums }: ApplicationState) => albums.allById,
  ({ _id }, albums): Album[] => toArray(albums)
    .filter(({ artist }) => artist === _id)
    .sort((a, b) => a.year - b.year)
)((_state_: ApplicationState, id: string) => id);

export const searchArtists = createCachedSelector(
  selectors.allById,
  (_state: ApplicationState, query: string) => query,
  (artists, query) => toArray(artists).filter(
    ({ name }) => name.match(new RegExp(`${escapeRegExp(query)}`, 'gi'))
  )
)((_state_: ApplicationState, query: string) => query);

const INITIAL_STATE: ArtistState = {
	allById: {},
  isLoading: false
}

export default function reducer(
  state: ArtistState = INITIAL_STATE,
  action: ArtistActionTypes
): ArtistState {
  switch (action.type) {
    case ARTIST_GET_ALL_REQUEST:
      return {
        ...state,
        isLoading: true
      };
    case ARTIST_GET_ALL_RESPONSE:
      return {
        ...state,
        allById: toObj(ensureAll<Artist>(action.artists, getDefaultArtist)),
        isLoading: false
      };
    case ARTIST_GET_LIST_RESPONSE:
      return {
        ...state,
        allById: {
          ...state.allById,
          ...toObj(ensureAll<Artist>(action.artists, getDefaultArtist))
        }
      };
    case ARTIST_SAVE_RESPONSE:
      return {
        ...state,
        isLoading: false,
        allById: updateId(state.allById, action.artist._id, action.artist),
      };
    case ARTIST_DELETE_RESPONSE:
      return {
        ...state,
        allById: removeIds(state.allById, [action.artist._id])
      };
    case ARTIST_SAVE_REQUEST:
    case ARTIST_DELETE_REQUEST:
    default:
      return state;
  }
}
