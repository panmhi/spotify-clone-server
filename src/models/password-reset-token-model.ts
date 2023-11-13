import { Model, ObjectId, Schema, model } from 'mongoose';
import { hash, compare } from 'bcrypt';

interface PasswordResetTokenDocument {
	owner: ObjectId;
	token: string;
	createdAt: Date;
}

interface Methods {
	compareToken(token: string): Promise<boolean>;
}

const passwordResetTokenSchema = new Schema<
	PasswordResetTokenDocument,
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
passwordResetTokenSchema.pre('save', async function (next) {
	// Hash the token
	if (this.isModified('token')) {
		this.token = await hash(this.token, 10);
	}
	next();
});

// Add a compareToken method to the schema
passwordResetTokenSchema.methods.compareToken = async function (token) {
	const result = await compare(token, this.token);
	return result;
};

const PasswordResetToken = model(
	'PasswordResetToken',
	passwordResetTokenSchema
) as Model<PasswordResetTokenDocument, {}, Methods>;

export default PasswordResetToken;
