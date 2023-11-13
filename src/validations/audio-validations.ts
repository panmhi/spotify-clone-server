import { categories } from '@/constants/audio-category-constants';
import * as yup from 'yup';

export const AudioValidation = yup.object().shape({
	title: yup.string().required('Title is missing!'),
	about: yup.string().required('About is missing!'),
	category: yup
		.string()
		.oneOf(categories, 'Invalid category!')
		.required('Category is missing!'),
});
