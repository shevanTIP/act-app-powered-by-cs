export async function generatePosts({ voiceGuide, weeklyUpdate, platforms, count = 4 }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("VITE_ANTHROPIC_API_KEY is not set in your .env file.");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: buildSystemPrompt(voiceGuide),
      messages: [{ role: "user", content: buildUserPrompt(weeklyUpdate, platforms, count) }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export async function regeneratePost({ voiceGuide, existingPost, platforms }) {
  const posts = await generatePosts({
    voiceGuide,
    platforms: platforms || [existingPost.platform],
    weeklyUpdate: `Generate a fresh angle on this bucket: "${existingPost.bucket}". The previous post was: "${existingPost.caption}". Try a completely different hook and angle.`,
    count: 1,
  });
  return { ...posts[0], id: existingPost.id, scheduledDay: existingPost.scheduledDay, scheduledTime: existingPost.scheduledTime };
}

function buildSystemPrompt(vg) {
  return `You are a social media content writer for ${vg.brandName}.

BRAND IDENTITY:
- What we deliver: ${vg.delivers}
- What we're really selling: ${vg.reallySelling}
- What we are NOT: ${vg.notSelling}
- How clients should feel: ${vg.clientFeeling}

POSITIONING: ${vg.positioning}

AUDIENCE: ${vg.audience}
What they care about: ${vg.audienceCares}
NOT for: ${vg.notFor}

VOICE RULES: ${vg.voiceRules}
Sound like: ${vg.soundLike?.join(', ')}
Never sound like: ${vg.notSoundLike?.join(', ')}

MESSAGING PILLARS:
1. ${vg.pillar1}
2. ${vg.pillar2}
3. ${vg.pillar3}
4. ${vg.pillar4}

CONTENT RULE: ${vg.contentRule}
AVOID WORDS: ${vg.avoidWords}
PREFERRED WORDS: ${vg.reachWords}

Always respond with ONLY valid JSON — no preamble, no markdown fences.`;
}

function buildUserPrompt(weeklyUpdate, platforms, count) {
  const platformList = (platforms && platforms.length)
    ? platforms.join(" | ")
    : "Instagram | LinkedIn | X";

  const platformNote = platforms && platforms.length === 1
    ? `All posts must be for ${platforms[0]}.`
    : `Distribute the posts across these platforms (use each at least once if possible): ${platformList}.`;

  return `Generate ${count} social media post${count > 1 ? 's' : ''} for this week.
${weeklyUpdate ? `Context: ${weeklyUpdate}` : ''}

${platformNote}

Return a JSON array of ${count} post object${count > 1 ? 's' : ''}. Each object must have exactly these fields:
{
  "id": "unique string like post-uuid",
  "bucket": "one of: Talent → Business | Real Access | Behind the Process | Infrastructure | Industry Take",
  "platform": "one of: ${platformList}",
  "caption": "the full post copy (2–4 sentences, on-brand voice, no hashtags)",
  "pullQuote": "a short punchy pull quote from the caption (max 12 words)",
  "scheduledDay": "one of: Monday | Wednesday | Thursday | Friday",
  "scheduledTime": "e.g. 10:00 AM",
  "status": "pending"
}`;
}

// GHL Integration placeholder — wire up after backend handoff
export const GHL_INTEGRATION = {
  pushToGHL: async (post, ghlConfig) => {
    console.log("[GHL] Placeholder — post to be scheduled:", post, ghlConfig);
    throw new Error("GHL integration not yet configured. Add locationId and API key in Settings.");
  },
};
