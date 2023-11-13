import { JWT_SECRET } from '@/constants/env-constants';
import PasswordResetToken from '@/models/password-reset-token-model';
import User from '@/models/user-model';
import { RequestHandler } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

export const isValidPassResetToken: RequestHandler = async (req, res, next) => {
	const { token, userId } = req.body;

	const resetToken = await PasswordResetToken.findOne({ owner: userId });

	if (!resetToken)
		return res
			.status(403)
			.json({ error: 'Unauthorized access, invalid token!' });

	const matched = await resetToken.compareToken(token);

	if (!matched)
		return res
			.status(403)
			.json({ error: 'Unauthorized access, invalid token!' });

	next();
};

export const mustAuth: RequestHandler = async (req, res, next) => {
	const { authorization } = req.headers;
	const token = authorization?.split('Bearer ')[1];
	if (!token) return res.status(403).json({ error: 'Unauthorized request!' });

	// payload: { userId: string }
	const payload = verify(token, JWT_SECRET) as JwtPayload;
	const id = payload.userId;

	const user = await User.findOne({ _id: id, tokens: token });
	if (!user) return res.status(403).json({ error: 'Unauthorized request!' });

	req.user = {
		id: user._id,
		name: user.name,
		email: user.email,
		verified: user.verified,
		avatar: user.avatar?.url,
		followers: user.followers.length,
		followings: user.followings.length,
	};

	req.token = token;

	next();
};

export const isAuth: RequestHandler = async (req, res, next) => {
	const { authorization } = req.headers;
	const token = authorization?.split('Bearer ')[1];

	if (token) {
		const payload = verify(token, JWT_SECRET) as JwtPayload;
		const id = payload.userId;

		const user = await User.findOne({ _id: id, tokens: token });
		if (user) {
			req.user = {
				id: user._id,
				name: user.name,
				email: user.email,
				verified: user.verified,
				avatar: user.avatar?.url,
				followers: user.followers.length,
				followings: user.followings.length,
			};
			req.token = token;
		}
	}

	next();
};

// Check if the user has verified the email
export const isVerified: RequestHandler = async (req, res, next) => {
	if (!req.user.verified)
		return res.status(403).json({ error: 'Please verify your email account!' });
	next();
};
