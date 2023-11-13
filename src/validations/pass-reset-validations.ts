import * as yup from 'yup';
import { isValidObjectId } from 'mongoose';

// Validate userId and token sent in the request body from client
export const PassResetTokenValidation = yup.object().shape({
	token: yup.string().trim().required('Invalid token!'),
	userId: yup
		.string()
		.transform(function (value) {
			// Check if the value is a string and a valid ObjectId
			if (this.isType(value) && isValidObjectId(value)) {
				return value;
			}
			// Empty string won't pass the required test
			return '';
		})
		.required('Invalid userId!'),
});

// Validate userId, token and new password sent in the request body from client
export const UpdatePasswordValidation = yup.object().shape({
	token: yup.string().trim().required('Invalid token!'),
	userId: yup
		.string()
		.transform(function (value) {
			// Check if the value is a string and a valid ObjectId
			if (this.isType(value) && isValidObjectId(value)) {
				return value;
			}
			// Empty string won't pass the required test
			return '';
		})
		.required('Invalid userId!'),
	password: yup
		.string()
		.trim()
		.required('Password is missing!')
		.min(8, 'Password is too short!')
		.matches(
			/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
			'Password is too simple!'
		),
});
