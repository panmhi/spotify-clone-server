import {
	getHistories,
	getRecentlyPlayed,
	removeHistory,
	updateHistory,
} from '@/controllers/history-controllers';
import { mustAuth } from '@/middleware/auth';
import { validate } from '@/middleware/validator';
import { UpdateHistoryValidation } from '@/validations/history-validations';
import { Router } from 'express';

const historyRouter = Router();

// Update audio history
historyRouter.post(
	'/',
	mustAuth,
	validate(UpdateHistoryValidation),
	updateHistory
);

// Remove audio history
historyRouter.delete('/', mustAuth, removeHistory);

// Get audio history grouped by date
historyRouter.get('/', mustAuth, getHistories);

historyRouter.get('/recently-played', mustAuth, getRecentlyPlayed);

export default historyRouter;
