import React, { FC, useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { getLatestRequest } from '../../store/modules/library';
import { LatestAlbumsView } from './LatestAlbumsView/LatestAlbumsView';
import { ArtistListView } from './ArtistListView/ArtistListView';

import { ApplicationState } from '../../store/store';
import { updateTitle } from '../../store/modules/ui';
import { Album } from '../../store/modules/album';
import { Artist } from '../../store/modules/artist';
import { Track } from '../../store/modules/track';
import { openContextMenu } from '../../lib/contextMenu';
import useNativeDrop, { NativeTypes } from '../../hooks/useNativeDrop/useNativeDrop';
import scrollTo from '../../lib/scrollTo';

import {
  ALBUM_CONTEXT_ACTIONS,
  AlbumActionsGroups,
  AlbumActions
} from '../../actions/albumActions';

import {
  LIBRARY_CONTENT_CONTEXT_ACTIONS,
  LibraryContentActionGroups,
  LibraryContentActions
} from '../../actions/libraryContentActions';

import actionsMap from '../../actions/actions';
import { daysAgo } from '../../utils/datetimeUtils';

import {
  LIBRARY_LATEST_ALBUM_LIMIT,
	LIBRARY_LATEST_DAY_COUNT
} from '../../../constants';

import {
  LIBRARY
} from '../../routes';

import './LibraryView.scss';

const DEFAULT_LETTER = 'a';

type LibraryViewProps = {
	onDrop: Function;
};

export const LibraryView: FC<LibraryViewProps> = ({
  onDrop
}) => {
  const { t } = useTranslation();
	const dispatch = useDispatch();
  const location = useLocation();
	const history = useHistory();

  const [selectedLetter, setSelectedLetter] = useState(DEFAULT_LETTER);

  const q = new URLSearchParams(location.search);
  const letter = q.get('letter');

  useEffect(() => {
    if (letter) {
      setSelectedLetter(letter);
    }
  }, [letter]);

	const {
    latest,
    currentAlbumId,
    currentTrackId
  } = useSelector(({ albums, library, player }: ApplicationState) => ({
    latest: library.latest ? library.latest.map((_id: Album['_id']) => albums.allById[_id]).filter(a => !!a) : null,
    ...player
  }));

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
		dispatch(
			getLatestRequest(
				daysAgo({ days: LIBRARY_LATEST_DAY_COUNT }),
				LIBRARY_LATEST_ALBUM_LIMIT
			)
		);
	}, []);

	useEffect(() => {
    dispatch(updateTitle({
      main: t('library.title')
    }));
  }, []);

	function onAlbumContextMenu(album: Album, artist: Artist): void {
		openContextMenu([
      {
        type: ALBUM_CONTEXT_ACTIONS,
        albums: [{ album, artist }],
        dispatch,
        actionGroups: [
          AlbumActionsGroups.PLAYBACK,
          AlbumActionsGroups.ENQUEUE,
          AlbumActionsGroups.EDIT,
          AlbumActionsGroups.SYSTEM,
          AlbumActionsGroups.SEARCH_ONLINE
        ]
      },
      {
        type: LIBRARY_CONTENT_CONTEXT_ACTIONS,
        selection: [album],
        dispatch,
        currentAlbumId,
        actionGroups: [
          LibraryContentActionGroups.ALBUMS
        ]
      }
    ]);
	}

	function onAlbumDoubleClick(album: Album, artist: Artist, track: Track): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      albums: [{ album, artist }],
      queue: [album._id],
      trackId: track ? track._id : null,
      dispatch
    }).handler();
	}

  function onAlbumEnter(selection: Album['_id'][]): void {
    if (selection.length === 0) {
      return;
    }
    const album = latest.find(({ _id }) => _id === selection[0]);
    if (!album) {
      return;
    }
    actionsMap(AlbumActions.PLAY_ALBUM)({
      albums: [{ album, artist: {} as Artist }],
      queue: [album._id],
      dispatch
    }).handler();
  }

  function onAlbumBackspace(selectionIDs: Album['_id'][]): void {
    const selection: Album[] = latest.filter(
      ({ _id }) => selectionIDs.indexOf(_id) > -1
    );
    actionsMap(LibraryContentActions.REMOVE_ALBUM)({
      selection,
      currentAlbumId,
      dispatch
    }).handler();
  }

  function onLetterClick(letter: string): void {
    setSelectedLetter(letter);
    history.replace(
      `${LIBRARY}?letter=${letter}`
    );
    scrollTo({
      selector: '.artists-start',
      block: 'start',
      behavior: 'smooth'
    });
  }

  const libraryClasses = cx('library', {
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });

	return (
		<section className={libraryClasses} ref={drop}>
      <LatestAlbumsView
        albums={latest}
        currentAlbumId={currentAlbumId}
        currentTrackId={currentTrackId}
        onAlbumEnter={onAlbumEnter}
        onAlbumBackspace={onAlbumBackspace}
        onAlbumContextMenu={onAlbumContextMenu}
        onAlbumDoubleClick={onAlbumDoubleClick}/>
      {
        latest && latest.length > 0
        ? <ArtistListView
            selectedLetter={selectedLetter}
            onLetterClick={onLetterClick}/>
        : null
      }
		</section>
	);
}
