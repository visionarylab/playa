const { getApp, TEN_SECONDS } = require('../utils/appUtils');
const { populateTestDB, TestPlaylists } = require('../utils/databaseUtils');

describe('Application launch', () => {
  let app, menuAddon;
  beforeEach(async () => {
    await populateTestDB({
      playlists: [TestPlaylists[0]]
    });
    const menuApp = await getApp();
    app = menuApp.app;
    menuAddon = menuApp.menuAddon;
    return app.start();
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('shows an initial window', async () => {
    expect(await app.client.getWindowCount()).toBe(1);
  });

  it('recalls last opened playlist', async () => {
    const title = TestPlaylists[0].title;
    await app.client.waitUntilWindowLoaded();
    await app.client.click('.playlist-list .playlist-list-item');
    await app.client.waitUntil(
      async() => await app.client.getText('.app-header .heading-main') === title
    );
    await app.restart();
    await app.client.waitUntilWindowLoaded();
    expect(await app.client.getText('.app-header .heading-main')).toBe(title);
  }, TEN_SECONDS);
});
