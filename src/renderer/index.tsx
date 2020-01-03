import { ipcRenderer } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import MainLayout from './layouts/MainLayout';
import { store, history } from './store/store';
import { SEARCH } from './routes'
import './style.scss';

ipcRenderer.on('search:show', () => {
  history.push(SEARCH);
});

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <MainLayout />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);
