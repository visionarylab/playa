import reducer, {
  UIActionTypes,
  UIState,
  updateState,
  updateTitle,
  setEditPlaylistTitle,
  UPDATE_STATE,
  UPDATE_TITLE,
  SET_EDIT_PLAYLIST_TITLE
} from './ui';

describe('ui actions', () => {
  describe('updateState', () => {
    it('should dispatch a updateState request', () => {
      const dispatch = jest.fn();
      const params = {};
      updateState(params)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: UPDATE_STATE,
        params
      });
    });
  });

  describe('updateTitle', () => {
    it('should dispatch a updateTitle request', () => {
      const dispatch = jest.fn();
      const title = 'title';
      updateTitle(title)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: UPDATE_TITLE,
        title
      });
    });
  });

  describe('setEditPlaylistTitle', () => {
    it('should dispatch a setEditPlaylistTitle request', () => {
      const dispatch = jest.fn();
      setEditPlaylistTitle(true)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: SET_EDIT_PLAYLIST_TITLE,
        editPlaylistTitle: true
      });
    });
  });
});

describe('ui reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as UIActionTypes)).toEqual({
      started: true,
      title: 'Playa',
      editPlaylistTitle: false
    });
  });

  it('should handle UPDATE_STATE', () => {
    expect(reducer({} as UIState, {
      type: UPDATE_STATE,
      params: {}
    })).toEqual({});
  });

  it('should handle UPDATE_TITLE', () => {
    expect(reducer({} as UIState, {
      type: UPDATE_TITLE,
      title: 'title'
    })).toEqual({
      title: 'title'
    });
  });

  it('should handle SET_EDIT_PLAYLIST_TITLE', () => {
    expect(reducer({} as UIState, {
      type: SET_EDIT_PLAYLIST_TITLE,
      editPlaylistTitle: true
    })).toEqual({
      editPlaylistTitle: true
    });
  });
});
