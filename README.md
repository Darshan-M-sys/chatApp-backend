ChatApp API - Server README

Overview
This backend provides basic user authentication and profile management for the ChatApp project. It uses Express, MongoDB (Mongoose), and session-based authentication stored in MongoDB via connect-mongo. Socket.IO is initialized for future realtime chat features.

Quick Start
1. Install dependencies:
	npm install
2. Create a .env file with:
	MONGODB_URL=<your-mongo-uri>
	SECRET_KEY=<session-secret>
	PORT=<optional-port, default 5000>
3. Run the server:
	node index.js

Project Structure
- index.js            Server setup, sessions, Socket.IO, and route mounting
- models/db.js        MongoDB connection helper
- models/user.js      Mongoose schema for users
- models/profile.js   Mongoose schema for user profiles
- routes/authRooute.js Authentication routes (register, login, logout, current user)

API Endpoints (base path: /user)
- POST /register  Register a new user. Body: { userName, email, password }
- POST /login     Login. Body: { email, password }
- GET /           Returns current authenticated user (requires session)
- POST /logout    Logs out the current user (destroys session)

Notes
- Passwords are hashed with bcryptjs.
- Sessions are stored in MongoDB using connect-mongo; session cookie settings are configured in index.js.
- Input validation is basic; consider strengthening validation and error handling before production.

Next Steps
- Add profile update endpoints and user listing/search.
- Implement message models and Socket.IO event handlers for realtime chat.
- Improve security: input validation, rate-limiting, secure cookies, and CSRF protection.

License
Add your project license information here.

