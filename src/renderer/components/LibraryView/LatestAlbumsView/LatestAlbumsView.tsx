import React, { FC, ReactElement, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { AlbumGridView } from '../AlbumGridView/AlbumGridView';
import { Album } from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import { updateLibraryAlbumSelection } from '../../../store/modules/ui';
import useNativeDrop, { NativeTypes } from '../../../hooks/useNativeDrop/useNativeDrop';
import { GridCell } from '../../../hooks/useGrid/useGrid';
import { groupByDate, LIBRARY_INTERVALS } from '../../../utils/datetimeUtils';

type LatestAlbumsViewProps = {
  albums: Album[];
  currentAlbumId: Album['_id'];
  currentTrackId: Track['_id'];
  onAlbumEnter: (selection: GridCell['_id'][]) => void;
  onAlbumBackspace: (selection: GridCell['_id'][]) => void;
  onAlbumContextMenu: Function;
  onAlbumDoubleClick: Function;
  onDrop: Function;
};

export const LatestAlbumsView: FC<LatestAlbumsViewProps> = ({
  albums,
  currentAlbumId,
  currentTrackId,
  onAlbumEnter,
  onAlbumBackspace,
  onAlbumContextMenu,
  onAlbumDoubleClick,
  onDrop
}) => {
  const { t } = useTranslation();

  function _onDrop(folder: string): void {
    onDrop(folder);
  }

  const {
    isOver,
    canDrop,
    drop
  } = useNativeDrop({
    onDrop: _onDrop,
    accept: [NativeTypes.FILE],
    filter: (type: string) => type === ''
  });

  useEffect(() => {
    return (): void => {
      updateLibraryAlbumSelection([]);
    }
  }, []);

  function onSelectionChange(selection: Album['_id'][]): void {
    updateLibraryAlbumSelection(selection);
  }

  function renderAlbums(): ReactElement {
    return (
      <AlbumGridView
        autoFocus
        albums={albums}
        currentAlbumId={currentAlbumId}
        currentTrackId={currentTrackId}
        clearSelectionOnBlur
        onSelectionChange={onSelectionChange}
        onEnter={onAlbumEnter}
        onBackspace={onAlbumBackspace}
        onAlbumContextMenu={onAlbumContextMenu}
        onAlbumDoubleClick={onAlbumDoubleClick}/>
    );
  }

  function renderEmptyPlaceholder(): ReactElement {
    return <p className="library-latest-albums-empty-placeholder">{t('library.empty')}</p>;
  }

  if (!albums) {
    return null;
  }

  const classNames = cx('library-latest-albums', {
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });

  return (
    <section className={classNames} ref={drop}>
      <CSSTransition
        in={!!albums}
        timeout={300}
        classNames="album-grid"
        unmountOnExit>
        { albums.length
          ? renderAlbums()
          : renderEmptyPlaceholder()
        }
      </CSSTransition>
    </section>
  );
}
