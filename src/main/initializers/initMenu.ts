import { app, Menu } from 'electron';
import { IPC_MESSAGES } from '../../constants';
const {
  IPC_UI_NAVIGATE_TO
} = IPC_MESSAGES;

import {
  SEARCH,
  PLAYLIST_ALL,
} from '../../renderer/routes';

export default function initMenu(window: Electron.BrowserWindow): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'selectAll' },
        {
          label: 'Search',
          accelerator: 'cmd+f',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, SEARCH)
        }
      ]
    },
    {
      label: 'Playlist',
      submenu: [
        {
          label: 'Show All',
          accelerator: 'cmd+p',
          click: (): void => window.webContents.send(IPC_UI_NAVIGATE_TO, PLAYLIST_ALL)
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
