import React, { FC, ReactElement, SyntheticEvent, MouseEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { CoverView } from '../../CoverView/CoverView';
import useReorder from '../../../hooks/useReorder/useReorder';
import { Album, getAlbumContentById } from '../../../store/modules/album';
import { UIDragTypes } from '../../../store/modules/ui';
import { getCoverRequest } from '../../../store/modules/cover';
import { ApplicationState } from '../../../store/store';
import { formatArtist } from '../../../utils/albumUtils';
import { ARTIST_SHOW } from '../../../routes';
import './CompactAlbumView.scss';

type CompactAlbumViewProps = {
  album: Album;
  index: number;
  selected?: boolean;
  isCurrent?: boolean;
  onAlbumMove: Function;
  onContextMenu: Function;
  onClick: Function;
  onDoubleClick: Function;
  sortable?: boolean;
}

export const CompactAlbumView: FC<CompactAlbumViewProps> = ({
  album,
  index,
  isCurrent = false,
  selected = false,
  onAlbumMove,
  onContextMenu,
  onClick,
  onDoubleClick,
  sortable = false
}) => {
  const { _id, year, title, type } = album;
  const { cover, artist } = useSelector((state: ApplicationState) => getAlbumContentById(state, _id));

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCoverRequest(album));
  }, [album]);

  const {
    isOver,
    canDrop,
    isDragging,
    ref
  } = useReorder({
    _id,
    index,
    sortable,
    accept: UIDragTypes.COMPACT_ALBUMS,
    type: UIDragTypes.COMPACT_ALBUMS,
    onMove: onAlbumMove
  });

  function _onDoubleClick(event: SyntheticEvent): void {
    event.preventDefault();
    onDoubleClick(album, artist);
  }

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(album, artist);
  }

  function onActionsButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    _onContextMenu();
  }

  function renderArtist(): ReactElement {
    if (!artist) {
      return <span className="album-artist-link loading"></span>;
    }
    const { _id } = artist;
    return (
      <Link className="album-artist" to={generatePath(ARTIST_SHOW, { _id })}>
        {formatArtist({ album, artist })}
      </Link>
    );
  }

  function _onClick(event: MouseEvent): void {
    onClick && onClick(event, album);
  }

  const classNames = cx('compact-album-view', `compact-album-view-${type}`, {
    'sortable': sortable,
    'selected': selected,
    'is-current': isCurrent,
    'drag-is-over': isOver,
    'drag-can-drop': canDrop,
    'drag-is-dragging': isDragging
  });

  return (
    <article
      id={`album-${_id}`}
      className={classNames}
      ref={ref}
      onDoubleClick={_onDoubleClick}
      onContextMenu={_onContextMenu}
      onClick={_onClick}>
      <div className="album-inner-wrapper">
        <CoverView
          className="album-cover"
          src={cover}
          album={album}/>
        <p className="album-content header-like">
          <span className="album-title">
            {title}{ isCurrent ? <FontAwesomeIcon className="icon" icon="volume-up"/> : null }
          </span>
          <span className="album-info">
            { year && <span className="album-year">{year}</span> }
            { renderArtist() }
          </span>
        </p>
        <button onClick={onActionsButtonClick} className="button button-frameless button-album-actions">
          <FontAwesomeIcon className="icon" icon="ellipsis-h"/>
        </button>
      </div>
    </article>
  );
}
