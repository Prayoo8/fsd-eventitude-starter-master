# Eventitude Frontend Application

This is the frontend part of a full-stack event management application based on Vue 3.

## Features

### 🔐 User Authentication
- User registration (with password strength validation)
- User login/logout
- JWT-based authentication state management

### 📅 Event Management
- Create new events
- View all events list
- View event details
- Edit events (creator only)
- Delete events (creator only)
- Register for events

### ❓ Q&A Interaction
- Ask questions in events (participants only)
- Vote on questions
- Delete questions (creator or event creator)

### 👤 Personal Center
- View events I created
- View events I'm attending

## Tech Stack

- **Vue 3** - Frontend framework
- **Vue Router 4** - Routing management
- **Axios** - HTTP client
- **Vite** - Build tool

## Project Structure

```
src/
├── components/          # Reusable components
│   └── NavBar.vue      # Navigation bar component
├── views/              # Page components
│   ├── Home.vue        # Home page
│   ├── Login.vue       # Login page
│   ├── Register.vue    # Registration page
│   ├── EventList.vue   # Events list
│   ├── EventDetail.vue # Event details
│   ├── CreateEvent.vue # Create event
│   ├── EditEvent.vue   # Edit event
│   └── MyEvents.vue    # My events
├── services/           # API services
│   └── api.js         # API interface encapsulation
├── store/             # State management
│   └── auth.js        # Authentication state
├── router/            # Routing configuration
│   └── index.js       # Route definitions
├── App.vue            # Root component
└── main.js            # Entry file
```

## Getting Started

1. Make sure the backend service is running (port 3333)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Visit http://localhost:5173

## API Endpoints

The frontend communicates with the backend through the following APIs:

### Authentication APIs
- `POST /users` - User registration
- `POST /login` - User login
- `POST /logout` - User logout

### Event APIs
- `GET /events` - Get all events
- `GET /events/:id` - Get event details
- `POST /events` - Create event
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `POST /events/:id` - Register for event
- `GET /events/search` - Search events

### Question APIs
- `GET /events/:id/questions` - Get event questions
- `POST /events/:id/question` - Create question
- `POST /questions/:id/vote` - Vote on question
- `DELETE /questions/:id/vote` - Cancel vote
- `DELETE /questions/:id` - Delete question

## Usage Instructions

1. **Register Account**: Visit the registration page, fill in personal information and set password
2. **Login System**: Login with email and password
3. **Browse Events**: View all available events on the home page or events list page
4. **Create Events**: After login, you can create new events, set time, location, participant limits, etc.
5. **Join Events**: Register for interesting events on the event details page
6. **Interactive Communication**: After joining an event, you can ask questions and vote on the event page
7. **Manage Events**: Manage your created and attended events on the "My Events" page

## Important Notes

- Password must contain 8-20 characters, at least one uppercase letter, one lowercase letter, one number and one special character
- Event start time must be in the future
- Registration deadline must be earlier than event start time
- Only event creators can edit and delete events
- Only event participants can ask questions and vote
- Question creators or event creators can delete questions

## Test Accounts

You can use the following test accounts to login:

- Email: `dkells0@gmail.com`, Password: `Wr3Xh7274J!`
- Email: `jmorston1@gmail.com`, Password: `Ghd1221jS!`
- Email: `rgiovanardi2@gmail.com`, Password: `X1cu2sd1!`
- Email: `bissit3@gmail.com`, Password: `Ca3432jDF!`
- Email: `eondricek4@gmail.com`, Password: `Wr3Xh4m!`

## Troubleshooting

If you encounter a "Loading..." issue on the events page:

1. Make sure the backend service is running on port 3333
2. Check if you're logged in with a valid account
3. Verify the API endpoints are accessible
4. Check the browser console for any error messages