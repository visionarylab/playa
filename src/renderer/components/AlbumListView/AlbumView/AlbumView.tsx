import React, { FC, ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import cx from 'classnames';
import { CoverView } from './CoverView/CoverView';
import { TracklistView } from './TracklistView/TracklistView';
import { ApplicationState } from '../../../store/store';
import { Album, AlbumTypes, VARIOUS_ARTISTS_ID, getAlbumRequest } from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import { AlbumActionsView, ActionsConfig } from '../AlbumActionsView/AlbumActionsView';
import { SEARCH } from '../../../routes';
import './AlbumView.scss';

type AlbumViewProps = {
  album: Album;
  isCurrent: boolean;
  currentTrackId: Track['_id'];
  albumActions?: ActionsConfig[];
  onContextMenu: Function;
  onDoubleClick: Function;
}

// #TODO push notFoundAction
export const AlbumView: FC<AlbumViewProps> = ({
  album,
  isCurrent = false,
  currentTrackId,
  albumActions,
  onContextMenu,
  onDoubleClick
}) => {
  const { _id, type, year, artist, title } = album;
  const {
    tracklist,
    notFoundTracks,
    cover
  } = useSelector(({ tracks, covers }: ApplicationState) => {
    const tracklist =
      album.tracks
        .map((id) => tracks.allById[id])
        .filter(x => !!x) || [];
    return {
      tracklist,
      notFoundTracks: tracklist.filter(({ found }) => found === false).length > 0,
      cover: covers.allById[_id]
    };
  });

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAlbumRequest(_id));
  }, [_id]);

  function onCoverDoubleClick(album: Album): void {
    onDoubleClick(album);
  }

  function onTrackDoubleClick(track: Track): void {
    onDoubleClick(album, track);
  }

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(album);
  }

  function renderArtist(): ReactElement {
    return <Link
      to={`${generatePath(SEARCH)}?query=artist: ${artist}`}
      className="album-artist-link">
        {artist === VARIOUS_ARTISTS_ID ? 'V/A' : artist}
      </Link>;
  }

  const showTrackNumbers = [
    AlbumTypes.Remix,
    AlbumTypes.Various
  ].indexOf(type) < 0;

  const albumClasses = cx('album-view', { 'is-current': isCurrent });
  const tagClasses = cx('album-type', `album-type-${type}`);
  const showArtists = artist === VARIOUS_ARTISTS_ID || type === AlbumTypes.Remix;
  return (
    <article className={albumClasses} id={_id} onContextMenu={_onContextMenu}>
      <aside className="album-aside">
        <CoverView
          className="album-cover"
          src={cover}
          album={album}
          onDoubleClick={onCoverDoubleClick}/>
        <header>
          <h2>{title}</h2>
          <p className="album-artist">{renderArtist()}</p>
          <p className="album-info">{year ? `${year} - ` : null}<span className={tagClasses}>{type}</span></p>
        </header>
        { albumActions.length > 0 && <AlbumActionsView album={album} actions={albumActions}/>}
      </aside>
      <section className="album-content">
        <TracklistView
          currentTrackId={currentTrackId}
          showArtists={showArtists}
          showTrackNumbers={showTrackNumbers}
          rawTracks={album.tracks}
          tracklist={tracklist}
          onTrackDoubleClick={onTrackDoubleClick}/>
      </section>
    </article>
  );
}
