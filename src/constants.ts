import * as os from 'os'

export const MACOS = (os.platform() === "darwin");

export const HEIGHT = 800;
export const WIDTH = 1200;

export const MUSIC_ROOT_FOLDER = '/Volumes/Public/Music';
export const MUSIC_FILE_EXTENSIONS = ['mp3', 'm4a', 'flac', 'ogg'];
