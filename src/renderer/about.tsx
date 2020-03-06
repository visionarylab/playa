import { ipcRenderer as ipc } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import WebFont from 'webfontloader';
import initI18n from './initializers/initI18n';
import { AboutView } from './components/AboutView/AboutView'

import {
  name,
  description,
  version,
  homepage,
  repository
} from '../../package.json';

import { FONTS, IPC_MESSAGES } from '../constants';

const {
  IPC_ABOUT_CLOSE_WINDOW,
  IPC_ABOUT_OPEN_LINK
} = IPC_MESSAGES;

window.addEventListener('load', async () => {
  WebFont.load({ custom: { families: FONTS } });
  initI18n();

  function onLinkClick(url: string): void {
    ipc.send(IPC_ABOUT_OPEN_LINK, url);
  }

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    switch (event.code) {
      case 'Escape':
        ipc.send(IPC_ABOUT_CLOSE_WINDOW);
        break;
    }
  });

  ReactDOM.render(
    <AboutView
      name={name}
      description={description}
      version={version}
      homepage={homepage}
      repository={repository}
      tos={`${homepage}/terms-of-service`}
      onLinkClick={onLinkClick}/>,
    document.getElementById('about')
  );
});
