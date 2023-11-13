import { compare, hash } from 'bcrypt';
import { Model, ObjectId, Schema, model } from 'mongoose';

export interface UserDocument {
	_id: ObjectId;
	name: string;
	email: string;
	password: string;
	verified: boolean;
	avatar?: {
		url: string;
		publicId: string;
	};
	tokens: string[]; // Array of tokens since user can login from multiple devices
	favorites: ObjectId[];
	followers: ObjectId[];
	followings: ObjectId[];
}

interface Methods {
	comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<UserDocument, {}, Methods>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		avatar: {
			type: Object,
			url: String,
			publicId: String,
		},
		verified: {
			type: Boolean,
			default: false, // Set default value to false
		},
		favorites: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Audio',
			},
		],
		followers: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		followings: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		tokens: [String],
	},
	{ timestamps: true }
);

// Regular function declaration is used here to access 'this' keyword
userSchema.pre('save', async function (next) {
	// Hash the token
	if (this.isModified('password')) {
		console.log(this.password);
		this.password = await hash(this.password, 10);
	}
	next();
});

// Add a compareToken method to the schema
userSchema.methods.comparePassword = async function (password) {
	const result = await compare(password, this.password);
	return result;
};

const User = model('User', userSchema) as Model<UserDocument, {}, Methods>;

export default User;
