import { playlists } from '../../../../test/fixtures';

import reducer, {
  Playlist,
  PlaylistActionTypes,
  PlaylistState,
  getAllPlaylistsRequest,
  savePlaylistRequest,
  deletePlaylistRequest,
  PLAYLIST_GET_ALL_REQUEST,
  PLAYLIST_GET_ALL_RESPONSE,
  PLAYLIST_SAVE_REQUEST,
  PLAYLIST_SAVE_RESPONSE,
  PLAYLIST_DELETE_REQUEST,
  PLAYLIST_DELETE_RESPONSE
} from './playlist';

describe('playlist actions', () => {
  describe('getAllPlaylistsRequest', () => {
    it.skip('should dispatch a getAllPlaylistsRequest request', () => {
      const dispatch = jest.fn();
      getAllPlaylistsRequest()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: PLAYLIST_GET_ALL_REQUEST
      });
    });
  });

  describe('savePlaylistRequest', () => {
    it.skip('should dispatch a savePlaylistRequest request', () => {
      const dispatch = jest.fn();
      const playlist = {} as Playlist;
      savePlaylistRequest(playlist)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: PLAYLIST_SAVE_REQUEST,
        playlist
      });
    });
  });

  describe('deletePlaylistRequest', () => {
    it.skip('should dispatch a deletePlaylistRequest request', () => {
      const dispatch = jest.fn();
      const playlist = {} as Playlist;
      deletePlaylistRequest(playlist)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: PLAYLIST_DELETE_REQUEST,
        playlist
      });
    });
  });
});

describe('playlist reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as PlaylistActionTypes)).toEqual({
      allById: {}
    });
  });

  it('should handle PLAYLIST_GET_ALL_REQUEST', () => {
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_GET_ALL_REQUEST
    })).toEqual({});
  });

  it('should handle PLAYLIST_GET_ALL_RESPONSE', () => {
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_GET_ALL_RESPONSE,
      playlists
    })).toEqual({
      allById: {
        "1": playlists[0],
        "2": playlists[1]
      }
    });
  });

  it('should handle PLAYLIST_SAVE_REQUEST', () => {
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_SAVE_REQUEST,
      playlist: playlists[0]
    })).toEqual({});
  });

  it('should handle PLAYLIST_SAVE_RESPONSE', () => {
    const initialState = {
      allById: {
        "1": playlists[0],
        "2": playlists[1]
      }
    };

    const updatedPlaylist = { ...playlists[0], title: 'Updated Title' };
    expect(reducer(initialState, {
      type: PLAYLIST_SAVE_RESPONSE,
      playlist: updatedPlaylist
    })).toEqual({
      allById: {
        "1": updatedPlaylist,
        "2": playlists[1]
      }
    });
  });

  it('should handle PLAYLIST_DELETE_REQUEST', () => {
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_DELETE_REQUEST,
      playlist: playlists[0]
    })).toEqual({});
  });

  describe('should handle PLAYLIST_DELETE_RESPONSE', () => {
    const initialState = {
      allById: {
        "1": playlists[0],
        "2": playlists[1]
      }
    };

    it('should remove playlist by given id if found', () => {
      expect(reducer(initialState, {
        type: PLAYLIST_DELETE_RESPONSE,
        playlist: playlists[0]
      })).toEqual({
        ...initialState,
        allById: {
          "2": playlists[1]
        }
      });
    });

    it('should leave state unchanged if playlist is not found', () => {
      expect(reducer(initialState, {
        type: PLAYLIST_DELETE_RESPONSE,
        playlist: { _id: '666' } as Playlist
      })).toEqual(initialState);
    });
  });
});
