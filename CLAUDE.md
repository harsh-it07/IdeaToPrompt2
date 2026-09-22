# CLAUDE.md — IdeaToPrompt Development Guide

## Project Overview

IdeaToPrompt is a full-stack AI prompt engineering application. It accepts a user's rough idea, applies a selected prompt style, sends the request through an Express.js backend to an OpenAI-compatible NVIDIA NIM endpoint, and returns a structured prompt. Authenticated users can save prompts to history and mark them as favorites.

## Repository Structure

- `client/` — static frontend, styling, UI behavior, and hero video
- `server/index.js` — Express application entry point
- `server/routes/` — authentication and prompt API routes
- `server/middleware/auth.js` — JWT authentication helpers
- `server/config/database.js` — JSON persistence/data access
- `server/data/db.json` — local application data
- `server/.env.example` — environment configuration template

## Tech Stack

- Node.js + Express.js
- Vanilla HTML/CSS/JavaScript
- OpenAI Node SDK against NVIDIA NIM
- bcryptjs for password hashing
- JSON Web Tokens for authentication
- JSON file persistence for local development

## Important Rules

1. Never expose `AI_API_KEY` or `JWT_SECRET` in frontend code.
2. Never commit `.env` or other secret files.
3. Preserve the existing API response shapes unless the change explicitly requires an API contract update.
4. Keep authenticated prompt history scoped to the authenticated user's ID.
5. Validate user input at API boundaries.
6. Prefer minimal, focused changes over unnecessary rewrites.
7. Preserve the existing visual language and responsive behavior unless a UI redesign is explicitly requested.
8. Use ES modules in the backend.
9. Use meaningful names and small focused functions.
10. Do not add dependencies unless there is a clear reason.

## Frontend Conventions

- The frontend currently lives in `client/index.html` and `client/style.css`.
- Use the existing Fetch API helper for backend calls.
- Preserve the existing auth-token flow unless it is being deliberately redesigned.
- Escape user-provided content before inserting it into HTML.
- Keep keyboard accessibility and semantic HTML in mind when modifying UI components.

## Backend Conventions

- Add authentication routes to `server/routes/auth.routes.js`.
- Add prompt-related routes to `server/routes/prompt.routes.js`.
- Put reusable authentication logic in `server/middleware/auth.js`.
- Put persistence operations in `server/config/database.js`.
- Keep provider credentials in environment variables.
- Return useful HTTP status codes and JSON error messages.

## AI Prompt Generation

Prompt generation is style-aware. Supported styles are:

- `creative`
- `technical`
- `storytelling`
- `marketing`
- `educational`
- `code`

The generation endpoint should return the engineered prompt, prompt ID when available, word count, and tags.

## Git Conventions

Use Conventional Commits:

- `feat:` new functionality
- `fix:` bug fixes
- `docs:` documentation
- `style:` formatting/UI-only changes
- `refactor:` code restructuring without behavior change
- `chore:` tooling/configuration

Examples:

```text
docs: improve setup instructions
feat: add prompt favorite endpoint
fix: handle invalid JWT tokens
chore: update environment template
```

## Validation Before Finishing a Change

When practical:

1. Run `npm install` after dependency changes.
2. Run `npm start` or `npm run dev` and verify the server starts.
3. Check `GET /api/health`.
4. Test the changed frontend or API flow.
5. Review `git diff` before committing.
6. Do not commit secrets, `node_modules`, or generated local credentials.
