# IdeaToPrompt

**IdeaToPrompt** is a full-stack AI prompt engineering web app that turns a rough idea into a polished, structured prompt ready to use with modern LLMs such as ChatGPT, Claude, Gemini, or Mistral.

The project combines a lightweight vanilla JavaScript frontend with an Express.js backend, user authentication, prompt history, favorites, and an OpenAI-compatible NVIDIA NIM AI endpoint.

## Features

- Convert a raw idea into an engineered AI prompt
- Six prompt styles: Creative, Technical, Storytelling, Marketing, Educational, and Code
- AI-generated prompts using an OpenAI-compatible NVIDIA NIM endpoint
- User registration and login with bcrypt password hashing and JWT authentication
- Prompt history for authenticated users
- Favorite/unfavorite saved prompts
- Copy generated prompts to the clipboard
- Prompt word count and generated prompt tags
- Responsive, animated landing page with video background
- REST API with health-check endpoint
- Helmet, CORS, Morgan, and JSON request handling on the backend
- File-based JSON persistence for users and prompts

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Google Fonts
- Browser Fetch API
- Local Storage for the authentication token

### Backend

- Node.js
- Express.js
- OpenAI Node SDK
- NVIDIA NIM / OpenAI-compatible AI endpoint
- JWT (`jsonwebtoken`)
- `bcryptjs`
- `dotenv`
- `helmet`
- `cors`
- `morgan`

### Data Storage

The current version uses a small JSON data store at `server/data/db.json`. It is intentionally simple for a lightweight project and local development.

## Project Structure

```text
IdeaToPrompt/
├── client/
│   ├── index.html       # Landing page, generator UI and frontend logic
│   ├── style.css        # Complete UI styling and animations
│   └── video.mp4        # Hero background video
│
├── server/
│   ├── config/
│   │   └── database.js  # JSON persistence and data access helpers
│   ├── data/
│   │   └── db.json      # Local users and prompt data
│   ├── middleware/
│   │   └── auth.js      # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── prompt.routes.js
│   ├── .env.example     # Environment variable template
│   ├── index.js         # Express server entry point
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── CLAUDE.md
├── LICENSE
└── README.md
```

## How It Works

```text
User enters an idea
        ↓
Selects a prompt style
        ↓
Frontend sends POST /api/prompts/generate
        ↓
Express validates the request
        ↓
Backend builds a style-specific system prompt
        ↓
NVIDIA NIM AI model generates the engineered prompt
        ↓
Backend returns prompt + tags + word count
        ↓
Authenticated users also get the prompt saved to history
```

## Getting Started

### 1. Prerequisites

Install:

- Node.js LTS
- Git
- A modern browser
- An NVIDIA API key for the configured AI provider

### 2. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd IdeaToPrompt
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside `server/` from the provided template:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Then set at least:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
AI_BASE_URL=https://integrate.api.nvidia.com/v1
AI_API_KEY=your-nvidia-api-key
AI_MODEL=deepseek-ai/deepseek-v4-pro
```

**Never commit the real `.env` file or API key.** The repository only contains `.env.example`.

### 5. Start the server

From `server/`:

```bash
npm start
```

For development with Node's watch mode:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The Express server serves the frontend from `client/`, so a separate frontend development server is not required.

## Authentication

The authentication flow is handled by the Express API:

- `POST /api/auth/register` — create an account
- `POST /api/auth/login` — authenticate a user
- `GET /api/auth/me` — retrieve the current authenticated user

Passwords are hashed with `bcryptjs`. Successful authentication returns a JWT, which the frontend stores in browser local storage and sends as a Bearer token for protected requests.

## Prompt API

- `POST /api/prompts/generate` — generate a prompt from an idea and style
- `GET /api/prompts/history?page=1&limit=10` — retrieve authenticated user's prompt history
- `PATCH /api/prompts/:id/favorite` — toggle a saved prompt's favorite state
- `GET /api/health` — server health check

## Prompt Styles

| Style | Purpose |
| --- | --- |
| Creative | Imaginative and visually detailed prompts |
| Technical | Precise, structured, step-by-step prompts |
| Storytelling | Narrative and character-driven prompts |
| Marketing | Persuasive and conversion-focused prompts |
| Educational | Clear and learner-friendly prompts |
| Code | Implementation-focused technical prompts |

## AI Provider

The backend uses the OpenAI Node SDK against NVIDIA's OpenAI-compatible API endpoint. The provider key belongs on the server and is read from `AI_API_KEY`; it is never embedded in frontend code.

For end users, IdeaToPrompt does not ask them to enter an AI provider key. The server owner must configure the provider credentials.

## Security Notes

- `.env` is excluded from Git.
- API keys are read from environment variables.
- Passwords are hashed before persistence.
- Protected API routes validate JWTs.
- User prompt history is scoped to the authenticated user.
- Helmet is enabled for common HTTP security headers.
- Input length and required fields are validated by the API.

## Development Conventions

- Keep frontend behavior in `client/index.html` and presentation in `client/style.css` unless a refactor clearly benefits from separate modules.
- Keep API endpoints inside `server/routes/`.
- Keep authentication middleware in `server/middleware/`.
- Keep persistence/data access logic in `server/config/database.js`.
- Use ES modules on the backend.
- Prefer small, focused functions and meaningful names.
- Do not hardcode secrets or provider API keys.
- Follow Conventional Commits for Git history.

## Conventional Commits

Examples used by this project:

```text
docs: add project README
chore: add gitignore and license
docs: add AI development guidelines
feat: add prompt history
fix: handle expired authentication tokens
refactor: simplify prompt generation flow
```

## Current Scope and Future Improvements

The current project is intentionally lightweight. Possible next steps include:

- Replace JSON persistence with PostgreSQL or SQLite
- Add rate limiting for prompt generation
- Add stronger request validation
- Move frontend JavaScript into separate modules
- Add automated tests for authentication and prompt routes
- Add production deployment configuration
- Add streaming AI responses for a faster generation experience

## License

This project is licensed under the MIT License. See `LICENSE` for details.
