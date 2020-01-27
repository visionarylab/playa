import { History } from "history";
import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';

import { IPC_MESSAGES } from '../../constants';

const {
  IPC_ERROR,
  IPC_UI_NAVIGATE_TO,
  IPC_UI_FOCUS_SEARCH
} = IPC_MESSAGES;

type InitIpcParams = {
  history: History;
  focusSearchHandler: (_event: IpcRendererEvent) => void;
}

export default function initIpc({
  history,
  focusSearchHandler
}: InitIpcParams): Function {
  function errorHandler (_event: IpcRendererEvent, error: Error): void {
    console.log(error);
  }
  function navigateHandler (_event: IpcRendererEvent, path: string): void {
    history.replace(path);
  }
  ipc.on(IPC_ERROR, errorHandler);
  ipc.on(IPC_UI_NAVIGATE_TO, navigateHandler);
  ipc.on(IPC_UI_FOCUS_SEARCH, focusSearchHandler);
  return (): void => {
    ipc.removeListener(IPC_ERROR, errorHandler);
    ipc.removeListener(IPC_UI_NAVIGATE_TO, navigateHandler);
    ipc.removeListener(IPC_UI_FOCUS_SEARCH, focusSearchHandler);
  }
}
