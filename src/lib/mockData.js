export const defaultVoiceGuide = {
  brandName: "The Ikigai Project",
  reallySelling: "The ease of starting and growing a business. Economic empowerment for the next generation. A dedicated partner that handles the technical side so founders can be fully themselves.",
  delivers: "Business growth and infrastructure systems for small to medium business owners.",
  notSelling: "Not hustle culture. No results-guarantee hype. Not an AI bubble company. Not empty inspiration with no operational follow-through.",
  clientFeeling: "Informed. Safe. Seen. Clear-headed. Relieved. Inspired — and grounded.",
  positioning: "Helping ambitious emerging businesses grow and scale by bringing them to the standard of the modern era — without losing themselves in the process.",
  differentiator: "Most agencies sell a service. We operate as a dedicated business partner — combining consultancy, technical management, marketing systems, and an extensive professional network into one integrated entity.",
  audience: "Up-and-coming professionals and early-stage business owners who are talented, motivated, and stalled — not by lack of ability, but by the technical proficiency divide.",
  audienceCares: "Competency, credibility, sincerity, and trust earned through directness and follow-through.",
  notFor: "People not willing to commit to a process. People without genuine passion for what they're building. People comfortable staying employed who aren't serious about the shift.",
  toneSliders: { Direct:10, Professional:6, Personal:7, Warm:4, Educational:6, Philosophical:8, Inspirational:7, Salesy:3, Playful:6, Urgent:5 },
  soundLike: ["Knowledgeable", "Direct", "Confident", "Sharp", "Witty"],
  notSoundLike: ["A guru", "A hype machine", "A motivational poster", "A salesperson", "A life coach"],
  voiceRules: "Simplify what seems complex. Speak bitter truths calmly and confidently. Be sincere and charitable. Be cheeky and look smart — wit is welcome, arrogance is not.",
  pillar1: "We grow with you, not above you. Full partner, not a vendor dropping off work and disappearing.",
  pillar2: "Your talent is already monetizable — you just need the infrastructure. The gap is almost never talent.",
  pillar3: "Real access, real time. An actual professional network, live partner businesses, working systems.",
  pillar4: "One person handles everything for you. Dedicated account manager, no cracks to fall through.",
  contentBuckets: "1. Demystifying business infrastructure. 2. Talent-to-business pipeline. 3. Partner & client spotlights. 4. Sharp takes on industry noise. 5. Behind the process.",
  contentRule: "Say it directly, and say it calm. If it sounds like hype, rewrite it. If it sounds preachy, pull it back.",
  avoidWords: "hustle, grind, guarantee, 10x, skyrocket, AI-powered, vague inspiration, overly casual",
  reachWords: "clarity, alignment, infrastructure, partnership, intention, confidence, grounded, operational, real-time",
  bio: "The Ikigai Project is a human-first digital studio helping companies and individuals grow with intention, scale with confidence, and win financially without losing themselves.",
  softCTAs: "If you're thinking about making the move into business — start with a conversation. Send a message if you want a straight answer about where your business actually stands.",
  conversionCTAs: "Book a free strategy call. Explore our work. Learn more about how we work. Get a quote.",
};

export const mockPosts = [
  {
    id: "post-1",
    bucket: "Talent → Business",
    platform: "Instagram",
    caption: "Most people aren't underqualified. They're just understructured. There's a generation sitting on real, monetizable ability — one operational step away from turning it into a business. The gap is almost never talent. It's systems, positioning, and access.",
    pullQuote: "Most people aren't underqualified. They're just understructured.",
    scheduledDay: "Monday",
    scheduledTime: "10:00 AM",
    status: "pending",
  },
  {
    id: "post-2",
    bucket: "Real Access",
    platform: "LinkedIn",
    caption: "We're not theorizing. We're operating. Clients aren't buying a pitch deck — they're buying access to infrastructure that's already running. An actual professional network. Live partner businesses. Working systems.",
    pullQuote: "We're not theorizing. We're operating.",
    scheduledDay: "Wednesday",
    scheduledTime: "12:00 PM",
    status: "pending",
  },
  {
    id: "post-3",
    bucket: "Behind the Process",
    platform: "X",
    caption: "One point of contact. Full accountability. Every client gets a dedicated account manager — no chasing multiple contacts, no falling through the cracks. This is the part that actually changes the experience of working with an agency.",
    pullQuote: "One point of contact. Full accountability.",
    scheduledDay: "Friday",
    scheduledTime: "3:00 PM",
    status: "pending",
  },
];

export const BUCKET_GRADIENTS = {
  "Talent → Business": "bucket-talent",
  "Real Access": "bucket-access",
  "Behind the Process": "bucket-behind",
  "Infrastructure": "bucket-infra",
  "Industry Take": "bucket-industry",
};

export const PLATFORM_ICONS = {
  Instagram: "📸",
  LinkedIn: "💼",
  X: "✦",
};

export const GHL_PLACEHOLDER = {
  connected: false,
  locationId: "",
  apiKey: "",
  calendarId: "",
  note: "GoHighLevel integration — wire up after backend handoff. Use GHL API to push approved posts to GHL social planner with scheduledDay + scheduledTime.",
};
