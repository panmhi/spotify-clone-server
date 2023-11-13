import { isValidObjectId } from 'mongoose';
import * as yup from 'yup';

export const NewPlaylistValidation = yup.object().shape({
	title: yup.string().required('Title is missing!'),
	audioId: yup.string().transform(function (value) {
		return this.isType(value) && isValidObjectId(value) ? value : '';
	}),
	visibility: yup
		.string()
		.oneOf(['public', 'private'], 'Visibility must be public or private!'),
});

export const OldPlaylistValidation = yup.object().shape({
	title: yup.string().required('Title is missing!'),
	// this is going to validate the audio id
	item: yup.string().transform(function (value) {
		return this.isType(value) && isValidObjectId(value) ? value : '';
	}),
	// this is going to validate the playlist id
	id: yup.string().transform(function (value) {
		return this.isType(value) && isValidObjectId(value) ? value : '';
	}),
	visibility: yup
		.string()
		.oneOf(['public', 'private'], 'Visibility must be public or private!'),
});
