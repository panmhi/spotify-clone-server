# Requirements

## Mailtrap

Get a Mailtrap account to send emails:

- Account email verification
- Account email re-verification
- Password reset
- Password reset success notification

Enter MAILTRAP_USER and MAILTRAP_PASS in the `.env` file.

## Cloudinary

Get a Cloudinary account for cloud file storage.

Enter CLOUD_NAME, CLOUD_KEY, and CLOUD_SECRET in the `.env` file.

## MongoDB

MongoDB is used for data storage.

Enter MONGO_URI in the `.env` file.

# Installation

Install NPM packages

```sh
npm install .
```

# Environment Variables

Add a `.env` file with following environment variables:

```
PORT=
MONGO_URI=
MAILTRAP_USER=
MAILTRAP_PASS=
VERIFICATION_EMAIL=
PASSWORD_RESET_LINK=
SIGN_IN_URL=
JWT_SECRET=
CLOUD_NAME=
CLOUD_KEY=
CLOUD_SECRET=
```

PORT is the port you want to run the server on.

MONGO_URI: mongoDB url.

MAILTRAP_USER, MAILTRAP_PASS: mailtrap account user and pass credentials.

VERIFICATION_EMAIL: the sender email address you want to use.

PASSWORD_RESET_LINK: link to the `reset-password.html` file in the public folder.

SIGN_IN_URL: link to the sign in page.

JWT_SECRET: a custom secret constant to encode JWT token.

CLOUD_NAME, CLOUD_KEY, CLOUD_SECRET: cloudinary account credentials.
