export async function generatePosts({ voiceGuide, weeklyUpdate, platforms, assets, count = 4 }) {
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
      max_tokens: 2500,
      system: buildSystemPrompt(voiceGuide, assets),
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

export async function regeneratePost({ voiceGuide, existingPost, platforms, assets }) {
  const posts = await generatePosts({
    voiceGuide,
    assets,
    platforms: platforms || [existingPost.platform],
    weeklyUpdate: `Generate a fresh angle on this bucket: "${existingPost.bucket}". The previous post was: "${existingPost.caption}". Try a completely different hook and angle.`,
    count: 1,
  });
  return { ...posts[0], id: existingPost.id, scheduledDay: existingPost.scheduledDay, scheduledTime: existingPost.scheduledTime };
}

// ── Website scraper → voice guide pre-fill ──────────────────────────────────
export async function scrapeAndFillVoiceGuide(url) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("VITE_ANTHROPIC_API_KEY is not set in your .env file.");

  // Use Jina Reader to convert website to clean markdown (browser-safe, no CORS)
  const pagesToScrape = [
    url,
    url.replace(/\/$/, "") + "/about",
    url.replace(/\/$/, "") + "/services",
  ];

  const scraped = await Promise.allSettled(
    pagesToScrape.map(async (pageUrl) => {
      const res = await fetch(`https://r.jina.ai/${pageUrl}`, {
        headers: { Accept: "text/markdown" },
      });
      if (!res.ok) return null;
      const text = await res.text();
      return text.slice(0, 4000); // cap per page to manage token budget
    })
  );

  const content = scraped
    .map((r, i) => r.status === "fulfilled" && r.value ? `## ${pagesToScrape[i]}\n${r.value}` : null)
    .filter(Boolean)
    .join("\n\n---\n\n");

  if (!content.trim()) throw new Error("Could not read any content from that URL. Try another page.");

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
      max_tokens: 3000,
      system: `You are a brand strategist reading a business website to extract brand voice and messaging information.
Be direct and extract only what is clearly supported by the content.
For tone sliders, use numeric values 0-10.
Always respond with ONLY valid JSON — no preamble, no markdown fences.`,
      messages: [{
        role: "user",
        content: `Read the following website content and fill in this brand voice guide as completely as possible.

WEBSITE CONTENT:
${content}

Return a JSON object with exactly these fields. For each field also include a confidence: "high" | "inferred" | "missing".

{
  "brandName": { "value": "...", "confidence": "high|inferred|missing" },
  "reallySelling": { "value": "...", "confidence": "..." },
  "delivers": { "value": "...", "confidence": "..." },
  "notSelling": { "value": "...", "confidence": "..." },
  "clientFeeling": { "value": "...", "confidence": "..." },
  "positioning": { "value": "...", "confidence": "..." },
  "differentiator": { "value": "...", "confidence": "..." },
  "audience": { "value": "...", "confidence": "..." },
  "audienceCares": { "value": "...", "confidence": "..." },
  "notFor": { "value": "...", "confidence": "..." },
  "toneSliders": { "value": { "Direct": 0, "Professional": 0, "Personal": 0, "Warm": 0, "Educational": 0, "Philosophical": 0, "Inspirational": 0, "Salesy": 0, "Playful": 0, "Urgent": 0 }, "confidence": "..." },
  "soundLike": { "value": [], "confidence": "..." },
  "notSoundLike": { "value": [], "confidence": "..." },
  "voiceRules": { "value": "...", "confidence": "..." },
  "pillar1": { "value": "...", "confidence": "..." },
  "pillar2": { "value": "...", "confidence": "..." },
  "pillar3": { "value": "...", "confidence": "..." },
  "pillar4": { "value": "...", "confidence": "..." },
  "contentBuckets": { "value": "...", "confidence": "..." },
  "contentRule": { "value": "...", "confidence": "..." },
  "avoidWords": { "value": "...", "confidence": "..." },
  "reachWords": { "value": "...", "confidence": "..." },
  "bio": { "value": "...", "confidence": "..." },
  "softCTAs": { "value": "...", "confidence": "..." },
  "conversionCTAs": { "value": "...", "confidence": "..." }
}`,
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned); // { fieldName: { value, confidence } }
}

// ── Prompt builders ──────────────────────────────────────────────────────────
function buildSystemPrompt(vg, assets) {
  const assetManifest = assets && assets.length
    ? `\nASSET LIBRARY (reference these when writing visual briefs):\n${assets.map(a => `- [${a.type.toUpperCase()}] "${a.label}"${a.usageNote ? ` — ${a.usageNote}` : ""}`).join("\n")}`
    : "";

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
Sound like: ${vg.soundLike?.join(", ")}
Never sound like: ${vg.notSoundLike?.join(", ")}

MESSAGING PILLARS:
1. ${vg.pillar1}
2. ${vg.pillar2}
3. ${vg.pillar3}
4. ${vg.pillar4}

CONTENT RULE: ${vg.contentRule}
AVOID WORDS: ${vg.avoidWords}
PREFERRED WORDS: ${vg.reachWords}
${assetManifest}

Always respond with ONLY valid JSON — no preamble, no markdown fences.`;
}

function buildUserPrompt(weeklyUpdate, platforms, count) {
  const platformList = platforms?.length ? platforms.join(" | ") : "Instagram | LinkedIn | X";
  const platformNote = platforms?.length === 1
    ? `All posts must be for ${platforms[0]}.`
    : `Distribute posts across: ${platformList}. Use each at least once if possible.`;

  return `Generate ${count} social media post${count > 1 ? "s" : ""} for this week.
${weeklyUpdate ? `Context: ${weeklyUpdate}` : ""}

${platformNote}

Return a JSON array of ${count} post objects. Each must have exactly these fields:
{
  "id": "unique string",
  "bucket": "one of: Talent → Business | Real Access | Behind the Process | Infrastructure | Industry Take",
  "platform": "one of: ${platformList}",
  "format": "one of: image | video | reel",
  "caption": "full post copy (2–4 sentences, on-brand, no hashtags)",
  "pullQuote": "short punchy pull quote (max 12 words)",
  "visualBrief": "1–2 sentence description for the visual/video generator — include which brand assets to reference if relevant",
  "scheduledDay": "one of: Monday | Wednesday | Thursday | Friday",
  "scheduledTime": "e.g. 10:00 AM",
  "status": "pending"
}`;
}

// ── GHL Integration placeholder ──────────────────────────────────────────────
// Wire up after backend handoff:
// POST https://services.leadconnectorhq.com/social-media-posting/...
// Headers: Authorization: Bearer {GHL_ACCESS_TOKEN}
// Body: { locationId, caption, platforms, scheduledAt, mediaUrls }
export const GHL_INTEGRATION = {
  pushToGHL: async (post, ghlConfig) => {
    console.log("[GHL] Placeholder — post to be scheduled:", post, ghlConfig);
    throw new Error("GHL integration not yet configured. Add locationId and API key in Settings.");
  },
};
