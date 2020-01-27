import { MenuItemConstructorOptions } from 'electron';
import { confirmDialog } from '../lib/dialog'
import { ActionCreator } from './actions';

import {
  removeAlbums,
} from '../store/modules/library';

import { showDialog } from '../store/modules/ui';
import { Album } from '../store/modules/album';

export type ActionParams = {
  selection: Album[];
  playingAlbumID: Album['_id'];
  dispatch?: Function;
}

export const removeAlbumsAction: ActionCreator<ActionParams> = ({
  selection = [],
  playingAlbumID,
  dispatch
}) => {
  return {
    title: `Remove selected album(s) from library`,
    async handler(): Promise<void> {
      if (selection.map(({ _id }) => _id).indexOf(playingAlbumID) > -1) {
        dispatch(showDialog('Album in play', 'Album is currently in playback!'));
        return;
      }
      const confirmed = await confirmDialog({
        title: 'Playlist Delete',
        message: `You are about to delete ${selection.length} album(s) from your library, are you sure?`
      });
      if (confirmed) {
        dispatch(removeAlbums(selection));
      }
    }
  };
}

export const LIBRARY_CONTENT_CONTEXT_ACTIONS = 'playa/context-menu/library-content-actions';

export enum LibraryContentActions {
  REMOVE_ALBUM = 'REMOVE_ALBUM'
}

export const LibraryContentActionsMap: { [key: string]: ActionCreator<ActionParams> } = {
  [LibraryContentActions.REMOVE_ALBUM]: removeAlbumsAction
}

export enum LibraryContentActionGroups {
  ALBUMS
}

export type GetLibraryContentContextMenuParams = {
  type: typeof LIBRARY_CONTENT_CONTEXT_ACTIONS;
  actionGroups?: LibraryContentActionGroups[];
  playingAlbumID?: Album['_id'];
  selection?: Album[];
  dispatch?: Function;
}

const actionGroupsMap = {
  [LibraryContentActionGroups.ALBUMS]: [LibraryContentActions.REMOVE_ALBUM],
};

export function getActionGroups({
  actionGroups = [LibraryContentActionGroups.ALBUMS],
  selection,
  playingAlbumID,
  dispatch
}: GetLibraryContentContextMenuParams): MenuItemConstructorOptions[] {
  return actionGroups.reduce((memo, group, index, original) => [
    ...memo,
    ...actionGroupsMap[group]
      .map(actionID => LibraryContentActionsMap[actionID])
      .map(action => {
        const { title, handler } = action({ selection, playingAlbumID, dispatch });
        return { label: title, click: handler };
      }),
    ...index < original.length ? [{ type : 'separator'}] : []
  ], []);
}
