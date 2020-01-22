import { remote, ipcRenderer as ipc, MenuItemConstructorOptions } from 'electron';
const { Menu, MenuItem } = remote;
import { Playlist, savePlaylistRequest } from '../store/modules/playlist';
import { Album, reloadAlbumContent } from '../store/modules/album';
import { playTrack, enqueueAfterCurrent, enqueueAtEnd } from '../store/modules/player';
import { IPC_MESSAGES, SEARCH_URLS } from '../../constants';
const {
  IPC_SYS_REVEAL_IN_FINDER,
  IPC_SYS_OPEN_URL
} = IPC_MESSAGES;

export const PLAYLIST_CONTEXT_ACTIONS = 'playa/context-menu/playlist-actions';
export const ALBUM_CONTEXT_ACTIONS = 'playa/context-menu/album-actions';

export enum PlaylistActionItems {
  REMOVE_ALBUMS
}

function removeAlbumActions(
  playlist: Playlist,
  selection: Album['_id'][],
  dispatch: Function
): MenuItemConstructorOptions[] {
  return [
    {
      label: `Remove selected album(s) from playlist`,
      click(): void { dispatch(savePlaylistRequest({
        ...playlist,
        albums: playlist.albums.filter(_id => selection.indexOf(_id) === -1)
      }))}
    }
  ];
}

export enum AlbumActionItems {
  PLAYBACK,
  ENQUEUE,
  SYSTEM,
  SEARCH_ONLINE
}

function playbackActions(album: Album, dispatch: Function): MenuItemConstructorOptions[] {
  const { _id, artist, title } = album;
  const fullTitle = `${artist} - ${title}`;
  return [
    {
      label: `Play '${fullTitle}'`,
      click(): void { dispatch(playTrack({ albumId: _id })) }
    },
  ];
}

function enqueueActions(album: Album, dispatch: Function): MenuItemConstructorOptions[] {
  const { _id, artist, title } = album;
  const fullTitle = `${artist} - ${title}`;
  return [
    {
      label: `Enqueue '${fullTitle}' after current album`,
      click(): void { dispatch(enqueueAfterCurrent(_id)) }
    },
    {
      label: `Enqueue '${fullTitle}' at the end`,
      click(): void { dispatch(enqueueAtEnd(_id)) }
    },
  ];
}

function systemActions(album: Album, dispatch: Function): MenuItemConstructorOptions[] {
  const { artist, title, path } = album;
  const fullTitle = `${artist} - ${title}`;
  return [
    {
      label: `Reveal '${fullTitle}' in Finder`,
      click(): void { ipc.send(IPC_SYS_REVEAL_IN_FINDER, path) }
    },
    {
      label: `Reload '${fullTitle}' tracks`,
      click(): void { dispatch(reloadAlbumContent(album)) }
    }
  ];
}

function searchOnlineActions(album: Album): MenuItemConstructorOptions[] {
  const { artist, title, } = album;
  const query = `${artist} ${title}`;
  const fullTitle = `${artist} - ${title}`;
  return [
    {
      label: `Search '${fullTitle}' on rateyourmusic`,
      click(): void { ipc.send(IPC_SYS_OPEN_URL, SEARCH_URLS.RYM, query) }
    },
    {
      label: `Search '${fullTitle}' on Discogs`,
      click(): void { ipc.send(IPC_SYS_OPEN_URL, SEARCH_URLS.DISCOGS, query) }
    }
  ]
}

const actionsMap = {
  [PlaylistActionItems.REMOVE_ALBUMS]: removeAlbumActions,
  [AlbumActionItems.PLAYBACK]: playbackActions,
  [AlbumActionItems.ENQUEUE]: enqueueActions,
  [AlbumActionItems.SYSTEM]: systemActions,
  [AlbumActionItems.SEARCH_ONLINE]: searchOnlineActions
};

type GetAlbumContextMenuParams = {
  type: typeof ALBUM_CONTEXT_ACTIONS;
  album: Album;
  actions: AlbumActionItems[];
  dispatch?: Function;
}

function getAlbumContextMenuActions({
  album,
  actions = [],
  dispatch
}: GetAlbumContextMenuParams): MenuItemConstructorOptions[] {
  return actions.reduce((memo, action, index, original) => [
    ...memo,
    ...actionsMap[action](album, dispatch),
    ...index < original.length ? [{ type : 'separator'}] : []
  ], []);
}

type GetPlaylistContextMenuParams = {
  type: typeof PLAYLIST_CONTEXT_ACTIONS;
  playlist: Playlist;
  selection?: Album['_id'][];
  dispatch?: Function;
}

export function getPlaylistContextMenuActions({
  playlist,
  selection = [],
  dispatch
}: GetPlaylistContextMenuParams): MenuItemConstructorOptions[] {
  return removeAlbumActions(playlist, selection, dispatch);
}

type ContextMenuParams =
    GetAlbumContextMenuParams
  | GetPlaylistContextMenuParams;

export function openContextMenu(params: ContextMenuParams[]): void {
  const menu = new Menu();
  const groups: MenuItemConstructorOptions[][] = params.map((param) => {
    switch (param.type) {
      case ALBUM_CONTEXT_ACTIONS:
        return getAlbumContextMenuActions(param);
      case PLAYLIST_CONTEXT_ACTIONS:
        return getPlaylistContextMenuActions(param);
    }
  });

  groups.forEach((group, index) => {
    group.forEach(item => menu.append(new MenuItem(item)));
    if (index < groups.length) {
      menu.append(new MenuItem({ type: 'separator' }));
    }
  });

  menu.popup({ window: remote.getCurrentWindow() });
}
