import React, { ReactElement, useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Playlist, savePlaylistRequest } from '../../../../store/modules/playlist';
import { setEditPlaylistTitle } from '../../../../store/modules/ui';
import { ApplicationState } from '../../../../store/store';

export const PlaylistTitle = (): ReactElement => {
	const dispatch = useDispatch();
	const { _id } = useParams();
	const { playlist, isTitleEditing } = useSelector(({ playlists, ui }: ApplicationState) => {
		return {
			playlist: playlists.allById[_id] || {} as Playlist,
			isTitleEditing: ui.editPlaylistTitle
		}
	});
	const [title, setTitle] = useState(playlist.title);
	const inputRef = useRef<HTMLInputElement>(null);

	function onTitleChange(): void {
		if (title === playlist.title && playlist._rev) {
			return;
		}
		if (title) {
			dispatch(savePlaylistRequest({ ...playlist, title: title.trim() }));
		}
	}

	function onSubmit(): void {
		dispatch(setEditPlaylistTitle(false));
		onTitleChange();
	}

	function onTitleClick(): void {
		dispatch(setEditPlaylistTitle(true));
	}

	useEffect(() => {
		dispatch(setEditPlaylistTitle(!playlist._rev));
	}, [playlist]);

	useEffect(() => {
		setTitle(playlist.title);
	}, [playlist.title]);

	function onChange(): void {
		setTitle(inputRef.current.value);
	}

	function onBlur(): void {
		dispatch(setEditPlaylistTitle(false));
		onTitleChange();
	}

	function onKeyDown(event: KeyboardEvent): void {
		const { key } = event;
		switch (key) {
			case 'Escape':
				event.preventDefault();
				dispatch(setEditPlaylistTitle(false));
				setTitle(playlist.title);
				break;
		}
	}

	function renderForm(): ReactElement {
		return (
			<form className="playlist-title-form" onSubmit={onSubmit}>
				<input
					className="header-like"
					ref={inputRef}
					defaultValue={title}
					type="text"
					onChange={onChange}
					onKeyDown={onKeyDown}
					onBlur={onBlur}
					required
					autoFocus
					data-key-catch="Space"/>
			</form>
		);
	}

	return (
		isTitleEditing
			? renderForm()
			: <h1 className="playlist-title" onClick={onTitleClick}>{title}</h1>
	);
}
