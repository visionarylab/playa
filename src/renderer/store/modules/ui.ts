import { ipcRenderer as ipc } from 'electron';

import { IPC_MESSAGES } from '../../../constants';
const {
  IPC_UI_STATE_UPDATE
} = IPC_MESSAGES;

const MAX_TITLE_LENGTH = 50;

function trimTitle(title: string): string {
  return title.length > MAX_TITLE_LENGTH
    ? `${title.substr(0, MAX_TITLE_LENGTH)}…`
    : title;
}

export const UIDragTypes = {
  SEARCH_RESULTS: 'SEARCH_RESULTS',
  COMPACT_ALBUMS: 'COMPACT_ALBUMS',
  LIBRARY_ALBUMS: 'LIBRARY_ALBUMS'
};

export enum UIAlbumView {
  Compact,
  Extended
}

export type UIState = {
  started?: boolean;
};

export const STATE_UPDATE = 'playa/ui/STATE_UPDATE';
export const TITLE_UPDATE = 'playa/ui/TITLE_UPDATE';

interface UpdateStateAction {
  type: typeof STATE_UPDATE;
  params: object;
}

interface UpdateTitleAction {
  type: typeof TITLE_UPDATE;
  title: string;
}

export type UIActionTypes =
    UpdateStateAction
  | UpdateTitleAction;

export const updateState = (params: object): Function =>
  (dispatch: Function): void => {
    ipc.send(IPC_UI_STATE_UPDATE, params);
    dispatch({
      type: STATE_UPDATE,
      params
    });
  }

export const updateTitle = (title: string): Function =>
  (dispatch: Function): void => {
    document.title = trimTitle(title);
    dispatch({
      type: TITLE_UPDATE,
      title
    });
  }

const INITIAL_STATE = {
  started: true
};

export default function reducer(
  state: UIState = INITIAL_STATE,
  action: UIActionTypes
): UIState {
	switch (action.type) {
    case STATE_UPDATE:
    case TITLE_UPDATE:
		default:
			return state;
	}
}
