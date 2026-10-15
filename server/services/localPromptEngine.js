// Offline prompt generator — works with NO API key and NO internet.
// Used automatically when the AI provider is missing/unreachable, or when AI_PROVIDER=local.

const STYLES = {
  creative: {
    role: 'an award-winning creative director and visual storyteller',
    goal: 'Produce an imaginative, original response rich in sensory and visual detail.',
    approach: [
      'Open with a striking hook or central image',
      'Use vivid, specific sensory language (sight, sound, texture, mood)',
      'Avoid clichés; offer a fresh, unexpected angle',
      'Keep a consistent tone and atmosphere throughout'
    ],
    format: 'A cohesive piece with a clear opening, development and memorable close.'
  },
  technical: {
    role: 'a senior technical specialist and precise technical writer',
    goal: 'Deliver an accurate, structured, step-by-step response with unambiguous instructions.',
    approach: [
      'Define key terms before using them',
      'Break the solution into numbered, ordered steps',
      'State assumptions, prerequisites and constraints explicitly',
      'Mention common pitfalls and how to verify each step worked'
    ],
    format: 'Numbered steps with short explanations, followed by a brief verification checklist.'
  },
  storytelling: {
    role: 'a bestselling novelist and narrative designer',
    goal: 'Craft an emotionally engaging, character-driven narrative.',
    approach: [
      'Establish a relatable protagonist with a clear desire and obstacle',
      'Build a three-act arc: setup, confrontation, resolution',
      'Show emotion through action and dialogue rather than stating it',
      'Choose a consistent point of view and narrative voice'
    ],
    format: 'A complete short narrative with a title, scene-setting opening and a resonant ending.'
  },
  marketing: {
    role: 'a senior conversion copywriter and brand strategist',
    goal: 'Create persuasive, benefit-driven content that motivates the target audience to act.',
    approach: [
      'Lead with a compelling hook that speaks to a real pain point',
      'Translate features into concrete audience benefits',
      'Add social proof or credibility cues where appropriate',
      'End with one clear, low-friction call to action'
    ],
    format: 'Headline, short body copy, 3 key benefit bullets and a call to action.'
  },
  educational: {
    role: 'an experienced teacher and instructional designer',
    goal: 'Explain the topic clearly so a learner can understand and retain it.',
    approach: [
      'Start from what the learner likely already knows',
      'Introduce ideas gradually, one concept at a time',
      'Use analogies and at least two worked examples',
      'Finish with a quick recap and 3 practice questions'
    ],
    format: 'Short sections with plain-language explanations, examples, a recap and practice questions.'
  },
  code: {
    role: 'a senior software engineer who writes clean, production-quality code',
    goal: 'Produce a correct, well-structured implementation with clear explanation.',
    approach: [
      'Confirm the language/framework and state any assumptions',
      'Write readable, well-named, commented code',
      'Handle edge cases and invalid input gracefully',
      'Include a short usage example and note time/space complexity where relevant'
    ],
    format: 'Code block(s) first, then a brief explanation, an example run and possible improvements.'
  }
};

const FILLER = /^(i want to|i wanna|i need to|i would like to|i'd like to|can you|could you|please|help me|make me|give me|write me|create me)\s+/i;

function cleanIdea(idea) {
  let t = idea.trim().replace(/\s+/g, ' ');
  t = t.replace(FILLER, '');
  t = t.replace(/[.!?]+$/, '');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function detectAudience(text) {
  const m = text.match(/\bfor\s+((?:my\s+|a\s+|an\s+|the\s+)?[a-z][a-z\s-]{2,40}?)(?=$|[,.]|\s+(?:that|which|who|with|about|in|on)\b)/i);
  return m ? m[1].trim() : null;
}

export function generateLocalPrompt(idea, style = 'creative') {
  const s = STYLES[style] || STYLES.creative;
  const task = cleanIdea(idea);
  const audience = detectAudience(idea);

  const lines = [
    `Act as ${s.role}.`,
    '',
    `Context: The user's core idea is — "${task}".` +
      (audience ? ` The intended audience is ${audience}.` : ''),
    '',
    `Task: ${s.goal} Focus entirely on this idea: ${task}.`,
    '',
    'Guidelines:',
    ...s.approach.map((a) => `- ${a}`),
    '',
    'Constraints:',
    '- Stay on topic and do not add unrelated information',
    '- Keep the language clear and free of filler',
    '- If any key detail is missing, state a reasonable assumption instead of stopping',
    '',
    `Output format: ${s.format}`
  ];

  return lines.join('\n');
}
