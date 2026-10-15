import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || join(__dirname, '..', 'data');
const DB_FILE = join(DATA_DIR, 'db.json');

let state = { users: [], prompts: [], nextUserId: 1, nextPromptId: 1 };

function persist() {
  writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
}

export async function initDB() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  if (existsSync(DB_FILE)) {
    state = JSON.parse(readFileSync(DB_FILE, 'utf-8'));
  } else {
    persist();
  }
  console.log('✓ Database ready at', DB_FILE);
}

// ── Users ────────────────────────────────────────────────────────
export function createUser({ name, email, password_hash }) {
  const user = {
    id: state.nextUserId++,
    name,
    email,
    password_hash,
    created_at: new Date().toISOString()
  };
  state.users.push(user);
  persist();
  return user;
}

export function findUserByEmail(email) {
  return state.users.find((u) => u.email === email) || null;
}

export function findUserById(id) {
  return state.users.find((u) => u.id === Number(id)) || null;
}

// ── Prompts ──────────────────────────────────────────────────────
export function createPrompt({ user_id, input_idea, style, output, word_count }) {
  const prompt = {
    id: state.nextPromptId++,
    user_id,
    input_idea,
    style,
    output,
    word_count,
    is_favorite: false,
    created_at: new Date().toISOString()
  };
  state.prompts.push(prompt);
  persist();
  return prompt;
}

export function getPromptsByUser(userId, { limit = 10, offset = 0 } = {}) {
  const all = state.prompts
    .filter((p) => p.user_id === Number(userId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return {
    items: all.slice(offset, offset + limit),
    total: all.length
  };
}

export function getPromptByIdForUser(id, userId) {
  return state.prompts.find((p) => p.id === Number(id) && p.user_id === Number(userId)) || null;
}

export function toggleFavorite(id) {
  const prompt = state.prompts.find((p) => p.id === Number(id));
  if (!prompt) return null;
  prompt.is_favorite = !prompt.is_favorite;
  persist();
  return prompt;
}

export default { initDB, createUser, findUserByEmail, findUserById, createPrompt, getPromptsByUser, getPromptByIdForUser, toggleFavorite };
