import * as Path from 'path';
import { ipcMain as ipc } from 'electron';
import AppState from '../lib/appState';

import { IPC_MESSAGES } from '../../constants';

const {
  IPC_UI_STATE_LOAD,
  IPC_UI_UPDATE_STATE,
} = IPC_MESSAGES;

export default function initAppState(userDataPath: string): AppState {
  const appState = new AppState(
    Path.join(userDataPath, 'appState.json')
  );
  appState.load();

  ipc.handle(IPC_UI_STATE_LOAD, async () => appState.getState() );
  ipc.on(IPC_UI_UPDATE_STATE, (_event, params: object) => appState.setState(params) );

  return appState;
}
