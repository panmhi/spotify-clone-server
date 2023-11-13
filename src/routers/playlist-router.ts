import {
	createPlaylist,
	getAudios,
	getPlaylistByProfile,
	removePlaylist,
	updatePlaylist,
} from '@/controllers/playlist-controllers';
import { isVerified, mustAuth } from '@/middleware/auth';
import { validate } from '@/middleware/validator';
import {
	NewPlaylistValidation,
	OldPlaylistValidation,
} from '@/validations/playlist-validations';

import { Router } from 'express';

const playlistRouter = Router();

// Create a new playlist
playlistRouter.post(
	'/create',
	mustAuth,
	isVerified,
	validate(NewPlaylistValidation),
	createPlaylist
);

// Update title, visibility and add audio to playlist
playlistRouter.patch(
	'/',
	mustAuth,
	validate(OldPlaylistValidation),
	updatePlaylist
);

// Remove entire playlist or one audio from the playlist items array
playlistRouter.delete('/', mustAuth, removePlaylist);

// Get playlist (paginated)
playlistRouter.get('/by-profile', mustAuth, getPlaylistByProfile);

// Get audio array of a playlist
playlistRouter.get('/:playlistId', mustAuth, getAudios);

export default playlistRouter;
