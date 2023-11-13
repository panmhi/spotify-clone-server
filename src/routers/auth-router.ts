import {
	createUser,
	generateForgetPasswordLink,
	grantValid,
	logOut,
	sendProfile,
	sendReVerificationEmail,
	signIn,
	updatePassword,
	updateProfile,
	verifyEmail,
} from '@/controllers/auth-controllers';
import { isValidPassResetToken, mustAuth } from '@/middleware/auth';
import fileParser from '@/middleware/file-parser';
import { validate } from '@/middleware/validator';
import { EmailVerificationTokenValidation } from '@/validations/email-token-validations';
import {
	PassResetTokenValidation,
	UpdatePasswordValidation,
} from '@/validations/pass-reset-validations';
import {
	CreateUserValidation,
	UserSignInValidation,
} from '@/validations/user-validations';
import { Router } from 'express';

const authRouter = Router();

// Create a new user, generate email verification token and send user verify email
authRouter.post('/create', validate(CreateUserValidation), createUser);

// Verify email verification token when user enters the OTP sent to their email
authRouter.post(
	'/verify-email',
	validate(EmailVerificationTokenValidation),
	verifyEmail
);

// Re-generate email verification token and send user verify email
// req.body = { userId }
authRouter.post('/re-verify-email', sendReVerificationEmail);

// Generate password reset token and send user reset password email
// req.body = { email }
authRouter.post('/forget-password', generateForgetPasswordLink);

// Check if password reset token is valid or expired). req.body = {userId, token}
authRouter.post(
	'/verify-pass-reset-token',
	validate(PassResetTokenValidation),
	isValidPassResetToken,
	grantValid
);

// Update user password, req.body = {userId, token, password}
authRouter.post(
	'/update-password',
	validate(UpdatePasswordValidation),
	isValidPassResetToken,
	updatePassword
);

// Sign in, req.body = {email, password}
authRouter.post('/sign-in', validate(UserSignInValidation), signIn);

// Authenticate user and send user profile to client
authRouter.get('/is-auth', mustAuth, sendProfile);

// Sign in, req.body = {email, password}
authRouter.get('/public', (req, res) => {
	res.json({ message: 'You are in public route.' });
});

authRouter.get('/private', mustAuth, (req, res) => {
	res.json({ message: 'You are in private route.' });
});

// Upload file
authRouter.post('/update-profile', mustAuth, fileParser, updateProfile);

// Log out
authRouter.post('/log-out', mustAuth, logOut);

export default authRouter;
