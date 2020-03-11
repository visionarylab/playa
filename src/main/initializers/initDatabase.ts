import { ipcMain as ipc } from 'electron';
import * as Path from 'path';
import * as fs from 'fs-extra';
import Database from '../lib/database';
import loadAlbum from '../lib/loadAlbum';
import loadTracklist from '../lib/loadTracklist';
import { Album } from '../../renderer/store/modules/album';
import { parseQuery } from '../../renderer/utils/searchUtils';
import { IPC_MESSAGES } from '../../constants';
import { Environment } from '../main';

const {
  IPC_PLAYLIST_GET_ALL_REQUEST,
  IPC_PLAYLIST_SAVE_REQUEST,
  IPC_PLAYLIST_SAVE_LIST_REQUEST,
  IPC_PLAYLIST_DELETE_REQUEST,
  IPC_SEARCH_REQUEST,
  IPC_ALBUM_GET_LIST_REQUEST,
  IPC_ALBUM_SAVE_REQUEST,
  IPC_ALBUM_CONTENT_REQUEST,
  IPC_ALBUM_GET_LATEST_REQUEST,
  IPC_ALBUM_GET_STATS_REQUEST,
  IPC_TRACK_GET_LIST_REQUEST,
  IPC_ALBUM_GET_SINGLE_INFO,
  IPC_ALBUM_EXISTS,
  IPC_ALBUM_DELETE_LIST_REQUEST,
  IPC_ALBUM_CONTENT_RAW_REQUEST,
  IPC_TRACK_GET_LIST_RAW_REQUEST,
  IPC_TRACK_DELETE_LIST_REQUEST
} = IPC_MESSAGES;

const DEFAULT_SEARCH_FIELDS = ['title', 'artist'];

declare function emit (val: string|number): void;
declare function emit (key: string|number, value: string|number): void;

type InitDatabaseParams = {
  userDataPath: string;
  debug?: boolean;
  environment: Environment;
}

function getDatabaseFolder(environment: Environment): string {
  switch (environment) {
    case Environment.prod:
    default:
      return 'databases';
    case Environment.dev:
      return 'databases_dev';
    case Environment.fresh:
      return 'databases_fresh';
  }
}

export default async function initDatabase({
  userDataPath,
  debug = false,
  environment = Environment.prod
}: InitDatabaseParams): Promise<void> {
  const path = userDataPath + Path.sep + getDatabaseFolder(environment) + Path.sep;

  if (environment === Environment.fresh) {
    await fs.remove(path);
  }

  await fs.ensureDir(Path.join(path, 'playlist'));
  await fs.ensureDir(Path.join(path, 'album'));
  await fs.ensureDir(Path.join(path, 'track'));

  const db = {
    'playlist': new Database({ path, debug, name: 'playlist' }),
    'album': new Database({ path, debug, name: 'album', views: {
      groupCountByYear: {
        map: (doc: Album): void => emit(doc.year, 1),
        reduce: '_sum'
      },
      groupCountByType: {
        map: (doc: Album): void => emit(doc.type, 1),
        reduce: '_sum'
      },
      groupCountByArtist: {
        map: (doc: Album): void => emit(doc.artist, 1),
        reduce: '_sum'
      }
    } }),
    'track': new Database({ path, debug, name: 'track' }),
  };

  ipc.handle(IPC_PLAYLIST_GET_ALL_REQUEST,
    async () => await db.playlist.findAll()
  );

  ipc.handle(IPC_PLAYLIST_SAVE_REQUEST,
    async (_event, playlist) =>
      await db.playlist.save({
        ...playlist,
        accessed: new Date().toISOString()
      })
  );

  ipc.handle(IPC_PLAYLIST_SAVE_LIST_REQUEST,
    async (_event, playlists) => await db.playlist.saveBulk(playlists)
  );

  ipc.handle(IPC_PLAYLIST_DELETE_REQUEST,
    async (_event, playlist) => await db.playlist.delete(playlist)
  );

  ipc.handle(IPC_SEARCH_REQUEST, async (_event, query) => {
    const { selector = {}, query: originalQuery } = parseQuery(query);

    if (!originalQuery) {
      return await db.album.find(selector);
    }

    const results = await db.album.search(originalQuery, DEFAULT_SEARCH_FIELDS);

    const filters = Object.keys(selector);
    if (filters.length === 0) {
      return results;
    }

    return results.filter((x: { [key: string]: string | number}) =>
      filters.every((f: string) => x[f] === selector[f])
    );
  });

  ipc.handle(IPC_ALBUM_GET_LIST_REQUEST,
    async (_event, ids) => await db.album.getList(ids)
  );

  ipc.handle(IPC_ALBUM_CONTENT_REQUEST, async (_event, album) => {
    const tracks = await loadAlbum(album.path);
    return await db.album.save({ ...album, tracks });
  });

  ipc.handle(IPC_ALBUM_GET_STATS_REQUEST,
    async (_event, field: string) => await db.album.groupCount(field)
  );

  ipc.handle(IPC_ALBUM_SAVE_REQUEST,
    async (_event, album) => await db.album.save(album)
  );

  ipc.handle(IPC_ALBUM_GET_LATEST_REQUEST,
    async (_event, dateFrom, limit) => await db.album.getLatest({ dateFrom, limit, order: 'desc' })
  );

  ipc.handle(IPC_TRACK_GET_LIST_REQUEST,
    async (_event, ids, forceUpdate, persist) =>  await loadTracklist(ids, db.track, forceUpdate, persist)
  );

  ipc.handle(IPC_ALBUM_GET_SINGLE_INFO, async (_event, albumID) => {
    const albums: Album[] = await db.album.getList([albumID]);
    let tracks = albums[0].tracks || [];
    if (tracks.length === 0) {
      tracks = await loadAlbum(albums[0].path);
    }
    const foundTracks = await loadTracklist(tracks, db.track);
    return {
      album: {
        ...albums[0],
        tracks
      },
      tracks: foundTracks
    };
  });

  ipc.handle(IPC_ALBUM_EXISTS,
    async (_event, folder) => {
      const results = await db.album.find<Album>({ path: folder });
      return results.length > 0;
    }
  );

  ipc.handle(IPC_ALBUM_DELETE_LIST_REQUEST,
    async (_event, albums) => await db.album.deleteBulk(albums)
  );

  ipc.handle(IPC_ALBUM_CONTENT_RAW_REQUEST,
    async (_event, path) => await loadAlbum(path)
  );

  ipc.handle(IPC_TRACK_GET_LIST_RAW_REQUEST,
    async (_event, tracks: string[]) => await loadTracklist(tracks, db.track, true, false)
  );

  ipc.handle(IPC_TRACK_DELETE_LIST_REQUEST,
    async (_event, tracks) => await db.track.removeBulk(tracks)
  );
}
