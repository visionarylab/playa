import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);
import { History } from 'history';
import { IpcMock, ipcEvent } from '../../../test/mockIpc';

const ipcRenderer = new IpcMock();

jest.mock('electron', () => ({
  ipcRenderer
}));

import { playlists, albums } from '../../../test/testFixtures';
import { toObj } from '../utils/storeUtils';
import initIpc from './initIpc';
import { IPC_MESSAGES } from '../../constants';

const {
  IPC_ERROR,
  IPC_UI_NAVIGATE_TO,
  IPC_UI_FOCUS_SEARCH,
  IPC_PLAYBACK_PREV_TRACK,
  IPC_PLAYBACK_NEXT_TRACK,
  IPC_PLAYBACK_CLEAR_QUEUE,
  IPC_UI_SWIPE,
  IPC_UI_LIBRARY_SET_VIEW,
  IPC_LIBRARY_IMPORT_MUSIC,
  IPC_LIBRARY_EDIT_ALBUM,
  IPC_LIBRARY_ADD_ALBUMS_TO_PLAYLIST,
  IPC_LIBRARY_REMOVE_ALBUMS,
  IPC_PLAYLIST_REMOVE_ALBUMS,
  IPC_LIBRARY_REVEAL_ALBUM,
  IPC_UI_EDIT_PLAYLIST_TITLE,
  IPC_UI_EDIT_ARTIST_TITLE,
  IPC_UI_REMOVE_PLAYLISTS
} = IPC_MESSAGES;

describe('initIpc', () => {
  const store = mockStore({
    playlists: {
      allById: toObj(playlists)
    },
    albums: {
      allById: toObj(albums)
    },
    artists: {
      allById: {}
    },
    tracks: {
      allById: {}
    },
    waveforms: {
      allById: {}
    },
    player: {
      queue: []
    }
  });

  initIpc({
    dispatch: store.dispatch,
    store,
    focusSearchHandler: jest.fn(),
    importMusicHandler: jest.fn(),
    addAlbumsToPlaylistHandler: jest.fn(),
    history: {
      replace: jest.fn(),
      goBack: jest.fn(),
      goForward: jest.fn()
    } as unknown as History
  });

  it('should handle IPC_ERROR', () => {
    const handler = ipcRenderer.handlers[IPC_ERROR];
    ipcRenderer.trigger(IPC_ERROR, 'Error message');
    expect(handler).toHaveBeenCalledWith(ipcEvent, 'Error message');
  });

  it('should handle IPC_UI_NAVIGATE_TO', () => {
    const handler = ipcRenderer.handlers[IPC_UI_NAVIGATE_TO];
    ipcRenderer.trigger(IPC_UI_NAVIGATE_TO, 'library');
    expect(handler).toHaveBeenCalledWith(ipcEvent, 'library');
  });

  it('should handle IPC_UI_FOCUS_SEARCH', () => {
    const handler = ipcRenderer.handlers[IPC_UI_FOCUS_SEARCH];
    ipcRenderer.trigger(IPC_UI_FOCUS_SEARCH);
    expect(handler).toHaveBeenCalledWith(ipcEvent);
  });

  it('should handle IPC_PLAYBACK_PREV_TRACK', () => {
    const handler = ipcRenderer.handlers[IPC_PLAYBACK_PREV_TRACK];
    ipcRenderer.trigger(IPC_PLAYBACK_PREV_TRACK);
    expect(handler).toHaveBeenCalledWith(ipcEvent);
  });

  it('should handle IPC_PLAYBACK_NEXT_TRACK', () => {
    const handler = ipcRenderer.handlers[IPC_PLAYBACK_NEXT_TRACK];
    ipcRenderer.trigger(IPC_PLAYBACK_NEXT_TRACK);
    expect(handler).toHaveBeenCalledWith(ipcEvent);
  });

  it('should handle IPC_PLAYBACK_CLEAR_QUEUE', () => {
    const handler = ipcRenderer.handlers[IPC_PLAYBACK_CLEAR_QUEUE];
    ipcRenderer.trigger(IPC_PLAYBACK_CLEAR_QUEUE);
    expect(handler).toHaveBeenCalledWith(ipcEvent);
  });

  it('should handle IPC_UI_SWIPE', () => {
    const handler = ipcRenderer.handlers[IPC_UI_SWIPE];
    ipcRenderer.trigger(IPC_UI_SWIPE, 'left');
    expect(handler).toHaveBeenCalledWith(ipcEvent, 'left');
    ipcRenderer.trigger(IPC_UI_SWIPE, 'right');
    expect(handler).toHaveBeenCalledWith(ipcEvent, 'right');
  });

  it('should handle IPC_UI_LIBRARY_SET_VIEW', () => {
    const handler = ipcRenderer.handlers[IPC_UI_LIBRARY_SET_VIEW];
    ipcRenderer.trigger(IPC_UI_LIBRARY_SET_VIEW, 'Artists');
    expect(handler).toHaveBeenCalledWith(ipcEvent, 'Artists');
  });

  it('should handle IPC_LIBRARY_IMPORT_MUSIC', () => {
    const handler = ipcRenderer.handlers[IPC_LIBRARY_IMPORT_MUSIC];
    ipcRenderer.trigger(IPC_LIBRARY_IMPORT_MUSIC);
    expect(handler).toHaveBeenCalledWith(ipcEvent);
  });

  it('should handle IPC_LIBRARY_EDIT_ALBUM', () => {
    const handler = ipcRenderer.handlers[IPC_LIBRARY_EDIT_ALBUM];
    ipcRenderer.trigger(IPC_LIBRARY_EDIT_ALBUM, '1');
    expect(handler).toHaveBeenCalledWith(ipcEvent, '1');
  });

  it('should handle IPC_LIBRARY_ADD_ALBUMS_TO_PLAYLIST', () => {
    const handler = ipcRenderer.handlers[IPC_LIBRARY_ADD_ALBUMS_TO_PLAYLIST];
    ipcRenderer.trigger(IPC_LIBRARY_ADD_ALBUMS_TO_PLAYLIST, ['1']);
    expect(handler).toHaveBeenCalledWith(ipcEvent, ['1']);
  });

  it('should handle IPC_LIBRARY_REMOVE_ALBUMS', () => {
    const handler = ipcRenderer.handlers[IPC_LIBRARY_REMOVE_ALBUMS];
    ipcRenderer.trigger(IPC_LIBRARY_REMOVE_ALBUMS, ['1', '2']);
    expect(handler).toHaveBeenCalledWith(ipcEvent, ['1', '2']);
  });

  it('should handle IPC_PLAYLIST_REMOVE_ALBUMS', () => {
    const handler = ipcRenderer.handlers[IPC_PLAYLIST_REMOVE_ALBUMS];
    ipcRenderer.trigger(IPC_PLAYLIST_REMOVE_ALBUMS, ['1', '2']);
    expect(handler).toHaveBeenCalledWith(ipcEvent, ['1', '2']);
  });

  it('should handle IPC_LIBRARY_REVEAL_ALBUM', () => {
    const handler = ipcRenderer.handlers[IPC_LIBRARY_REVEAL_ALBUM];
    ipcRenderer.trigger(IPC_LIBRARY_REVEAL_ALBUM, ['1', '2']);
    expect(handler).toHaveBeenCalledWith(ipcEvent, ['1', '2']);
  });

  it('should handle IPC_UI_EDIT_PLAYLIST_TITLE', () => {
    const handler = ipcRenderer.handlers[IPC_UI_EDIT_PLAYLIST_TITLE];
    ipcRenderer.trigger(IPC_UI_EDIT_PLAYLIST_TITLE, '1');
    expect(handler).toHaveBeenCalledWith(ipcEvent, '1');
  });

  it('should handle IPC_UI_EDIT_ARTIST_TITLE', () => {
    const handler = ipcRenderer.handlers[IPC_UI_EDIT_ARTIST_TITLE];
    ipcRenderer.trigger(IPC_UI_EDIT_ARTIST_TITLE, '1');
    expect(handler).toHaveBeenCalledWith(ipcEvent, '1');
  });

  it('should handle IPC_UI_REMOVE_PLAYLISTS', () => {
    const handler = ipcRenderer.handlers[IPC_UI_REMOVE_PLAYLISTS];
    ipcRenderer.trigger(IPC_UI_REMOVE_PLAYLISTS, ['1']);
    expect(handler).toHaveBeenCalledWith(ipcEvent, ['1']);
  });
});
