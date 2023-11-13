import {
	getFavorites,
	getIsFavorite,
	toggleFavorite,
} from '@/controllers/favorite-controllers';
import { isVerified, mustAuth } from '@/middleware/auth';
import { Router } from 'express';

const favoriteRouter = Router();

// Add/remove an audio to favorite list
favoriteRouter.post('/', mustAuth, isVerified, toggleFavorite);

// Get favorite list
favoriteRouter.get('/', mustAuth, getFavorites);

// Check if an audio is in favorite list
favoriteRouter.get('/is-fav', mustAuth, getIsFavorite);

export default favoriteRouter;
