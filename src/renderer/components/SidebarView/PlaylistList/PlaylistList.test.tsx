import * as React from 'react';
import { renderInAll, mockRouter } from '../../../../../test/testUtils';

mockRouter({
  routeParams: { _id: '1' },
  routeMatch: { url: '/playlist/1' }
});

import { PlaylistList } from './PlaylistList';
import { playlists } from '../../../../../test/testFixtures';

describe('PlaylistList', () => {
  it('should render a .playlist-list', () => {
    const wrapper = renderInAll(<PlaylistList playlists={playlists} currentPlaylistId={null}/>);
    expect(wrapper.is('.playlist-list')).toBe(true);
  });
  it('should render n=playlists.length list items', () => {
    const wrapper = renderInAll(<PlaylistList playlists={playlists} currentPlaylistId={null}/>);
    expect(wrapper.find('li')).toHaveLength(playlists.length);
  });
});
