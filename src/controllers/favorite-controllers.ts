import { PopulatedFavAudio } from '@/@types/audio-types';
import { paginationQuery } from '@/@types/misc';
import Audio from '@/models/audio-model';
import Favorite from '@/models/favorite-model';
import { RequestHandler } from 'express';
import { isValidObjectId, ObjectId } from 'mongoose';

export const toggleFavorite: RequestHandler = async (req, res) => {
	// '/favorite?audioId=123'
	const audioId = req.query.audioId as string;
	let status: 'added' | 'removed';

	if (!isValidObjectId(audioId))
		return res.status(422).json({ error: 'Audio id is invalid!' });

	const audio = await Audio.findById(audioId);
	if (!audio) return res.status(404).json({ error: 'Resources not found!' });

	// 1) Update favorite database
	const alreadyExists = await Favorite.findOne({
		owner: req.user.id,
		items: audioId,
	});

	if (alreadyExists) {
		// We want to remove from old lists
		await Favorite.updateOne(
			{ owner: req.user.id },
			{
				$pull: { items: audioId }, // Remove the audioId from the items list
			}
		);

		status = 'removed';
	} else {
		const favorite = await Favorite.findOne({ owner: req.user.id });
		if (favorite) {
			// Add new audio to the existing fav list
			await Favorite.updateOne(
				{ owner: req.user.id },
				{
					$addToSet: { items: audioId }, // Add the audioId to the items list
				}
			);
		} else {
			// Create a fresh fav list
			await Favorite.create({ owner: req.user.id, items: [audioId] });
		}

		status = 'added';
	}

	// 2) Update audio database
	if (status === 'added') {
		await Audio.findByIdAndUpdate(audioId, {
			$addToSet: { likes: req.user.id },
		});
	}

	if (status === 'removed') {
		await Audio.findByIdAndUpdate(audioId, {
			$pull: { likes: req.user.id },
		});
	}

	res.json({ status });
};

export const getFavorites: RequestHandler = async (req, res) => {
	const userId = req.user.id;

	// const favorite = await Favorite.findOne({ owner: userId }).populate<{
	// 	items: PopulatedFavAudio[];
	// }>({
	// 	path: 'items', // Populate audio info to items array
	// 	populate: {
	// 		path: 'owner', // Populate owner info to each audio item
	// 	},
	// });

	// if (!favorite) return res.json({ audios: [] });

	// const audios = favorite.items.map((item) => {
	// 	return {
	// 		id: item._id,
	// 		title: item.title,
	// 		category: item.category,
	// 		file: item.file.url,
	// 		poster: item.poster?.url,
	// 		owner: { name: item.owner.name, id: item.owner._id },
	// 	};
	// });
	// res.json({ audios });

	const { limit = '20', pageNo = '0' } = req.query as paginationQuery;

	const favorites = await Favorite.aggregate([
		{ $match: { owner: userId } },
		{
			$project: {
				audioIds: {
					// Slice the items array for pagination
					$slice: [
						'$items',
						parseInt(limit) * parseInt(pageNo),
						parseInt(limit),
					],
				},
			},
		},
		{ $unwind: '$audioIds' },
		{
			$lookup: {
				from: 'audios',
				localField: 'audioIds',
				foreignField: '_id',
				as: 'audioInfo',
			},
		},
		{ $unwind: '$audioInfo' },
		{
			$lookup: {
				from: 'users',
				localField: 'audioInfo.owner',
				foreignField: '_id',
				as: 'ownerInfo',
			},
		},
		{ $unwind: '$ownerInfo' },
		{
			$project: {
				_id: 0,
				id: '$audioInfo._id',
				title: '$audioInfo.title',
				about: '$audioInfo.about',
				category: '$audioInfo.category',
				file: '$audioInfo.file.url',
				poster: '$audioInfo.poster.url',
				owner: { name: '$ownerInfo.name', id: '$ownerInfo._id' },
			},
		},
	]);

	res.json({ audios: favorites }); // audios: array of audio info objects
};

export const getIsFavorite: RequestHandler = async (req, res) => {
	// '/favorite?audioId=123'
	const audioId = req.query.audioId as string;

	if (!isValidObjectId(audioId))
		return res.status(422).json({ error: 'Invalid audio id!' });

	const favorite = await Favorite.findOne({
		owner: req.user.id,
		items: audioId,
	});

	res.json({ result: favorite ? true : false });
};
