import cloudinary from '@/cloud';
import { categoriesTypes } from '@/constants/audio-category-constants';
import { RequestWithFiles } from '@/middleware/file-parser';
import { RequestHandler } from 'express';
import formidable from 'formidable';
import Audio from '@/models/audio-model';
import { PopulatedFavAudio } from '@/@types/audio-types';

interface CreateAudioRequest extends RequestWithFiles {
	body: {
		title: string;
		about: string;
		category: categoriesTypes;
	};
}

export const createAudio: RequestHandler = async (
	req: CreateAudioRequest,
	res
) => {
	const { title, about, category } = req.body;
	const poster = req.files?.poster as formidable.File;
	const audioFile = req.files?.file as formidable.File;
	const ownerId = req.user.id;

	if (!audioFile)
		return res.status(422).json({ error: 'Audio file is missing!' });

	const audioRes = await cloudinary.uploader.upload(audioFile.filepath, {
		resource_type: 'video', // cloudinary doesn't have audio resource type
	});
	const newAudio = new Audio({
		title,
		about,
		category,
		owner: ownerId,
		file: { url: audioRes.secure_url, publicId: audioRes.public_id },
	});

	if (poster) {
		const posterRes = await cloudinary.uploader.upload(poster.filepath, {
			width: 300,
			height: 300,
			crop: 'thumb',
			gravity: 'face',
		});

		newAudio.poster = {
			url: posterRes.secure_url,
			publicId: posterRes.public_id,
		};
	}

	await newAudio.save();

	res.status(201).json({
		audio: {
			title,
			about,
			file: newAudio.file.url,
			poster: newAudio.poster?.url,
		},
	});
};

// Update audio title, about, category
export const updateAudio: RequestHandler = async (
	req: CreateAudioRequest,
	res
) => {
	const { title, about, category } = req.body;
	const poster = req.files?.poster as formidable.File;
	const ownerId = req.user.id;
	// '/audio/:audioId'
	const { audioId } = req.params;

	const audio = await Audio.findOneAndUpdate(
		{ owner: ownerId, _id: audioId }, // Find audio by owner and audioId
		{ title, about, category }, // Update title, about, category
		{ new: true } // Return the updated document
	);

	if (!audio) return res.status(404).json({ error: 'Record not found!' });

	if (poster) {
		// Remove old poster from cloudinary
		if (audio.poster?.publicId) {
			await cloudinary.uploader.destroy(audio.poster.publicId);
		}

		// Upload new poster to cloudinary
		const posterRes = await cloudinary.uploader.upload(poster.filepath, {
			width: 300,
			height: 300,
			crop: 'thumb',
			gravity: 'face',
		});

		// Save new poster info to database
		audio.poster = {
			url: posterRes.secure_url,
			publicId: posterRes.public_id,
		};

		await audio.save();
	}

	res.status(201).json({
		audio: {
			title,
			about,
			file: audio.file.url,
			poster: audio.poster?.url,
		},
	});
};

export const getLatestUploads: RequestHandler = async (req, res) => {
	const list = await Audio.find()
		.sort('-createdAt')
		.limit(10)
		.populate<PopulatedFavAudio>('owner');

	const audios = list.map((item) => {
		return {
			id: item._id,
			title: item.title,
			about: item.about,
			category: item.category,
			file: item.file.url,
			poster: item.poster?.url,
			owner: { name: item.owner.name, id: item.owner._id },
		};
	});

	res.json({ audios });
};
