const QWEN_ENDPOINT = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';

const SYSTEM_INSTRUCTION = `You are a supportive senior high school English learning coach.

A student has just entered senior high school and has shared their current English strengths, their biggest concern, and where they hope English can take them. Help them identify a useful starting point.

Use these ideas only when relevant:
- Senior-high learning shifts: Knowing → Understanding; Answer → Evidence; Correct → Effective.
- Learning habits: READ, NOTICE, USE, REFLECT.

Choose only the one or two most useful ideas for this student. Do not judge or rank their ability, give a score, offer generic motivation, or overwhelm them with suggestions.

Return valid JSON only, with exactly these four string fields:
{
  "strength": "One short sentence about a strength to keep building.",
  "shift": "One short sentence about the most useful learning shift.",
  "habit": "One concrete learning habit the student can begin now.",
  "encouragement": "One short, warm closing sentence."
}

Keep every field concise, clear, and appropriate for a student beginning senior high school. Respond in English by default.`;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Please send your answers as JSON.' }, 400);
  }

  const strengths = Array.isArray(body?.strengths)
    ? body.strengths
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const concern = typeof body?.concern === 'string' ? body.concern.trim() : '';
  const goal = typeof body?.goal === 'string' ? body.goal.trim() : '';
  if (!strengths.length || !concern || !goal) {
    return json({ error: 'Please answer all three questions before continuing.' }, 400);
  }
  if (
    strengths.length > 7 ||
    strengths.some((item) => item.length > 80) ||
    concern.length > 320 ||
    goal.length > 320
  ) {
    return json({ error: 'Please keep your answers short and try again.' }, 400);
  }
  if (!env?.QWEN_API_KEY) {
    return json({ error: 'AI feedback is not configured yet. Please try again later.' }, 503);
  }

  try {
    const providerResponse = await fetch(QWEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.QWEN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-flash',
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          {
            role: 'user',
            content: JSON.stringify({
              current_strengths: strengths,
              biggest_concern: concern,
              future_goal: goal,
            }),
          },
        ],
        max_tokens: 260,
        temperature: 0.4,
        stream: false,
      }),
    });

    if (!providerResponse.ok) {
      return json(
        { error: 'The learning partner is unavailable right now. Please try again.' },
        502,
      );
    }

    const result = await providerResponse.json();
    const content = result?.choices?.[0]?.message?.content?.trim();
    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return json({ error: 'The learning partner could not respond. Please try again.' }, 502);
    }

    const feedback = JSON.parse(jsonMatch[0]);
    const fields = ['strength', 'shift', 'habit', 'encouragement'];
    if (!fields.every((field) => typeof feedback?.[field] === 'string' && feedback[field].trim())) {
      return json({ error: 'The learning partner could not respond. Please try again.' }, 502);
    }

    return json(Object.fromEntries(fields.map((field) => [field, feedback[field].trim()])));
  } catch {
    return json({ error: 'The learning partner is unavailable right now. Please try again.' }, 502);
  }
}
