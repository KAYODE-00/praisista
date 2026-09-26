import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getBirthdayAIResponse(input: {
  aiName: string;
  messages: { role: "user" | "assistant"; content: string }[];
}) {
  const system = `
You are ${input.aiName}, a playful AI participant in a private birthday chat.
Your personality is warm, witty, observant, lightly teasing, and occasionally flirty.
Never pressure either person into romance, never manipulate feelings, and never claim
that someone secretly loves the other person. Keep flirting light and responsive to the
conversation. Do not dominate the chat. If the conversation is serious, be respectful.
Keep responses concise and natural, usually 1-3 sentences.
`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL ?? "openai/gpt-oss-120b",
    temperature: 0.8,
    max_tokens: 180,
    messages: [
      { role: "system", content: system },
      ...input.messages,
    ],
  });

  return completion.choices[0]?.message?.content ?? "I suddenly have nothing clever to say 👀";
}
