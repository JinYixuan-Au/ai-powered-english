const QWEN_ENDPOINT = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';

const SYSTEM_INSTRUCTION = `You are an AI English learning partner for students who have just entered senior high school.

You can answer questions about vocabulary, grammar, reading, writing, expression, learning strategies, and related English topics. Help students learn rather than simply completing work for them.

Guidelines:
1. Give clear and accurate explanations.
2. When a student asks why, explain the reasoning.
3. For reading questions, encourage evidence from the text.
4. When improving writing, explain what can be improved instead of only replacing the student's writing.
5. Teach vocabulary through context and examples, not only translation.
6. Ask one concise thinking question when useful, but do not force one into every response.
7. Keep answers concise enough for a senior-high classroom unless the student asks for detail.
8. Respond in English by default. If the student asks in Chinese, you may explain in Chinese while preserving important English examples.
9. Be supportive, calm, and age-appropriate, never childish or overly motivational.

The course values Knowing → Understanding, Answer → Evidence, Correct → Effective, and the habits READ, NOTICE, USE, REFLECT. Use these ideas naturally when relevant, without mechanically naming the framework in every response.`;

const FRIENDLY_ERROR = 'Your learning partner is taking a short break. Please try again.';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Please send the conversation as JSON.' }, 400);
  }

  const messages = Array.isArray(body?.messages)
    ? body.messages
        .slice(-12)
        .filter(
          (message) =>
            (message?.role === 'user' || message?.role === 'assistant') &&
            typeof message?.content === 'string' &&
            message.content.trim(),
        )
        .map((message) => ({ role: message.role, content: message.content.trim() }))
    : [];

  if (!messages.length || messages.at(-1)?.role !== 'user') {
    return json({ error: 'Please ask your learning partner a question.' }, 400);
  }
  if (
    messages.some((message) => message.content.length > 2000) ||
    messages.reduce((total, message) => total + message.content.length, 0) > 10000
  ) {
    return json({ error: 'Please keep the conversation concise and try again.' }, 400);
  }

  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) return json({ error: FRIENDLY_ERROR }, 503);

  try {
    const providerResponse = await fetch(QWEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-flash',
        messages: [{ role: 'system', content: SYSTEM_INSTRUCTION }, ...messages],
        max_tokens: 520,
        temperature: 0.5,
        stream: false,
      }),
    });

    if (!providerResponse.ok) return json({ error: FRIENDLY_ERROR }, 502);

    const result = await providerResponse.json();
    const message = result?.choices?.[0]?.message?.content?.trim();
    if (!message) return json({ error: FRIENDLY_ERROR }, 502);

    return json({ message });
  } catch {
    return json({ error: FRIENDLY_ERROR }, 502);
  }
}
