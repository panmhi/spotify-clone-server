import * as yup from 'yup';
import { isValidObjectId } from 'mongoose';

// Validate token and userId sent in the request body from client
export const EmailVerificationTokenValidation = yup.object().shape({
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
