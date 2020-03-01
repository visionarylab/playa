import { ipcRenderer as ipc, MenuItemConstructorOptions } from 'electron';
import { Action, ActionCreator } from './actions';

import {
  Album,
  reloadAlbumContent
} from '../store/modules/album';

import {
  playTrack,
  updateQueue,
  enqueueAfterCurrent,
  enqueueAtEnd
} from '../store/modules/player';

import { Playlist } from '../store/modules/playlist';
import { Track } from '../store/modules/track';

import { IPC_MESSAGES, SEARCH_URLS } from '../../constants';
const {
  IPC_SYS_REVEAL_IN_FINDER,
  IPC_SYS_OPEN_URL
} = IPC_MESSAGES;

export type ActionParams = {
  albums: Album[];
  queue?: Album['_id'][];
  playlistId?: Playlist['_id'];
  trackId?: Track['_id'];
  dispatch?: Function;
}

function createSearchAction(
  searchURL: SEARCH_URLS,
  siteName: string
): ActionCreator<ActionParams> {
  return ({ albums }): Action => {
    const { artist, title, } = albums[0];
    const query = `${artist} ${title}`;
    const fullTitle = `${artist} - ${title}`;
    return {
      title: `Search '${fullTitle}' on ${siteName}`,
      handler(): void { ipc.send(IPC_SYS_OPEN_URL, searchURL, query) }
    };
  }
}

function createSearchArtistAction(
  searchURL: SEARCH_URLS,
  siteName: string
): ActionCreator<ActionParams> {
  return ({ albums }): Action => {
    const { artist } = albums[0];
    const query = `${artist}`;
    const fullTitle = `${artist}`;
    return {
      title: `Search '${fullTitle}' on ${siteName}`,
      handler(): void { ipc.send(IPC_SYS_OPEN_URL, searchURL, query) }
    };
  }
}

export const playAlbumAction: ActionCreator<ActionParams> = ({
  albums,
  queue,
  playlistId,
  trackId,
  dispatch
}) => {
  const { _id: albumId, artist, title } = albums[0];
  const fullTitle = `${artist} - ${title}`;
  return {
    title: `Play '${fullTitle}'`,
    handler(): void {
      dispatch(updateQueue(queue));
      dispatch(playTrack({ playlistId, albumId, trackId }))
    }
  };
}

export const enqueueAfterCurrentAction: ActionCreator<ActionParams> = ({ albums, dispatch }) => {
  return {
    title: `Enqueue after current album`,
    handler(): void { dispatch(enqueueAfterCurrent(albums.map(({ _id }) => _id))) }
  };
}

export const enqueueAtEndAction: ActionCreator<ActionParams> = ({ albums, dispatch }) => {
  return {
    title: `Enqueue at the end`,
    handler(): void { dispatch(enqueueAtEnd(albums.map(({ _id }) => _id))) }
  };
}

export const removeFromQueueAction: ActionCreator<ActionParams> = ({ albums, queue, dispatch }) => {
  return {
    title: `Remove from queue`,
    handler(): void {
      const albumIDs = albums.map(({ _id }) => _id);
      const updatedQueue = queue.filter(_id => albumIDs.indexOf(_id) === -1);
      dispatch(updateQueue(updatedQueue));
    }
  };
}

export const revealInFinderAction: ActionCreator<ActionParams> = ({ albums }) => {
  const { artist, title, path } = albums[0];
  const fullTitle = `${artist} - ${title}`;
  return {
    title: `Reveal '${fullTitle}' in Finder`,
    handler(): void { ipc.send(IPC_SYS_REVEAL_IN_FINDER, path) }
  };
}

export const reloadAlbumContentAction: ActionCreator<ActionParams> = ({ albums, dispatch }) => {
  const { artist, title } = albums[0];
  const fullTitle = `${artist} - ${title}`;
  return {
    title: `Reload '${fullTitle}' tracks`,
    handler(): Function { return dispatch(reloadAlbumContent(albums[0])) }
  };
}

export const searchOnRYMAction = createSearchAction(SEARCH_URLS.RYM, 'rateyourmusic');
export const searchOnDiscogsAction = createSearchAction(SEARCH_URLS.DISCOGS, 'Discogs');
export const searchOnYoutubeAction = createSearchAction(SEARCH_URLS.YOUTUBE, 'Youtube');

export const searchArtistOnRYMAction = createSearchArtistAction(SEARCH_URLS.RYM_ARTIST, 'rateyourmusic');

export const ALBUM_CONTEXT_ACTIONS = 'playa/context-menu/album-actions';

export enum AlbumActions {
  PLAY_ALBUM = 'PLAY_ALBUM',
  ENQUEUE_AFTER_CURRENT = 'ENQUEUE_AFTER_CURRENT',
  ENQUEUE_AT_END = 'ENQUEUE_AT_END',
  REMOVE_FROM_QUEUE = 'REMOVE_FROM_QUEUE',
  REVEAL_IN_FINDER = 'REVEAL_IN_FINDER',
  RELOAD_ALBUM_CONTENT = 'RELOAD_ALBUM_CONTENT',
  SEARCH_ON_RYM = 'SEARCH_ON_RYM',
  SEARCH_ON_DISCOGS = 'SEARCH_ON_DISCOGS',
  SEARCH_ON_YOUTUBE = 'SEARCH_ON_YOUTUBE',
  SEARCH_ARTIST_ON_RYM = 'SEARCH_ARTIST_ON_RYM'
}

export const AlbumActionsMap: { [key: string]: ActionCreator<ActionParams> } = {
  [AlbumActions.PLAY_ALBUM]: playAlbumAction,
  [AlbumActions.ENQUEUE_AFTER_CURRENT]: enqueueAfterCurrentAction,
  [AlbumActions.ENQUEUE_AT_END]: enqueueAtEndAction,
  [AlbumActions.REMOVE_FROM_QUEUE]: removeFromQueueAction,
  [AlbumActions.REVEAL_IN_FINDER]: revealInFinderAction,
  [AlbumActions.RELOAD_ALBUM_CONTENT]: reloadAlbumContentAction,
  [AlbumActions.SEARCH_ON_RYM]: searchOnRYMAction,
  [AlbumActions.SEARCH_ON_DISCOGS]: searchOnDiscogsAction,
  [AlbumActions.SEARCH_ON_YOUTUBE]: searchOnYoutubeAction,
  [AlbumActions.SEARCH_ARTIST_ON_RYM]: searchArtistOnRYMAction
}

export enum AlbumActionsGroups {
  PLAYBACK,
  ENQUEUE,
  QUEUE,
  SYSTEM,
  SEARCH_ONLINE,
  ARTIST
}

export type GetAlbumContextMenuParams = {
  type: typeof ALBUM_CONTEXT_ACTIONS;
  queue?: Album['_id'][];
  actionGroups: AlbumActionsGroups[];
  albums: Album[];
  dispatch?: Function;
}

const actionGroupsMap: { [key: string]: AlbumActions[] } = {
  [AlbumActionsGroups.PLAYBACK]: [
    AlbumActions.PLAY_ALBUM
  ],
  [AlbumActionsGroups.ENQUEUE]: [
    AlbumActions.ENQUEUE_AFTER_CURRENT,
    AlbumActions.ENQUEUE_AT_END
  ],
  [AlbumActionsGroups.QUEUE]: [
    AlbumActions.REMOVE_FROM_QUEUE
  ],
  [AlbumActionsGroups.SYSTEM]: [
    AlbumActions.REVEAL_IN_FINDER,
    AlbumActions.RELOAD_ALBUM_CONTENT
  ],
  [AlbumActionsGroups.SEARCH_ONLINE]: [
    AlbumActions.SEARCH_ON_RYM,
    AlbumActions.SEARCH_ON_DISCOGS,
    AlbumActions.SEARCH_ON_YOUTUBE
  ],
  [AlbumActionsGroups.ARTIST]: [
    AlbumActions.SEARCH_ARTIST_ON_RYM
  ]
};

export function getActionGroups({
  actionGroups = [],
  ...args
}: GetAlbumContextMenuParams): MenuItemConstructorOptions[] {
  return actionGroups.reduce((memo, group, index, original) => [
    ...memo,
    ...actionGroupsMap[group]
      .map(actionID => AlbumActionsMap[actionID])
      .map(action => {
        const { title, handler } = action(args);
        return { label: title, click: handler };
      }),
    ...index < original.length - 1 ? [{ type : 'separator'}] : []
  ], []);
}
