import OpenAI from 'openai';

let openai: OpenAI | null = null;

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
  const prompt = `Analyze this Reddit post and extract the user's pain point, intent level, and category.

Respond with JSON only (no other text):
{
  "pain_summary": "concise problem description (max 20 words)",
  "intent_level": "high|medium|low",
  "category": "one word category like: sales, marketing, dev, ops, finance, etc."
}

Post: ${postText}`;

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

  const content = response.choices[0]?.message?.content || '{}';

  try {
    return JSON.parse(content) as PainSummary;
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
  const prompt = `Generate 3 helpful, non-promotional reply drafts for this Reddit post.

Requirements:
- Helpful and conversational tone
- No promotion or selling
- Under 80 words each
- Ask clarifying questions to understand their needs better

Pain summary: ${painSummary}

Post: ${postText}

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

  const content = response.choices[0]?.message?.content || '[]';

  try {
    return JSON.parse(content) as ReplyDraft[];
  } catch {
    return [
      { reply: 'Thanks for sharing! Happy to help if you need more details.', tone: 'helpful' },
      { reply: 'This is a common challenge. What specifically are you looking for?', tone: 'curious' },
      { reply: 'I dealt with this too. Let me know if you want to chat.', tone: 'empathetic' },
    ];
  }
}
