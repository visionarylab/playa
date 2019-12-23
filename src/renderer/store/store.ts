import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import uiReducer from './modules/ui';
import playlistReducer from './modules/playlists';

const rootReducer = combineReducers({
  playlists: playlistReducer,
  ui: uiReducer
});

const store = createStore(rootReducer, {}, applyMiddleware(thunk));

export default store;
