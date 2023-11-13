const getById = (id) => {
	return document.getElementById(id);
};

const password = getById('password');
const confirmPassword = getById('confirm-password');
const form = getById('form');
const container = getById('container');
const loader = getById('loader');
const button = getById('submit');
const error = getById('error');
const success = getById('success');

error.style.display = 'none';
success.style.display = 'none';
container.style.display = 'none';

let token, userId;
const passRegex =
	/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/;

// Get token and userId from the url, verify the token and then display the form
window.addEventListener('DOMContentLoaded', async () => {
	// Get token and userId from the url
	const params = new Proxy(new URLSearchParams(window.location.search), {
		get: (searchParams, prop) => {
			return searchParams.get(prop);
		},
	});
	token = params.token;
	userId = params.userId;

	// Verify it's a valid token
	const res = await fetch('/auth/verify-pass-reset-token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8', // charset=utf-8 is very important, otherwise it'll throw error
		},
		body: JSON.stringify({
			token,
			userId,
		}),
	});

	if (!res.ok) {
		const { error } = await res.json();
		loader.innerText = error;
		return;
	}

	loader.style.display = 'none';
	container.style.display = 'block';
});

const displayError = (errorMessage) => {
	// Remove success message if there is any.
	success.style.display = 'none';
	error.innerText = errorMessage;
	error.style.display = 'block';
};

const displaySuccess = (successMessage) => {
	// Remove error message if there is any.
	error.style.display = 'none';
	success.innerText = successMessage;
	success.style.display = 'block';
};

const handleSubmit = async (event) => {
	event.preventDefault();
	// Validate on client side (server also validates via validator middleware)
	if (!password.value.trim()) {
		// Render error
		return displayError('Password is missing!');
	}

	if (!passRegex.test(password.value)) {
		// Render error
		return displayError(
			'Password is too simple, use alpha numeric with special characters!'
		);
	}

	if (password.value !== confirmPassword.value) {
		// Render error
		return displayError('Password do not match!');
	}

	button.disabled = true;
	button.innerText = 'Please wait...';

	// Handle the submit
	const res = await fetch('/auth/update-password', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
		},
		body: JSON.stringify({
			token,
			userId,
			password: password.value,
		}),
	});

	button.disabled = false;
	button.innerText = 'Reset Password';

	if (!res.ok) {
		const { error } = await res.json();
		return displayError(error);
	}

	displaySuccess('Your password is resets successfully!');

	// Resetting the form
	password.value = '';
	confirmPassword.value = '';
};

form.addEventListener('submit', handleSubmit);
