import React, { FC, ReactElement } from 'react';
import cx from 'classnames';
import { TracklistViewItem } from './TracklistViewItem/TracklistViewItem';
import { Track } from '../../../../store/modules/track';
import { COLORS } from '../../../../../constants';
import './TracklistView.scss';

type TracklistViewProps = {
  className?: string;
  currentTrackId?: Track['_id'];
  tracklist: Track['_id'][];
  tracks: Track[];
  showArtists?: boolean;
  showTrackNumbers?: boolean;
  onTrackDoubleClick?: Function;
}

// #TODO reload onClick if some tracks are not found
export const TracklistView: FC<TracklistViewProps> = ({
  className,
  currentTrackId,
  tracklist,
  tracks,
  showTrackNumbers = true,
  showArtists = false,
  onTrackDoubleClick
}) => {
  const maxNameLength = Math.max(...tracklist.map(x => x.length));

  function renderTrack(id: Track['_id'], index: number): ReactElement {
    const track = tracks.find(({ _id }) => _id === id);
    if (!track) {
      return null;
    }
    if (track.found === false) {
      const tracklistEl = tracklist[index];
      const width = tracklistEl.length / maxNameLength * 100;
      const style = {
        backgroundImage: `linear-gradient(to right, ${COLORS.SKELETON_COLOR} ${width}%, transparent ${100 - width}% 100%)`
      };
      return <li key={tracklistEl} className="not-ready" style={style}></li>
    }
    const { _id } = track;
    return (
      <TracklistViewItem
        key={_id}
        track={track}
        isCurrent={_id === currentTrackId}
        showArtists={showArtists}
        showTrackNumber={showTrackNumbers}
        onDoubleClick={onTrackDoubleClick}/>
    );
  }

  const classNames = cx('tracklist-view', className);
  return (
    <section className={classNames}>
      <ol>{tracklist.map(renderTrack)}</ol>
    </section>
  );
}
