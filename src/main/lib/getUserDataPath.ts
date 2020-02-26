import * as Path from 'path';
import { app } from 'electron';
import { is } from 'electron-util';
import { name as APP_NAME } from '../../../package.json';

export default function getUserDataPath(): string {
  let userDataPath = app.getPath('userData');
  if (process.env.RUNNING_IN_SPECTRON) {
    userDataPath = Path.join(process.cwd(), '.spectron');
  }
  if (is.development) {
    userDataPath = userDataPath.replace('Electron', APP_NAME);
  }
  return userDataPath;
}
