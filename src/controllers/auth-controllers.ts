import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import { CreateUserRequest, VerifyEmailRequest } from '@/@types/user-types';
import User from '@/models/user-model';
import { formatProfile, generateToken } from '@/helpers/helper';
import {
	sendForgetPasswordMail,
	sendPassResetSuccessMail,
	sendVerificationMail,
} from '@/helpers/mail-helpers';
import EmailVerificationToken from '@/models/email-token-model';
import { isValidObjectId } from 'mongoose';
import PasswordResetToken from '@/models/password-reset-token-model';
import crypto from 'crypto';
import { JWT_SECRET, PASSWORD_RESET_LINK } from '@/constants/env-constants';
import { RequestWithFiles } from '@/middleware/file-parser';
import cloudinary from '@/cloud';
import formidable from 'formidable';

export const createUser: RequestHandler = async (
	req: CreateUserRequest,
	res
) => {
	const { name, email, password } = req.body;

	const existingUser = await User.findOne({ email });
	if (existingUser)
		return res.status(403).json({ error: 'Email is already in use!' });

	const user = await User.create({ name, email, password });

	// Create a token
	const token = generateToken();
	// Save token in database
	await EmailVerificationToken.create({
		owner: user._id,
		token,
	});

	/**
	 * Not awaiting email sending action since it can be done behind the scenes.
	 * This function:
	 * 1) create email verification token and store it in the database.
	 * 2) put the token in the email and send email to the user.
	 */
	sendVerificationMail(token, {
		name: user.name,
		email: user.email,
	});

	res
		.status(201)
		.json({ user: { id: user._id, name: user.name, email: user.email } });
};

export const verifyEmail: RequestHandler = async (
	req: VerifyEmailRequest,
	res
) => {
	const { token, userId } = req.body;
	// Get the verification token from the database by the user id
	const verificationToken = await EmailVerificationToken.findOne({
		owner: userId,
	});

	if (!verificationToken)
		return res.status(403).json({ error: 'Invalid token!' });

	// Compare token
	const matched = verificationToken.compareToken(token);

	if (!matched) return res.status(403).json({ error: 'Invalid token!' });

	// Update user's verified status
	await User.findByIdAndUpdate(userId, { verified: true });
	// Delete the token from the database
	await EmailVerificationToken.findByIdAndDelete(verificationToken._id);
	res.json({ message: 'Email verified successfully!' });
};

export const sendReVerificationEmail: RequestHandler = async (req, res) => {
	const { userId } = req.body;

	// Make sure the user id is valid, otherwise User.findById() will throw an error
	if (!isValidObjectId(userId))
		return res.status(403).json({ error: 'Invalid request!' });

	const user = await User.findById(userId);

	if (!user) return res.status(403).json({ error: 'Invalid request!' });

	if (user.verified)
		return res.status(422).json({ error: 'Your account is already verified!' });

	// Delete existing token
	await EmailVerificationToken.findOneAndDelete({
		owner: userId,
	});

	// Create a new token
	const token = generateToken();
	// Save token in database
	EmailVerificationToken.create({ owner: userId, token });

	// Send verification email
	sendVerificationMail(token, {
		name: user.name,
		email: user.email,
	});

	res.json({ message: 'Please check your email.' });
};

export const generateForgetPasswordLink: RequestHandler = async (req, res) => {
	// User forgets password and only knows email address
	const { email } = req.body;

	const user = await User.findOne({ email });

	if (!user) return res.status(404).json({ error: 'Account not found!' });

	// Delete existing token
	await PasswordResetToken.findOneAndDelete({
		owner: user._id,
	});

	// Create a new token
	const token = crypto.randomBytes(32).toString('hex');
	await PasswordResetToken.create({
		owner: user._id,
		token,
	});

	// Generate reset password link so that user can open the reset password page
	// https://panmusic.app/reset-password?token={token}&userId={userId}
	const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

	sendForgetPasswordMail({ email: user.email, link: resetLink });

	res.json({ message: 'Check your registered email to reset password.' });
};

export const grantValid: RequestHandler = async (req, res) => {
	res.json({ valid: true });
};

export const updatePassword: RequestHandler = async (req, res) => {
	const { password, userId } = req.body;

	const user = await User.findById(userId);

	if (!user) return res.status(403).json({ error: 'Unauthorized access!' });

	const matched = await user.comparePassword(password);
	if (matched)
		return res
			.status(422)
			.json({ error: 'New password cannot be the same as the old one!' });

	user.password = password;
	await user.save();

	await PasswordResetToken.findOneAndDelete({ owner: user._id });

	// Send the scuccess email
	sendPassResetSuccessMail(user.name, user.email);
	res.json({ message: 'Password reset successfully!' });
};

export const signIn: RequestHandler = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (!user)
		return res.status(403).json({ error: 'Email/Password mismatched!' });

	const matched = await user.comparePassword(password);
	if (!matched)
		return res.status(403).json({ error: 'Email/Password mismatched!' });

	// Generate token via JWT: jwt.sign(payload, secret)
	const token = jwt.sign({ userId: user._id }, JWT_SECRET);
	user.tokens.push(token);
	await user.save();

	res.json({
		profile: {
			id: user._id,
			name: user.name,
			email: user.email,
			verified: user.verified,
			avatar: user.avatar?.url,
			followers: user.followers.length,
			followings: user.followings.length,
		},
		token,
	});
};

export const updateProfile: RequestHandler = async (
	req: RequestWithFiles,
	res
) => {
	const { name } = req.body;
	const avatar = req.files?.avatar as formidable.File;

	// We get req.user from mustAuth middleware
	const user = await User.findById(req.user.id);
	if (!user) throw new Error('something went wrong, user not found!');

	if (typeof name !== 'string')
		return res.status(422).json({ error: 'Invalid name!' });

	if (name.trim().length < 3)
		return res.status(422).json({ error: 'Invalid name!' });

	user.name = name;

	if (avatar) {
		// If there is already an avatar file, we want to remove that
		if (user.avatar?.publicId) {
			await cloudinary.uploader.destroy(user.avatar.publicId);
		}

		// Upload new avatar file
		// secure_url is https url
		const { secure_url, public_id } = await cloudinary.uploader.upload(
			avatar.filepath,
			{
				width: 300,
				height: 300,
				crop: 'thumb',
				gravity: 'face',
			}
		);

		user.avatar = { url: secure_url, publicId: public_id };
	}

	await user.save();

	res.json({ profile: formatProfile(user) });
};

export const sendProfile: RequestHandler = (req, res) => {
	// We get req.user from mustAuth middleware
	res.json({ profile: req.user });
};

export const logOut: RequestHandler = async (req, res) => {
	// '/auth/logout?fromAll=yes'
	const { fromAll } = req.query;

	// We get req.user and req.token from mustAuth middleware
	const token = req.token;
	const user = await User.findById(req.user.id);
	if (!user) throw new Error('something went wrong, user not found!');

	// Logout from all devcies
	if (fromAll === 'yes') user.tokens = [];
	// Or logout from current device only
	else user.tokens = user.tokens.filter((t) => t !== token);

	await user.save();
	res.json({ success: true });
};
