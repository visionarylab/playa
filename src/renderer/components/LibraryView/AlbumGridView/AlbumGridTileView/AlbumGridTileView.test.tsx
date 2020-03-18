import React from 'react';
import { renderInAll, mountInAll } from '../../../../../../test/testUtils';
import { albums, artists } from '../../../../../../test/testFixtures';
import { toObj } from '../../../../utils/storeUtils';
import { AlbumGridTileView } from './AlbumGridTileView';

const defaultStore = {
  artists: {
    allById: toObj(artists)
  },
  covers: {
    allById: {}
  }
};

describe('AlbumGridTileView', () => {
  it('should render a .album-grid-tile', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView album={albums[0]}/>
    , defaultStore);
    expect(wrapper.is('.album-grid-tile')).toBe(true);
  });

  it('should be a .is-playing if isPlaying', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView isPlaying album={albums[0]}/>
    , defaultStore);
    expect(wrapper.is('.is-playing')).toBe(true);
  });

  it('should contain an .album-cover', () => {
    const wrapper = renderInAll(
      <AlbumGridTileView album={albums[0]}/>
    , defaultStore);
    expect(wrapper.find('.album-cover')).toHaveLength(1);
  });

  it('should call the onDoubleClick handler when double clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <AlbumGridTileView
        onDoubleClick={handler}
        album={albums[0]}/>
    , defaultStore);
    wrapper.find('figure').simulate('doubleClick');
    expect(handler).toHaveBeenCalledWith(albums[0]);
  });

  it('should call the onContextMenu handler when right clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
      <AlbumGridTileView
        onContextMenu={handler}
        album={albums[0]}/>
    , defaultStore);
    wrapper.find('figure').simulate('contextmenu');
    expect(handler).toHaveBeenCalledWith(albums[0]);
  });
});
