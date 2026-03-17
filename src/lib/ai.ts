import OpenAI from 'openai';

let openai: OpenAI | null = null;

const MAX_INPUT_LENGTH = 4000; // Limit input to prevent abuse

function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters and truncate
  return input
    .slice(0, MAX_INPUT_LENGTH)
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/```/g, '') // Remove code block markers that could break JSON
    .trim();
}

function extractJSON(text: string): string {
  // Try to extract JSON from response (handle cases where model adds extra text)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }
  return text;
}

function validatePainSummary(data: unknown): PainSummary {
  const valid = data as PainSummary;
  return {
    pain_summary: typeof valid.pain_summary === 'string' ? valid.pain_summary.slice(0, 100) : 'Unable to analyze',
    intent_level: ['high', 'medium', 'low'].includes(valid.intent_level || '') ? valid.intent_level : 'low',
    category: typeof valid.category === 'string' ? valid.category.slice(0, 50) : 'general',
  };
}

function validateReplyDrafts(data: unknown): ReplyDraft[] {
  if (!Array.isArray(data)) {
    return getDefaultDrafts();
  }
  return data
    .slice(0, 3)
    .map((d: unknown) => {
      const draft = d as ReplyDraft;
      return {
        reply: typeof draft.reply === 'string' ? draft.reply.slice(0, 200) : 'Thanks for sharing!',
        tone: ['curious', 'empathetic', 'helpful'].includes(draft.tone || '') ? draft.tone : 'helpful',
      };
    });
}

function getDefaultDrafts(): ReplyDraft[] {
  return [
    { reply: 'Thanks for sharing! Happy to help if you need more details.', tone: 'helpful' },
    { reply: 'This is a common challenge. What specifically are you looking for?', tone: 'curious' },
    { reply: 'I dealt with this too. Let me know if you want to chat.', tone: 'empathetic' },
  ];
}

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }
  return openai;
}

export interface PainSummary {
  pain_summary: string;
  intent_level: string;
  category: string;
}

export async function generatePainSummary(postText: string): Promise<PainSummary> {
  const client = getOpenAI();
  const sanitizedText = sanitizeInput(postText);
  
  const prompt = `Analyze this Reddit post and extract the user's pain point, intent level, and category.

Respond with JSON only (no other text):
{
  "pain_summary": "concise problem description (max 20 words)",
  "intent_level": "high|medium|low",
  "category": "one word category like: sales, marketing, dev, ops, finance, etc."
}

Post: ${sanitizedText}`;

  const response = await client.chat.completions.create({
    model: "openrouter/free",
    messages: [
      {
        role: "system",
        content: "You are an expert at analyzing buyer intent. Extract pain points concisely.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = extractJSON(response.choices[0]?.message?.content || '{}');

  try {
    const parsed = JSON.parse(content);
    return validatePainSummary(parsed);
  } catch {
    return {
      pain_summary: 'Unable to analyze',
      intent_level: 'low',
      category: 'general',
    };
  }
}

export interface ReplyDraft {
  reply: string;
  tone: string;
}

export async function generateReplyDrafts(
  postText: string,
  painSummary: string
): Promise<ReplyDraft[]> {
  const client = getOpenAI();
  const sanitizedText = sanitizeInput(postText);
  const sanitizedSummary = sanitizeInput(painSummary);
  
  const prompt = `Generate 3 helpful, non-promotional reply drafts for this Reddit post.

Requirements:
- Helpful and conversational tone
- No promotion or selling
- Under 80 words each
- Ask clarifying questions to understand their needs better

Pain summary: ${sanitizedSummary}

Post: ${sanitizedText}

Respond with JSON array only:
[
  {"reply": "draft 1", "tone": "curious"},
  {"reply": "draft 2", "tone": "empathetic"},
  {"reply": "draft 3", "tone": "helpful"}
]`;

  const response = await client.chat.completions.create({
    model: "openrouter/free",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that writes natural Reddit replies.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = extractJSON(response.choices[0]?.message?.content || '[]');

  try {
    const parsed = JSON.parse(content);
    return validateReplyDrafts(parsed);
  } catch {
    return getDefaultDrafts();
  }
}
