import React, { FC, ReactElement, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import { useDrag, useDrop, DragObjectWithType } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useInView } from 'react-intersection-observer';
import Vibro from 'node-vibrant';
import cx from 'classnames';
import { CoverView } from './CoverView/CoverView';
import { TracklistView } from './TracklistView/TracklistView';
import { ApplicationState } from '../../../store/store';
import { Album, getAlbumRequest, getAlbumContentById } from '../../../store/modules/album';
import { getCoverFromUrlRequest } from '../../../store/modules/cover';
import { Track } from '../../../store/modules/track';
import { AlbumActionsView, ActionsConfig } from '../AlbumActionsView/AlbumActionsView';
import {
  formatArtist,
  showTrackNumbers,
  showTrackArtists
} from '../../../utils/albumUtils';
import { SEARCH } from '../../../routes';
import './AlbumView.scss';

type AlbumViewProps = {
  album: Album;
  isCurrent?: boolean;
  currentTrackId: Track['_id'];
  dragType: string;
  albumActions?: ActionsConfig[];
  onContextMenu: Function;
  onDoubleClick: Function;
}

type Palette = {
  DarkMuted: string;
  DarkVibrant: string;
  Muted: string;
  Vibrant: string;
  LightMuted: string;
  LightVibrant: string;
}

interface DragItem extends DragObjectWithType{
  urls?: string[];
  files?: File[];
}

// #TODO push notFoundAction
export const AlbumView: FC<AlbumViewProps> = ({
  album,
  isCurrent = false,
  currentTrackId,
  dragType,
  albumActions,
  onContextMenu,
  onDoubleClick
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [palette, setPalette] = useState({} as Palette);
  const { _id, type, year, artist, title } = album;
  const [viewRef, inView] = useInView({ triggerOnce: true });

  const {
    cover,
    tracks
  } = useSelector((state: ApplicationState) => getAlbumContentById(state, _id));

  const dispatch = useDispatch();
  useEffect(() => {
    inView && dispatch(getAlbumRequest(_id));
  }, [_id, inView]);

  const [{ opacity }, drag] = useDrag({
    item: {
      type: dragType,
      _id,
      selection: [_id]
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    })
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [NativeTypes.FILE, NativeTypes.URL],
    drop: (item: DragItem) => {
      let url = '';
      if (item.urls) {
        url = item.urls[0];
      }
      if (item.files) {
        url = item.files[0].path;
      }
      dispatch(getCoverFromUrlRequest(album, url));
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    })
  });

  drag(drop(ref));

  function onCoverDoubleClick(album: Album): void {
    onDoubleClick(album);
  }

  function onTrackDoubleClick(track: Track): void {
    onDoubleClick(album, track);
  }

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(album);
  }

  async function onImageLoad(src: string): Promise<void> {
    const {
      DarkMuted,
      DarkVibrant,
      Muted,
      Vibrant,
      LightMuted,
      LightVibrant
    } = await Vibro.from(src).getPalette();
    setPalette({
      DarkMuted: DarkMuted.getHex(),
      DarkVibrant: DarkVibrant.getHex(),
      Muted: Muted.getHex(),
      Vibrant: Vibrant.getHex(),
      LightMuted: LightMuted.getHex(),
      LightVibrant: LightVibrant.getHex()
    });
  }

  function renderArtist(): ReactElement {
    return (
      <Link
        to={`${generatePath(SEARCH)}?query=artist: ${encodeURIComponent(artist)}`}
        className="album-artist-link">
          {formatArtist(album)}
      </Link>
    );
  }

  const albumClasses = cx('album-view', { 'is-current': isCurrent });
  const tagClasses = cx('album-type', `album-type-${type}`);

  const coverClasses = cx('album-cover', {
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });
  return (
    <article className={albumClasses} id={_id} onContextMenu={_onContextMenu} ref={viewRef}>
      <aside className="album-aside" style={{ backgroundColor: palette.DarkMuted }}>
        <div ref={ref} style={{ opacity }} className="album-cover-wrapper">
          <CoverView
            className={coverClasses}
            src={cover}
            album={album}
            onImageLoad={onImageLoad}
            onDoubleClick={onCoverDoubleClick}/>
          </div>
        <header>
          <h2 style={{ color: palette.LightVibrant }}>{title}</h2>
          <p className="album-artist">{renderArtist()}</p>
          <p className="album-info">
            {year ? `${year} - ` : null}<span className={tagClasses}>{type}</span>
          </p>
        </header>
        { albumActions.length > 0 && <AlbumActionsView album={album} actions={albumActions}/>}
      </aside>
      <section className="album-content">
        <TracklistView
          tracklist={album.tracks}
          tracks={tracks}
          currentTrackId={currentTrackId}
          showArtists={showTrackArtists(album)}
          showTrackNumbers={showTrackNumbers(album)}
          onTrackDoubleClick={onTrackDoubleClick}/>
      </section>
    </article>
  );
}
