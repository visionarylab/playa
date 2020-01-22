import { ipcRenderer as ipc } from 'electron';
import { EntityHashMap, toObj, ensureAll } from '../../utils/storeUtils';

import { IPC_MESSAGES } from '../../../constants';

const {
  IPC_TRACK_GET_LIST_REQUEST
} = IPC_MESSAGES;


export interface Track {
  _id: string;
  path: string;
  found: boolean;
  artist: string;
  title: string;
  number: number;
  duration: number;
}

export function getDefaultTrack(): Track {
  return {
    _id: null,
    path: '',
    found: false,
    artist: '',
    title: '',
    number: null,
    duration: null
  };
}

export interface TrackState {
  allById: EntityHashMap<Track>;
}

export const TRACK_GET_LIST_REQUEST  = 'playa/track/GET_LIST_REQUEST';
export const TRACK_GET_LIST_RESPONSE = 'playa/track/GET_LIST_RESPONSE';


interface GetTrackListRequestAction {
  type: typeof TRACK_GET_LIST_REQUEST;
  ids: string[];
}

interface GetTrackListResponseAction {
  type: typeof TRACK_GET_LIST_RESPONSE;
  results: Track[];
}

export type TrackActionTypes =
    GetTrackListRequestAction
  | GetTrackListResponseAction;

export const getTrackListRequest = (ids: string[]): Function =>
  async (dispatch: Function): Promise<void> => {
    dispatch({
      type: TRACK_GET_LIST_RESPONSE,
      results: await ipc.invoke(IPC_TRACK_GET_LIST_REQUEST, ids)
    });
  }

export const getTrackListResponse = (results: Track[]): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: TRACK_GET_LIST_RESPONSE,
      results
    });
  }

const INITIAL_STATE = {
  allById: {}
};

export default function reducer(
  state: TrackState = INITIAL_STATE,
  action: TrackActionTypes
): TrackState {
  switch (action.type) {
    case TRACK_GET_LIST_RESPONSE:
      return {
        ...state,
        allById: {
          ...state.allById,
          ...toObj(ensureAll<Track>(action.results, getDefaultTrack))
        }
      };
    case TRACK_GET_LIST_REQUEST:
    default:
      return state;
  }
}
