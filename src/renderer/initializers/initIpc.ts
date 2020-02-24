import { History } from "history";
import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { playPreviousTrack, playNextTrack } from '../store/modules/player';

import { IPC_MESSAGES } from '../../constants';

const {
  IPC_ERROR,
  IPC_UI_NAVIGATE_TO,
  IPC_UI_FOCUS_SEARCH,
  IPC_PLAYBACK_PREV_TRACK,
  IPC_PLAYBACK_NEXT_TRACK,
  IPC_UI_SWIPE
} = IPC_MESSAGES;

type InitIpcParams = {
  history: History;
  dispatch: Function;
  focusSearchHandler: (_event: IpcRendererEvent) => void;
}

export default function initIpc({
  history,
  dispatch,
  focusSearchHandler
}: InitIpcParams): Function {
  const handlerMap = {
    [IPC_ERROR]: (_event: IpcRendererEvent, error: Error): void => console.log('[ipc]', error),
    [IPC_UI_NAVIGATE_TO]: (_event: IpcRendererEvent, path: string): void => history.replace(path),
    [IPC_UI_FOCUS_SEARCH]: focusSearchHandler,
    [IPC_PLAYBACK_PREV_TRACK]: (): void => dispatch(playPreviousTrack()),
    [IPC_PLAYBACK_NEXT_TRACK]: (): void => dispatch(playNextTrack()),
    [IPC_UI_SWIPE]: (_event: IpcRendererEvent, direction: string): void => {
      if (direction === 'left') {
        history.goBack();
      } else {
        history.goForward();
      }
    }
  }

  const entries = Object.entries(handlerMap);
  entries.forEach(
    ([event, handler]) => ipc.on(event, handler)
  );

  return (): void => entries.forEach(
    ([event, handler]) => ipc.removeListener(event, handler)
  );
}
