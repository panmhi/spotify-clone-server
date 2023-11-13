import { Model, ObjectId, Schema, model } from 'mongoose';
import { hash, compare } from 'bcrypt';

interface EmailVerificationTokenDocument {
	owner: ObjectId;
	token: string;
	createdAt: Date;
}

interface Methods {
	compareToken(token: string): Promise<boolean>;
}

const emailVerificationTokenSchema = new Schema<
	EmailVerificationTokenDocument,
	{},
	Methods
>({
	owner: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	token: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 3600, // Delete document after 1 hour
	},
});

// Regular function declaration is used here to access 'this' keyword
emailVerificationTokenSchema.pre('save', async function (next) {
	// Hash the token
	if (this.isModified('token')) {
		this.token = await hash(this.token, 10);
	}
	next();
});

// Add a compareToken method to the schema
emailVerificationTokenSchema.methods.compareToken = async function (token) {
	const result = await compare(token, this.token);
	return result;
};

const EmailVerificationToken = model(
	'EmailVerificationToken',
	emailVerificationTokenSchema
) as Model<EmailVerificationTokenDocument, {}, Methods>;

export default EmailVerificationToken;
