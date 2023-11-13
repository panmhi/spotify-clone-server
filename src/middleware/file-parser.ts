import { Request, RequestHandler } from 'express';
import formidable, { File } from 'formidable';

export interface RequestWithFiles extends Request {
	files?: { [key: string]: File };
}

const fileParser: RequestHandler = async (req: RequestWithFiles, res, next) => {
	if (!req.headers['content-type']?.startsWith('multipart/form-data;'))
		return res.status(422).json({ error: 'Only accepts form-data!' });

	const form = formidable({ multiples: false });

	const [fields, files] = await form.parse(req);

	// Format fields and files to be req.body and req.files
	for (let key in fields) {
		const field = fields[key]; // field is an array of string
		if (field) {
			req.body[key] = field[0];
		}
	}

	for (let key in files) {
		const file = files[key]; // file is an array of File objects

		if (!req.files) {
			req.files = {};
		}

		if (file) {
			req.files[key] = file[0];
		}
	}

	next();
};

export default fileParser;
