import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { AlbumGridView } from '../LibraryView/AlbumGridView/AlbumGridView';
import './ArtistView.scss';

import { openContextMenu } from '../../lib/contextMenu';
import actionsMap from '../../actions/actions';

import {
  Artist,
  VariousArtist,
  VARIOUS_ARTISTS_ID,
  selectors as artistSelectors,
  getAlbumsByArtist,
  getArtistReleases
} from '../../store/modules/artist';
import { Album, selectors as albumSelectors } from '../../store/modules/album';
import { updateTitle } from '../../store/modules/ui';
import { ApplicationState } from '../../store/store';
import { groupAlbumsByType } from '../../utils/albumUtils';
import { formatArtistName } from '../../utils/artistUtils';
import { LIBRARY } from '../../routes';

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

export const ArtistView = (): ReactElement => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { _id } = useParams();
  const {
    artist,
    albums,
    currentAlbumId
  } = useSelector((state: ApplicationState) => {
    const artist = _id === encodeURIComponent(VARIOUS_ARTISTS_ID)
      ? VariousArtist
      : artistSelectors.findById(state, _id);

    const albums = _id === encodeURIComponent(VARIOUS_ARTISTS_ID)
      ? groupAlbumsByType(albumSelectors.findByVariousArtists(state))
      : getAlbumsByArtist(state, _id) || {};

    return {
      artist,
      albums,
      currentAlbumId: state.player.currentAlbumId
    };
  });

  const { _id: artistId, name } = artist;

  useEffect(() => {
    dispatch(getArtistReleases(artist));
  }, [artistId]);

  useEffect(() => {
    if (name) {
      dispatch(updateTitle({
        main: formatArtistName(name),
        sub: 'Artist'
      }));
    }
  }, [name]);

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

  function onAlbumDoubleClick(album: Album, artist: Artist): void {
    actionsMap(AlbumActions.PLAY_ALBUM)({
      albums: [{ album, artist }],
      queue: [album._id],
      dispatch
    }).handler();
	}

  function renderReleases(): ReactElement {
    const groups = Object.entries(albums);
    if (groups.length === 0) {
      return (<p className="artist-empty-placeholder">{t('artist.empty')}</p>);
    }
    return (
      <section className="artist-releases">
      {
        groups.map(([type, releases]) => {
          function onAlbumEnter(selection: Album['_id'][]): void {
            if (selection.length === 0) {
              return;
            }
            const album = releases.find(({ _id }) => _id === selection[0]);
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
            const selection: Album[] = releases.filter(
              ({ _id }) => selectionIDs.indexOf(_id) > -1
            );
            actionsMap(LibraryContentActions.REMOVE_ALBUM)({
              selection,
              currentAlbumId,
              dispatch
            }).handler();
          }

          const sectionClassNames = cx('artist-release-group', `artist-release-group-${type}`);
          return (
            <section className={sectionClassNames} key={type}>
              <AlbumGridView
                showArtists={false}
                albums={releases}
                currentAlbumId={currentAlbumId}
                onEnter={onAlbumEnter}
                onBackspace={onAlbumBackspace}
                onAlbumContextMenu={onAlbumContextMenu}
                onAlbumDoubleClick={onAlbumDoubleClick}/>
            </section>
          );
        })
      }
      </section>
    );
  }

  return (
    !_id
    ? <Redirect to={LIBRARY}/>
    : <section className="artist">
        {renderReleases()}
      </section>
  );
}
