import { Store, Reducer, combineReducers, createStore, applyMiddleware } from 'redux';
import { RouterState, connectRouter, routerMiddleware } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { History, createHashHistory } from 'history';

import Player from '../lib/player';
import uiReducer, { UIState } from './modules/ui';
import initPlayerReducer, { PlayerState } from './modules/player';
import playlistReducer, { PlaylistState } from './modules/playlist';
import albumReducer, { AlbumState } from './modules/album';
import artistReducer, { ArtistState } from './modules/artist';
import libraryReducer, { LibraryState } from './modules/library';
import searchReducer, { SearchState } from './modules/search';
import trackReducer, { TrackState } from './modules/track';
import waveformReducer, { WaveformState } from './modules/waveform';

const history = createHashHistory();
const initialState = {};

export type ApplicationState = {
  router: RouterState;
  ui: UIState;
  player: PlayerState;
  playlists: PlaylistState;
  albums: AlbumState;
  artists: ArtistState;
  library: LibraryState;
  search: SearchState;
  tracks: TrackState;
  waveforms: WaveformState;
}

function createRootReducer (history: History, player: Player): Reducer {
  return combineReducers<ApplicationState>({
    router: connectRouter(history),
    ui: uiReducer,
    player: initPlayerReducer(player),
    playlists: playlistReducer,
    albums: albumReducer,
    artists: artistReducer,
    library: libraryReducer,
    search: searchReducer,
    tracks: trackReducer,
    waveforms: waveformReducer
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
