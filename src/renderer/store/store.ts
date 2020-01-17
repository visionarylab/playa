import { Store, Reducer, combineReducers, createStore, applyMiddleware } from 'redux';
import { RouterState, connectRouter, routerMiddleware } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { History, createHashHistory } from 'history';

import Player from '../player';
import uiReducer, { UIState } from './modules/ui';
import initPlayerReducer, { PlayerState } from './modules/player';
import playlistReducer, { PlaylistState } from './modules/playlist';
import albumReducer, { AlbumState } from './modules/album';
import trackReducer, { TrackState } from './modules/track';
import coverReducer, { CoverState } from './modules/cover';

const history = createHashHistory();
const initialState = {};

export interface ApplicationState {
  router: RouterState;
  ui: UIState;
  player: PlayerState;
  playlists: PlaylistState;
  albums: AlbumState;
  tracks: TrackState;
  covers: CoverState;
}

function createRootReducer (history: History, player: Player): Reducer {
  return combineReducers<ApplicationState>({
    router: connectRouter(history),
    ui: uiReducer,
    player: initPlayerReducer(player),
    playlists: playlistReducer,
    albums: albumReducer,
    tracks: trackReducer,
    covers: coverReducer
  });
}

// Logging Middleware
const logger = createLogger({
  level: 'info',
  collapsed: true
});

const middleware = [
  thunk,
  logger,
  routerMiddleware(history)
];

function initStore(player: Player): Store {
  return createStore(
    createRootReducer(history, player),
    initialState,
    applyMiddleware(...middleware)
  );
}

export { initStore, history };
