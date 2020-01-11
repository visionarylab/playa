import { ipcRenderer as ipc } from 'electron';
import openContextMenu, { ContextMenuOptions } from '../../utils/contextMenu';

import { IPC_MESSAGES } from '../../../constants';
const { IPC_UI_START_ALBUM_DRAG } = IPC_MESSAGES;

export const AlbumDragType = 'ALBUMS';

export type UIState = {
  started?: boolean;
};

export const SHOW_CONTEXT_MENU = 'playa/ui/SHOW_CONTEXT_MENU';
export const START_ALBUM_DRAG = 'playa/ui/START_ALBUM_DRAG';

interface ShowContextMenuAction {
  type: typeof SHOW_CONTEXT_MENU;
  options: ContextMenuOptions;
}

interface StartAlbumDragAction {
  type: typeof START_ALBUM_DRAG;
  path: string;
}

export type UIActionTypes =
    ShowContextMenuAction
  | StartAlbumDragAction;

export const showContextMenu = (options: ContextMenuOptions): Function =>
  (dispatch: Function): void =>
    dispatch({
      type: SHOW_CONTEXT_MENU,
      options
    });

export const startAlbumDrag = (path: string): Function =>
  (dispatch: Function): void =>
    dispatch({
      type: START_ALBUM_DRAG,
      path
    });

const INITIAL_STATE = {
  started: true
};

export default function reducer(
  state: UIState = INITIAL_STATE,
  action: UIActionTypes
): UIState {
	switch (action.type) {
    case SHOW_CONTEXT_MENU:
      openContextMenu(action.options);
      return state;
    case START_ALBUM_DRAG:
      ipc.send(IPC_UI_START_ALBUM_DRAG, action.path);
      return state;
		default:
			return state;
	}
}
