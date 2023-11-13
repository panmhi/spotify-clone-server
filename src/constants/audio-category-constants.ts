export const categories = [
	'Arts',
	'Business',
	'Education',
	'Entertainment',
	'Kids & Family',
	'Music',
	'Science',
	'Tech',
	'Others',
] as const;

export type categoriesTypes = (typeof categories)[number];
