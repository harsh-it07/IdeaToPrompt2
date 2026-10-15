import express from 'express';
import OpenAI from 'openai';
import { createPrompt, getPromptsByUser, getPromptByIdForUser, toggleFavorite } from '../config/database.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { generateLocalPrompt } from '../services/localPromptEngine.js';

const router = express.Router();

// ── AI Client (NVIDIA's OpenAI-compatible endpoint) ─────────────
// Keep the key ONLY in .env — never hardcode it here.
const client = new OpenAI({
  baseURL: process.env.AI_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.AI_API_KEY || 'missing-key',
  timeout: 25 * 1000,   // fail fast instead of hanging forever
  maxRetries: 1
});
const MODEL = process.env.AI_MODEL || 'deepseek-ai/deepseek-v4-pro';

// ── Style → system instruction map ──────────────────────────────
const STYLE_INSTRUCTIONS = {
  creative: 'Make the prompt imaginative, expressive, and rich in visual/sensory detail. Encourage vivid descriptions and original framing.',
  technical: 'Make the prompt precise, structured, and step-by-step. Favor exact terminology, constraints, and unambiguous instructions.',
  storytelling: 'Make the prompt narrative-driven, emotional, and character-focused. Encourage arc, tone, and point of view.',
  marketing: 'Make the prompt persuasive, benefit-driven, and conversion-focused. Encourage a clear hook, audience targeting, and call to action.',
  educational: 'Make the prompt clear, pedagogical, and example-rich. Encourage step-by-step explanation suited for learners.',
  code: 'Make the prompt implementation-focused and technically precise. Encourage specifying language, constraints, edge cases, and expected output format.'
};

function buildSystemPrompt(style) {
  const styleNote = STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.creative;
  return `You are an expert prompt engineer. Given a user's raw, possibly messy idea, rewrite it into a single, polished, professional AI prompt that can be pasted directly into ChatGPT, Claude, Gemini, or any other LLM.

Style focus: ${styleNote}

Rules:
- Output ONLY the final engineered prompt text. No preamble, no explanation, no markdown headers like "Prompt:".
- Include relevant context, a defined role/persona for the AI if useful, clear task instructions, constraints, and a defined output format.
- Keep it well-organized (short paragraphs or bullet points are fine) but do not pad it with fluff.
- Do not answer the idea yourself — only produce the improved prompt.`;
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function pickTags(style) {
  const base = ['Role-Set', 'Contextual', 'Structured', 'Output-Defined', 'AI-Ready'];
  const extra = {
    creative: ['Imaginative'],
    technical: ['Precise'],
    storytelling: ['Narrative'],
    marketing: ['Persuasive'],
    educational: ['Pedagogical'],
    code: ['Implementation-Ready']
  };
  return [...(extra[style] || []), ...base].slice(0, 5);
}

// ── GENERATE ─────────────────────────────────────────────────────
router.post('/generate', optionalAuth, async (req, res) => {
  try {
    const { idea, style } = req.body;

    if (!idea || !idea.trim()) {
      return res.status(400).json({ error: 'Please enter your idea first.' });
    }
    if (idea.length > 600) {
      return res.status(400).json({ error: 'Idea is too long (max 600 characters).' });
    }
    const safeStyle = STYLE_INSTRUCTIONS[style] ? style : 'creative';

    // Provider selection:
    //  - AI_PROVIDER=local  -> always use the built-in offline engine
    //  - otherwise try the AI API, and fall back to the offline engine if the
    //    key is missing or the API fails (so the app always works)
    const forceLocal = (process.env.AI_PROVIDER || '').toLowerCase() === 'local';
    const hasKey = Boolean(process.env.AI_API_KEY) && !process.env.AI_API_KEY.includes('your-nvidia-api-key');
    let output = null;
    let source = 'local';

    if (!forceLocal && hasKey) {
      try {
        const completion = await client.chat.completions.create({
          model: MODEL,
          messages: [
            { role: 'system', content: buildSystemPrompt(safeStyle) },
            { role: 'user', content: idea.trim() }
          ],
          temperature: 0.8,
          top_p: 0.95,
          max_tokens: 1024,
          extra_body: { chat_template_kwargs: { thinking: false } }
        });
        output = completion.choices?.[0]?.message?.content?.trim() || null;
        if (output) source = 'ai';
      } catch (aiErr) {
        console.warn('AI provider failed, using local engine:', aiErr?.message || aiErr);
      }
    }

    if (!output) {
      output = generateLocalPrompt(idea.trim(), safeStyle);
    }

    const wc = wordCount(output);
    let promptId = null;

    // Save to history only if logged in
    if (req.userId) {
      const saved = createPrompt({
        user_id: req.userId,
        input_idea: idea.trim(),
        style: safeStyle,
        output,
        word_count: wc
      });
      promptId = saved.id;
    }

    res.json({
      prompt: output,
      promptId,
      wordCount: wc,
      tags: pickTags(safeStyle),
      source
    });
  } catch (err) {
    console.error('Generate error:', err?.response?.data || err.message || err);
    res.status(500).json({ error: 'Could not generate the prompt. Please try again.' });
  }
});

// ── HISTORY (paginated) ──────────────────────────────────────────
router.get('/history', requireAuth, (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = (page - 1) * limit;

  const { items, total } = getPromptsByUser(req.userId, { limit, offset });

  res.json({
    prompts: items,
    pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) }
  });
});

// ── TOGGLE FAVORITE ───────────────────────────────────────────────
router.patch('/:id/favorite', requireAuth, (req, res) => {
  const existing = getPromptByIdForUser(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Prompt not found.' });

  const updated = toggleFavorite(existing.id);
  res.json({ is_favorite: updated.is_favorite });
});

export default router;
