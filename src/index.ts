import express from 'express';
import 'dotenv/config';
import 'express-async-errors';
import '@/db';

import authRouter from './routers/auth-router';
import audioRouter from '@/routers/audio-router';
import favoriteRouter from '@/routers/favorite-router';
import playlistRouter from '@/routers/playlist-router';
import profileRouter from '@/routers/profile-router';
import historyRouter from '@/routers/history-router';

import './helpers/schedule';
import { errorHandler } from '@/middleware/error';

const app = express();

// Register middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('src/public'));

app.use('/auth', authRouter);
app.use('/audio', audioRouter);
app.use('/favorite', favoriteRouter);
app.use('/playlist', playlistRouter);
app.use('/profile', profileRouter);
app.use('/history', historyRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 8989;

app.listen(PORT, () => {
	console.log('Port is listening on port ' + PORT);
});

/**
 * The plan and features
 * upload audio files
 * listen to single audio
 * add to favorites
 * create playlist
 * remove playlist (public-private)
 * remove audios
 * many more
 * */
