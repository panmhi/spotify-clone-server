import { ErrorRequestHandler } from 'express';

// Server error handler
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	res.status(500).json({ error: err.message });
};
