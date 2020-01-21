import { ipcMain as ipc } from 'electron';
import * as Path from 'path';
import Database from '../database';
import loadAlbum from '../loadAlbum';
import loadTracklist from '../loadTracklist';
import { Album } from '../../renderer/store/modules/album';
import { IPC_MESSAGES } from '../../constants';

const {
  IPC_PLAYLIST_GET_ALL_REQUEST,
  IPC_PLAYLIST_SAVE_REQUEST,
  IPC_PLAYLIST_DELETE_REQUEST,
  IPC_SEARCH_REQUEST,
  IPC_ALBUM_GET_LIST_REQUEST,
  IPC_ALBUM_CONTENT_REQUEST,
  IPC_TRACK_GET_LIST_REQUEST,
  IPC_ALBUM_GET_SINGLE_INFO
} = IPC_MESSAGES;

export default function initDatabase(userDataPath: string): void {
  const path = userDataPath + Path.sep + 'databases' + Path.sep;
  const debug = process.env.DEBUG === 'true';
  const db: { [key: string]: Database }
    = ['playlist', 'album', 'track'].reduce((memo, key) =>
      ({ ...memo, [key]: new Database({ path, debug, name: key })})
    , {});

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

  ipc.handle(IPC_PLAYLIST_DELETE_REQUEST,
    async (_event, playlist) => await db.playlist.delete(playlist)
  );

  ipc.handle(IPC_SEARCH_REQUEST, async (_event, query) => {
    return await db.album.find(query, ['artist', 'title']);
  });

  ipc.handle(IPC_ALBUM_GET_LIST_REQUEST,
    async (_event, ids) => await db.album.getList(ids)
  );

  ipc.handle(IPC_ALBUM_CONTENT_REQUEST, async (_event, album) => {
    const tracks = await loadAlbum(album.path);
    return await db.album.save({ ...album, tracks });
  });

  ipc.handle(IPC_TRACK_GET_LIST_REQUEST,
    async (_event, ids) =>  await loadTracklist(ids, db.track)
  );

  ipc.handle(IPC_ALBUM_GET_SINGLE_INFO, async (_event, ids) => {
    const albums: Album[] = await db.album.getList(ids);
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
}
