import { RequestHandler } from 'express';
import * as yup from 'yup';

export const validate = (validation: any): RequestHandler => {
	// Return the middleware function
	return async (req, res, next) => {
		if (!req.body)
			return res.status(422).json({ error: 'Empty body is not excepted!' });

		// Create a wrapper schema so that we can pass in any schema
		// to validate the req.body object
		const validationWrapper = yup.object({
			body: validation,
		});

		try {
			await validationWrapper.validate(
				{ body: req.body },
				{
					// Abort the rest validations and send error message when the first error is encountered
					abortEarly: true,
				}
			);
			next();
		} catch (error) {
			if (error instanceof yup.ValidationError) {
				res.status(422).json({ error: error.message });
			}
		}
	};
};
