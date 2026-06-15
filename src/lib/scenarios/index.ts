// src/lib/scenarios/index.ts
// Conversation scenarios for each level

import type { Scenario } from '@/types';

export const SCENARIOS: Scenario[] = [
  // ─── BEGINNER ─────────────────────────────────────────────────────────────
  {
    id: 'beg-01',
    level: 'beginner',
    title: 'Ordering Food at a Restaurant',
    description: 'Practice ordering your favorite meal at a casual restaurant.',
    context: 'You are at a local restaurant. The waiter will take your order.',
    xpReward: 50,
    durationMinutes: 10,
    turns: [
      {
        id: 't1',
        speaker: 'ai',
        text: "Hello! Welcome to Sunrise Café. My name is Alex, and I'll be your server today. Are you ready to order?",
      },
      {
        id: 't2',
        speaker: 'user',
        text: '',
        hint: 'Say: "Yes, I am ready!" or "Can I see the menu, please?"',
        expectedKeywords: ['ready', 'menu', 'order', 'yes'],
      },
      {
        id: 't3',
        speaker: 'ai',
        text: "Great! We have a wonderful special today — grilled chicken with rice and vegetables. We also have pasta, sandwiches, and our famous burgers. What would you like?",
      },
      {
        id: 't4',
        speaker: 'user',
        text: '',
        hint: 'Say what you want to eat. Example: "I would like the grilled chicken, please."',
        expectedKeywords: ['like', 'want', 'order', 'please', 'chicken', 'pasta', 'burger'],
      },
      {
        id: 't5',
        speaker: 'ai',
        text: "Excellent choice! Would you like something to drink? We have water, juice, coffee, and soda.",
      },
      {
        id: 't6',
        speaker: 'user',
        text: '',
        hint: 'Ask for a drink. Example: "I will have an orange juice, please."',
        expectedKeywords: ['water', 'juice', 'coffee', 'soda', 'drink', 'have'],
      },
      {
        id: 't7',
        speaker: 'ai',
        text: "Perfect! So that's one grilled chicken and a drink. Is there anything else I can get for you?",
      },
      {
        id: 't8',
        speaker: 'user',
        text: '',
        hint: 'Say "No, that\'s all, thank you!" or ask for something extra.',
        expectedKeywords: ['no', 'all', 'thank', 'that', 'fine', 'nothing'],
      },
      {
        id: 't9',
        speaker: 'ai',
        text: "Wonderful! Your order will be ready in about 15 minutes. Enjoy your meal!",
      },
    ],
  },
  {
    id: 'beg-02',
    level: 'beginner',
    title: 'Introducing Yourself',
    description: 'Make a great first impression by introducing yourself clearly.',
    context: 'You are at a new school/workplace and meeting someone for the first time.',
    xpReward: 50,
    durationMinutes: 10,
    turns: [
      {
        id: 't1',
        speaker: 'ai',
        text: "Hi there! I don't think we've met before. I'm Sarah. Nice to meet you!",
      },
      {
        id: 't2',
        speaker: 'user',
        text: '',
        hint: 'Introduce yourself: "Hi Sarah! I\'m [your name]. Nice to meet you too!"',
        expectedKeywords: ['hi', 'hello', 'name', 'nice', 'meet', 'i\'m'],
      },
      {
        id: 't3',
        speaker: 'ai',
        text: "Great to meet you! So, where are you from originally?",
      },
      {
        id: 't4',
        speaker: 'user',
        text: '',
        hint: 'Say where you are from. Example: "I\'m from Jakarta, Indonesia."',
        expectedKeywords: ['from', 'live', 'city', 'country', 'born', 'jakarta', 'indonesia'],
      },
      {
        id: 't5',
        speaker: 'ai',
        text: "Oh wow, that's amazing! What do you do for work or study?",
      },
      {
        id: 't6',
        speaker: 'user',
        text: '',
        hint: 'Talk about your job or studies. Example: "I\'m a student" or "I work as a teacher."',
        expectedKeywords: ['student', 'work', 'study', 'job', 'teacher', 'engineer', 'manager'],
      },
      {
        id: 't7',
        speaker: 'ai',
        text: "That's really interesting! What do you like to do in your free time?",
      },
      {
        id: 't8',
        speaker: 'user',
        text: '',
        hint: 'Share a hobby. Example: "I enjoy reading books and watching movies."',
        expectedKeywords: ['like', 'enjoy', 'love', 'hobby', 'music', 'sports', 'reading', 'watching'],
      },
      {
        id: 't9',
        speaker: 'ai',
        text: "That sounds so fun! I hope we can chat more. It was really lovely meeting you!",
      },
    ],
  },

  // ─── INTERMEDIATE ──────────────────────────────────────────────────────────
  {
    id: 'int-01',
    level: 'intermediate',
    title: 'Job Interview Preparation',
    description: 'Practice answering common interview questions with confidence.',
    context: 'You are being interviewed for a mid-level position at a tech company.',
    xpReward: 80,
    durationMinutes: 10,
    turns: [
      {
        id: 't1',
        speaker: 'ai',
        text: "Good morning! Please have a seat. I'm the hiring manager, David Chen. Thank you for coming in today. Could you start by telling me a little about yourself and your background?",
      },
      {
        id: 't2',
        speaker: 'user',
        text: '',
        hint: 'Give a professional self-introduction covering your experience, skills, and why you\'re here.',
        expectedKeywords: ['experience', 'background', 'skills', 'worked', 'years', 'passionate', 'team'],
      },
      {
        id: 't3',
        speaker: 'ai',
        text: "Impressive! Now, can you tell me about a challenging project you worked on and how you handled it?",
      },
      {
        id: 't4',
        speaker: 'user',
        text: '',
        hint: 'Use the STAR method: Situation, Task, Action, Result. Keep it clear and confident.',
        expectedKeywords: ['challenge', 'problem', 'solution', 'team', 'result', 'success', 'learned'],
      },
      {
        id: 't5',
        speaker: 'ai',
        text: "Great example! Where do you see yourself professionally in the next five years?",
      },
      {
        id: 't6',
        speaker: 'user',
        text: '',
        hint: 'Talk about your career goals while aligning them with what this company offers.',
        expectedKeywords: ['goal', 'grow', 'lead', 'develop', 'contribute', 'company', 'future', 'years'],
      },
      {
        id: 't7',
        speaker: 'ai',
        text: "That's a well-thought-out answer. Do you have any questions for us?",
      },
      {
        id: 't8',
        speaker: 'user',
        text: '',
        hint: 'Ask a smart question like: "What does success look like for this role in the first 90 days?"',
        expectedKeywords: ['question', 'role', 'team', 'culture', 'success', 'expect', 'opportunity'],
      },
    ],
  },
  {
    id: 'int-02',
    level: 'intermediate',
    title: 'Work Meeting — Project Update',
    description: 'Give a clear status update on your project to your manager.',
    context: 'You are in a weekly team meeting. Your manager asks for a project status update.',
    xpReward: 80,
    durationMinutes: 10,
    turns: [
      {
        id: 't1',
        speaker: 'ai',
        text: "Alright team, let's get started. Can you give us a quick update on where the project stands this week?",
      },
      {
        id: 't2',
        speaker: 'user',
        text: '',
        hint: 'Start with what has been completed. Example: "We\'ve completed the design phase and started development."',
        expectedKeywords: ['completed', 'finished', 'started', 'progress', 'phase', 'development', 'on track'],
      },
      {
        id: 't3',
        speaker: 'ai',
        text: "Good to hear. Are there any blockers or issues that the team should be aware of?",
      },
      {
        id: 't4',
        speaker: 'user',
        text: '',
        hint: 'Mention any risks or challenges honestly. Example: "We\'re facing a delay due to a dependency from the API team."',
        expectedKeywords: ['issue', 'blocker', 'delay', 'challenge', 'risk', 'dependency', 'waiting'],
      },
      {
        id: 't5',
        speaker: 'ai',
        text: "I see. What's your plan to resolve that?",
      },
      {
        id: 't6',
        speaker: 'user',
        text: '',
        hint: 'Propose a concrete action plan. Example: "I\'ll escalate to the API team and set a deadline for their response."',
        expectedKeywords: ['plan', 'resolve', 'escalate', 'contact', 'meeting', 'deadline', 'solution'],
      },
      {
        id: 't7',
        speaker: 'ai',
        text: "Perfect. When do you expect the project to be completed?",
      },
      {
        id: 't8',
        speaker: 'user',
        text: '',
        hint: 'Give a realistic timeline. Example: "We\'re on track to deliver by end of next week, assuming the blocker is resolved."',
        expectedKeywords: ['week', 'deadline', 'deliver', 'estimate', 'track', 'date', 'timeline'],
      },
    ],
  },

  // ─── ADVANCED ──────────────────────────────────────────────────────────────
  {
    id: 'adv-01',
    level: 'advanced',
    title: 'Business Negotiation',
    description: 'Negotiate contract terms with a high-stakes client.',
    context: 'You are a senior account manager negotiating a B2B software contract renewal.',
    xpReward: 120,
    durationMinutes: 10,
    turns: [
      {
        id: 't1',
        speaker: 'ai',
        text: "Thank you for meeting with us today. We've reviewed your proposal for contract renewal. While we value the partnership, I have to be honest — the pricing is significantly above what we budgeted for next year. We were hoping for something closer to a 15% reduction.",
      },
      {
        id: 't2',
        speaker: 'user',
        text: '',
        hint: 'Acknowledge their concern, then explain the value you provide before countering. Don\'t concede immediately.',
        expectedKeywords: ['understand', 'value', 'investment', 'ROI', 'results', 'appreciate', 'however', 'consider'],
      },
      {
        id: 't3',
        speaker: 'ai',
        text: "I appreciate that perspective, but our internal metrics show we could potentially achieve similar results with a lower-cost alternative. Why should we continue with you at this price point?",
      },
      {
        id: 't4',
        speaker: 'user',
        text: '',
        hint: 'Differentiate your solution. Mention specific features, support quality, or past results that competitors can\'t match.',
        expectedKeywords: ['differentiate', 'unique', 'support', 'data', 'integration', 'results', 'proven', 'unlike'],
      },
      {
        id: 't5',
        speaker: 'ai',
        text: "Those are fair points. What's the best you can do on pricing while maintaining that level of service?",
      },
      {
        id: 't6',
        speaker: 'user',
        text: '',
        hint: 'Offer a structured counter-proposal — perhaps a multi-year deal, volume discount, or bundled services.',
        expectedKeywords: ['offer', 'propose', 'discount', 'multi-year', 'bundle', 'flexible', 'terms', 'structure'],
      },
      {
        id: 't7',
        speaker: 'ai',
        text: "A two-year commitment with a 7% reduction is interesting. Can you also guarantee the same dedicated support team we have now?",
      },
      {
        id: 't8',
        speaker: 'user',
        text: '',
        hint: 'Close the deal confidently. Confirm what you can and can\'t guarantee, then suggest moving forward.',
        expectedKeywords: ['confirm', 'guarantee', 'commit', 'agree', 'document', 'move forward', 'sign', 'proceed'],
      },
    ],
  },
  {
    id: 'adv-02',
    level: 'advanced',
    title: 'Startup Pitch to Investors',
    description: 'Pitch your startup idea to a panel of venture capitalists.',
    context: 'You have 5 minutes to pitch your EdTech startup. An investor asks pointed questions.',
    xpReward: 120,
    durationMinutes: 10,
    turns: [
      {
        id: 't1',
        speaker: 'ai',
        text: "We've read your executive summary. Before we dive in, give me your elevator pitch — 60 seconds, what problem are you solving and why now?",
      },
      {
        id: 't2',
        speaker: 'user',
        text: '',
        hint: 'State the problem clearly, your solution, target market size, and why timing matters. Be concise and compelling.',
        expectedKeywords: ['problem', 'solution', 'market', 'million', 'users', 'growth', 'timing', 'opportunity'],
      },
      {
        id: 't3',
        speaker: 'ai',
        text: "Interesting. The EdTech space is crowded. What's your unfair advantage over established players like Duolingo or Coursera?",
      },
      {
        id: 't4',
        speaker: 'user',
        text: '',
        hint: 'Articulate your unique differentiator — technology, distribution, data, or network effects that incumbents can\'t easily replicate.',
        expectedKeywords: ['advantage', 'different', 'proprietary', 'technology', 'AI', 'data', 'niche', 'approach'],
      },
      {
        id: 't5',
        speaker: 'ai',
        text: "Walk me through your unit economics. What's your CAC, LTV, and current monthly burn rate?",
      },
      {
        id: 't6',
        speaker: 'user',
        text: '',
        hint: 'Speak confidently about your numbers. If early stage, explain your assumptions and the path to these metrics.',
        expectedKeywords: ['acquisition', 'cost', 'lifetime', 'value', 'burn', 'revenue', 'margin', 'payback'],
      },
      {
        id: 't7',
        speaker: 'ai',
        text: "Let's say we decide to invest. What's your 18-month roadmap and how will you deploy the capital?",
      },
      {
        id: 't8',
        speaker: 'user',
        text: '',
        hint: 'Break down fund allocation clearly: team, product, marketing, operations. Show milestone thinking.',
        expectedKeywords: ['team', 'product', 'marketing', 'hire', 'milestone', 'launch', 'scale', 'allocate'],
      },
    ],
  },
];

/** Get scenarios filtered by level */
export function getScenariosByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Scenario[] {
  return SCENARIOS.filter((s) => s.level === level);
}

/** Get a scenario by its ID */
export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
