import React, { FC } from 'react';
import { useDrag } from 'react-dnd';
import cx from 'classnames';
import { Album, VARIOUS_ARTISTS_ID } from '../../../../store/modules/album';
import { UIDragTypes } from '../../../../store/modules/ui';

type SearchResultListItemProps = {
  result: Album;
  onContextMenu: Function;
  onDoubleClick: Function;
};

export const SearchResultListItem: FC<SearchResultListItemProps> = ({
  result,
  onContextMenu,
  onDoubleClick
 }) => {
  const { _id, type, artist, year, title } = result;
  const [{ opacity }, drag] = useDrag({
    item: {
      type: UIDragTypes.SEARCH_RESULTS,
      _id
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    })
  });

  function _onConTextMenu(): void {
    onContextMenu(result);
  }

  function _onDoubleClick(): void {
    onDoubleClick(result);
  }

  const tagClasses = cx('tag', `tag-${type}`);
  return (
    <li
      ref={drag}
      className="search-result-list-item"
      style={{ opacity }}
      onContextMenu={_onConTextMenu}
      onDoubleClick={_onDoubleClick}>
      <span className={tagClasses}>{type}</span>
      <span className="year">{year ? year : '-'}</span>
      <span className="artist">{artist === VARIOUS_ARTISTS_ID ? 'V/A' : artist}</span>
      <span className="title">{title}</span>
    </li>
  );
}
