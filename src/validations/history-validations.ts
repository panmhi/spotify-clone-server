import { isValidObjectId } from 'mongoose';
import * as yup from 'yup';

export const UpdateHistoryValidation = yup.object().shape({
	audio: yup
		.string()
		.transform(function (value) {
			return this.isType(value) && isValidObjectId(value) ? value : '';
		})
		.required('Invalid audio id!'),
	progress: yup.number().required('History progress is missing!'),
	date: yup
		.string()
		.transform(function (value) {
			const date = new Date(value);
			if (date instanceof Date) return value;
			return '';
		})
		.required('Invalid date!'),
});
