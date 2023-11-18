import { generateTemplate } from '@/mail/template';
import EmailVerificationToken from '@/models/email-token-model';
import {
	MAILTRAP_PASS,
	MAILTRAP_USER,
	SIGN_IN_URL,
	VERIFICATION_EMAIL,
} from '@/constants/env-constants';
import nodemailer from 'nodemailer';
import path from 'path';

const generateMailTransporter = () => {
	return nodemailer.createTransport({
		host: 'sandbox.smtp.mailtrap.io',
		port: 2525,
		auth: {
			user: MAILTRAP_USER,
			pass: MAILTRAP_PASS,
		},
	});
};

interface Profile {
	name: string;
	email: string;
}

export const sendVerificationMail = async (token: string, profile: Profile) => {
	const transport = generateMailTransporter();
	const { name, email } = profile;

	const welcomeMessage = `Hi ${name}, welcome to PanMusic! There are so many things that we do for verified users. Use the given OTP to verify your email. `;
	transport.sendMail({
		to: email,
		from: VERIFICATION_EMAIL,
		subject: 'Welcome to PanMusic',
		html: generateTemplate({
			title: 'Welcome to PanMusic',
			message: welcomeMessage,
			logo: 'cid:logo',
			banner: 'cid:welcome',
			link: '#',
			btnTitle: token,
		}),
		attachments: [
			{
				filename: 'logo.png',
				path: path.join(__dirname, '../mail/images/logo.png'),
				cid: 'logo',
			},
			{
				filename: 'welcome.png',
				path: path.join(__dirname, '../mail/images/welcome.png'),
				cid: 'welcome',
			},
		],
	});
};

interface Options {
	email: string;
	link: string;
}

export const sendForgetPasswordMail = async (options: Options) => {
	const transport = generateMailTransporter();
	const { email, link } = options;

	const message = `We just received a request that you forgot your password.
	Please use the link below to reset your password. `;

	transport.sendMail({
		to: email,
		from: VERIFICATION_EMAIL,
		subject: 'Reset your PanMusic password',
		html: generateTemplate({
			title: 'Reset Password',
			message,
			logo: 'cid:logo',
			banner: 'cid:forget_password',
			link,
			btnTitle: 'Reset Password',
		}),
		attachments: [
			{
				filename: 'logo.png',
				path: path.join(__dirname, '../mail/images/logo.png'),
				cid: 'logo',
			},
			{
				filename: 'forget_password.png',
				path: path.join(__dirname, '../mail/images/forget_password.png'),
				cid: 'forget_password',
			},
		],
	});
};

export const sendPassResetSuccessMail = async (name: string, email: string) => {
	const transport = generateMailTransporter();

	const message = `Dear ${name}, we just updated your password. You can now
	sign in with your new password.`;

	transport.sendMail({
		to: email,
		from: VERIFICATION_EMAIL,
		subject: 'PanMusic Password Reset Successfully',
		html: generateTemplate({
			title: 'Password Reset Successfully',
			message,
			logo: 'cid:logo',
			banner: 'cid:forget_password',
			link: SIGN_IN_URL,
			btnTitle: 'Sign In',
		}),
		attachments: [
			{
				filename: 'logo.png',
				path: path.join(__dirname, '../mail/images/logo.png'),
				cid: 'logo',
			},
			{
				filename: 'forget_password.png',
				path: path.join(__dirname, '../mail/images/forget_password.png'),
				cid: 'forget_password',
			},
		],
	});
};
