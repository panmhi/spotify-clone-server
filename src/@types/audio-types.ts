import { AudioDocument } from '@/models/audio-model';
import { ObjectId } from 'mongoose';
import { Request } from 'express';

export type PopulatedFavAudio = AudioDocument<{ _id: ObjectId; name: string }>;

export interface CreatePlaylistRequest extends Request {
	body: { title: string; audioId: string; visibility: 'public' | 'private' };
}

export interface UpdatePlaylistRequest extends Request {
	body: {
		title: string;
		id: string;
		audioId: string;
		visibility: 'public' | 'private';
	};
}
