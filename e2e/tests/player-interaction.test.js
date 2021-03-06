const path = require('path');
const { getApp } = require('../utils/appUtils');
const { TEN_SECONDS } = require('../utils/appUtils');
const { populateTestDB, TestAlbums, TestPlaylists, TestArtists } = require('../utils/databaseUtils');
const { FileAlbums, generateAlbum } = require('../utils/musicfileUtils');

function mock(app, options) {
  app.electron.ipcRenderer.sendSync('SPECTRON_FAKE_DIALOG/SEND', options);
}

describe('Player interaction', () => {
  let app, menuAddon, contextMenuAddon, generatedAlbums;
  beforeEach(async () => {
    const menuApp = await getApp({
      args: ['-r', path.join(process.cwd(), 'e2e/__mocks__/mock-dialog.js')]
    });

    generatedAlbums = await Promise.all(
      FileAlbums.map(async x => await generateAlbum(x)
    ));

    await populateTestDB({
      playlists: [{
        ...TestPlaylists[0],
        albums: TestAlbums.map(({ _id }) => _id)
      }],
      albums: TestAlbums.map((album, index) => ({
        ...album,
        path: generatedAlbums[index].path,
        tracks: generatedAlbums[index].tracks.map(({ _id }) => _id)
      })),
      artists: TestArtists,
      tracks: [...generatedAlbums[0].tracks, ...generatedAlbums[1].tracks]
    });
    app = menuApp.app;
    menuAddon = menuApp.menuAddon;
    contextMenuAddon = menuApp.contextMenuAddon;
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('plays album from playlist', async () => {
    await app.start();
    await app.client.waitUntilWindowLoaded();

    await app.client.click(`#playlist-list-item-${TestPlaylists[0]._id} .playlist-list-item-link`);
    await app.client.waitUntil(
      async () => await app.client.getText('.app-header .heading-main') === TestPlaylists[0].title
    );

    // Starts Playback
    await app.client.keys('Enter');

    // Playback control shows pause indicator
    await app.client.waitForExist('.player-controls .control-playback.is-playing');

    // First album in playlist is marked as playing
    await app.client.waitForExist(`#album-${TestAlbums[0]._id}.is-current`);

    // First track in album is marked as playing
    await app.client.waitForExist(`#track-${TestAlbums[0]._id}_0.is-current`);

    // Current track info is displayed in playback bar
    await app.client.waitUntil(async () => {
      const showsCurrentTrackTitle =
        await app.client.getText('.player .current-track-title')
          === generatedAlbums[0].tracks[0].title;
      const showsCurrentTrackInfo =
        await app.client.getText('.player .current-track-info')
          === `${TestArtists[0].name} - ${TestAlbums[0].title}`;
      const showsCurrentAlbumCover =
        await app.client.getAttribute('.player .player-album-cover img', 'alt')
          === `[${TestAlbums[0]._id}] ${TestAlbums[0].title}`;
      return showsCurrentTrackTitle && showsCurrentTrackInfo && showsCurrentAlbumCover;
    });

    // Current playlist has a playback indicator
    await app.client.waitForExist(`#playlist-list-item-${TestPlaylists[0]._id}.is-playing`);

    const lastTrackIndex = generatedAlbums[0].tracks.length - 1;

    // Play last track of first album
    await app.client.doubleClick(`#track-${TestAlbums[0]._id}_${lastTrackIndex}`);

    // Pause playback
    await app.client.keys('Space');

    // Current track info is displayed in playback bar
    await app.client.waitUntil(async () => {
      const showsCurrentTrackTitle =
        await app.client.getText('.player .current-track-title')
          === generatedAlbums[0].tracks[lastTrackIndex].title;
      return showsCurrentTrackTitle;
    });

    // Play next track
    await app.client.click('.player-controls .control-next');

    // Current track info is displayed in playback bar
    await app.client.waitUntil(async () => {
      const showsCurrentTrackTitle =
        await app.client.getText('.player .current-track-title')
          === generatedAlbums[1].tracks[0].title;
      const showsCurrentTrackInfo =
        await app.client.getText('.player .current-track-info')
          === `${TestArtists[1].name} - ${TestAlbums[1].title}`;
      const showsCurrentAlbumCover =
        await app.client.getAttribute('.player .player-album-cover img', 'alt')
          === `[${TestAlbums[1]._id}] ${TestAlbums[1].title}`;
      return showsCurrentTrackTitle && showsCurrentTrackInfo && showsCurrentAlbumCover;
    });

    // Pause playback
    await app.client.keys('Space');

    // Play previous track
    await app.client.click('.player-controls .control-prev');

    // Current track info is displayed in playback bar
    await app.client.waitUntil(async () => {
      const showsCurrentTrackTitle =
        await app.client.getText('.player .current-track-title')
          === generatedAlbums[0].tracks[lastTrackIndex].title;
      const showsCurrentTrackInfo =
        await app.client.getText('.player .current-track-info')
          === `${TestArtists[0].name} - ${TestAlbums[0].title}`;
      const showsCurrentAlbumCover =
        await app.client.getAttribute('.player .player-album-cover img', 'alt')
          === `[${TestAlbums[0]._id}] ${TestAlbums[0].title}`;
      return showsCurrentTrackTitle && showsCurrentTrackInfo && showsCurrentAlbumCover;
    });

    // Navigate to library
    await app.client.click('.app-header .button-library');
    await app.client.waitUntil(async () => await app.client.getText('.app-header h1') === 'Library');

    // Current album is playing
    await app.client.waitForExist(`#album-grid-tile-${TestAlbums[0]._id}.is-playing`);

    // Navigate to queue
    await app.client.click('.app-header .button-queue');
    await app.client.waitUntil(async () => await app.client.getText('.app-header h1 .heading-main') === 'Playback Queue');

    // Current track is playing
    await app.client.waitForExist(`#track-${TestAlbums[0]._id}_${lastTrackIndex}.is-current`);

    // Pause playback
    await app.client.keys('Space');
  }, TEN_SECONDS);

  it('seeks to position when the progress bar is clicked', async () => {
    await app.start();
    await app.client.waitUntilWindowLoaded();

    await app.client.click(`#playlist-list-item-${TestPlaylists[0]._id} .playlist-list-item-link`);
    await app.client.waitUntil(
      async () => await app.client.getText('.app-header .heading-main') === TestPlaylists[0].title
    );

    // Starts Playback
    await app.client.keys('Enter');

    // Playback control shows pause indicator
    await app.client.waitForExist('.player-controls .control-playback.is-playing');

    // workaround to click in the middle of playback bar
    await app.client.click('.current-track-title');

    // check that elapsed and left time are as expected
    await app.client.waitUntil(async () => {
      const elapsedTime = await app.client.getText('.duration-elapsed');
      const leftTime = await app.client.getText('.duration-left');
      const duration = generatedAlbums[0].tracks[0].duration;
      return elapsedTime === `00:0${Math.ceil(duration / 2)}`
        && leftTime === `-00:0${Math.floor(duration / 2)}`;
    });
  }, TEN_SECONDS);
});
