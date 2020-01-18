import * as React from 'react';
import { render } from 'enzyme';

import { SearchResultList } from './SearchResultList';
import { albums } from '../../../../../test/fixtures';

test.skip('renders n items when n results', () => {
  const wrapper = render(
    <SearchResultList
      results={albums}
      query="#!q"
      isSearching={false}
      onResultContextMenu={jest.fn()}
      onResultDoubleClick={jest.fn()}/>
  );
  expect(wrapper.find('li').length).toBe(albums.length);
});


test('renders empty component when 0 results', () => {
  const wrapper = render(
    <SearchResultList
      results={[]}
      query="#!q"
      isSearching={false}
      onResultContextMenu={jest.fn()}
      onResultDoubleClick={jest.fn()}/>
  );
  expect(wrapper.find('.search-result-list-empty-component').length).toBe(1);
});
