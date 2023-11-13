import {
	createAudio,
	getLatestUploads,
	updateAudio,
} from '@/controllers/audio-controllers';
import { isVerified, mustAuth } from '@/middleware/auth';
import fileParser from '@/middleware/file-parser';
import { validate } from '@/middleware/validator';
import { AudioValidation } from '@/validations/audio-validations';
import { Router } from 'express';

const audioRouter = Router();

// Upload new audio
audioRouter.post(
	'/create',
	mustAuth,
	// If user verified email
	isVerified,
	fileParser,
	validate(AudioValidation),
	createAudio
);

// Update audio info
audioRouter.patch(
	'/:audioId', // Can be accessed via req.params.audioId
	mustAuth,
	isVerified,
	fileParser,
	validate(AudioValidation),
	updateAudio
);

// Get latest uploaded audios
audioRouter.get('/latest', getLatestUploads);

export default audioRouter;
