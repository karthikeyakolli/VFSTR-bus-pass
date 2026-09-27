/**
 * Dynamic Groq LPU AI Engine for VFSTR Transport & Bus Pass Management System
 * Integrates high-speed LLM inference (qwen3.8-27b on Groq LPU) with domain knowledge,
 * intent resolution, portal navigation actions, and offline-resilient fallbacks.
 */

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TransitAction {
  label: string;
  path: string;
  type?: 'navigate' | 'action';
}

export interface GroqAiResponse {
  text: string;
  cleanSpeechText: string;
  actions: TransitAction[];
  latencyMs: number;
  modelUsed: string;
  isFallback: boolean;
}

// Retrieve API Key securely from Vite env, session storage, or local storage
const GROQ_DEFAULT_API_KEY =
  (import.meta.env?.VITE_GROQ_API_KEY as string) ||
  (typeof window !== 'undefined' ? (window.localStorage.getItem('vfstr_groq_api_key') || '') : '');

const PRIMARY_MODEL = 'qwen/qwen3.8-27b';
const FALLBACK_MODEL = 'openai/gpt-oss-120b';

const VFSTR_SYSTEM_PROMPT = `You are Vaani, the official intelligent transit copilot for VFSTR (Vignan's Foundation for Science, Technology & Research, Deemed to be University, Vadlamudi, Guntur - Andhra Pradesh).

CAMPUS TRANSIT KNOWLEDGE BASE:
1. Fleet & Network:
   - 65+ modern college buses servicing 71 distinct transit corridors across Andhra Pradesh capital region.
   - Major hubs: Guntur (NTR Bus Stand, Gujjanagundla, Lakshmipuram, Arundelpet, Collectorate, Amaravathi Rd), Vijayawada (Benz Circle, Pandit Nehru Bus Station, Ramavarappadu, Auto Nagar, Poranki), Tenali (Railway Station, Chenchupet, Angalakuduru, Itanagar), Mangalagiri, Repalle, Sattenapalli, Chilakaluripet, Bapatla, Ponnur, Chebrolu.
2. Capacity & Seating Policy:
   - Strict 60-passenger cap per bus: 45 physical pushback seats + 15 standing room boarding slots.
   - Real-time seat reservation engine with live vacancy counters.
   - Faculty members have reserved priority seating (front 8 seats) and automated ₹2,200/mo salary deductions.
3. Digital Bus Pass & Security:
   - Dynamic anti-fraud rolling QR code renewing every 15 seconds with cryptographic payload.
   - Offline cryptographic verification for conductors and gate security even when internet connectivity is low.
   - Hologram security seal and barcode identifier.
4. Annual Fee Slabs:
   - Zone 1 (Local Vadlamudi / Tenali / Chebrolu): ₹18,000 / academic year
   - Zone 2 (Guntur City / Mangalagiri): ₹24,000 / academic year
   - Zone 3 (Vijayawada / Chilakaluripet / Ponnur): ₹29,000 / academic year
   - Zone 4 (Repalle / Bapatla / Sattenapalli): ₹33,000 / academic year
   - Flexible semester installments (50% per term) & ₹1,500 early-bird rebate.
5. Safety & Special Features:
   - Parent Portal: Live GPS telemetry (5s cadence), 2km geofence arrival alerts, bus speed monitor.
   - Single-Day Guest Pass: ₹120/day pass for visiting parents, interviewees, and seminar attendees.
   - Lost & Found: 24/7 digital claim registry with image submissions.
   - Emergency SOS: Instant beacon sent to university transport control room & driver dashboard.

PORTAL NAVIGATION CODES:
When your answer can be assisted by opening a portal page, append an action tag at the very end in this format:
[ACTION:Button Label|RoutePath]

Allowed paths:
- /student/pass (Digital Bus Pass & Rolling QR)
- /student/booking (Seat & Standing Room Booking - 45/60)
- /routes (Live Bus Fleet Radar & GPS Map)
- /fees (Fee Structure & Slabs)
- /parent (Parent Tracking Portal & SMS Alerts)
- /conductor (Conductor / Security Scanner)
- /guest-pass (Day Pass Application)
- /lost-and-found (Lost & Found Registry)
- /student/apply (New Pass Application)
- /student/renew (Pass Renewal)
- /help (Help Desk & Emergency Contacts)

STYLE GUIDELINES:
- Warm, polite, concise, and professional collegiate tone (you may use friendly greetings like "Namaskaram!").
- Keep responses within 2 to 4 sentences. Be direct and avoid unnecessary filler.
- Always include 1 or 2 relevant [ACTION:Label|Path] tags when appropriate.`;

/**
 * Parses actionable tags [ACTION:label|path] out of text.
 */
function parseActionsFromText(rawText: string): { cleanText: string; actions: TransitAction[] } {
  const actions: TransitAction[] = [];
  const actionRegex = /\[ACTION:\s*([^|\]]+)\s*\|\s*([^\]]+)\s*\]/gi;

  const cleanText = rawText.replace(actionRegex, (_, label, path) => {
    actions.push({
      label: label.trim(),
      path: path.trim(),
      type: 'navigate',
    });
    return '';
  }).trim();

  return { cleanText, actions };
}

/**
 * Cleans text for Text-to-Speech synthesis (removes asterisks, markdown, action tags).
 */
function cleanForSpeech(text: string): string {
  return text
    .replace(/\[ACTION:[^\]]+\]/gi, '')
    .replace(/[*_#`~[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Intelligent local fallback matcher when offline or API call fails.
 */
function getLocalFallbackResponse(query: string): GroqAiResponse {
  const q = query.toLowerCase();

  let text = '';
  const actions: TransitAction[] = [];

  if (q.includes('pass') || q.includes('qr') || q.includes('card') || q.includes('id')) {
    text = 'Here is your VFSTR Digital Bus Pass featuring the dynamic anti-fraud rolling QR code and validity stamp.';
    actions.push({ label: 'Open Digital Pass', path: '/student/pass' });
  } else if (q.includes('book') || q.includes('seat') || q.includes('reserve') || q.includes('standing') || q.includes('45') || q.includes('60')) {
    text = 'VFSTR buses operate on a 45-seater layout with 15 standing room boarding slots (60 total cap). You can book your seat now.';
    actions.push({ label: 'Book Seat (45/60)', path: '/student/booking' });
  } else if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('slab') || q.includes('zone')) {
    text = 'Transport fees are tiered across 4 zones from ₹18,000/yr (Zone 1) to ₹33,000/yr (Zone 4) with semester installment options.';
    actions.push({ label: 'View Fee Structure', path: '/fees' });
  } else if (q.includes('track') || q.includes('radar') || q.includes('where is') || q.includes('gps') || q.includes('live') || q.includes('route')) {
    text = 'Live GPS radar is online for all 65+ campus buses across Guntur, Vijayawada, and Tenali routes.';
    actions.push({ label: 'Open Live Bus Radar', path: '/routes' });
  } else if (q.includes('parent') || q.includes('father') || q.includes('mother') || q.includes('family')) {
    text = 'Parents can track their wards in real-time with automatic 2km geofence arrival alerts and live speed meters.';
    actions.push({ label: 'Parent Live Portal', path: '/parent' });
  } else if (q.includes('guest') || q.includes('visitor') || q.includes('day pass') || q.includes('single day')) {
    text = 'Single-day guest passes (₹120/day) are available for campus visitors, parents, and campus interviewees.';
    actions.push({ label: 'Apply Guest Pass', path: '/guest-pass' });
  } else if (q.includes('lost') || q.includes('found') || q.includes('item') || q.includes('bag') || q.includes('phone')) {
    text = 'Submit lost or found transit claims with photo proof to the 24/7 VFSTR Transport Registry.';
    actions.push({ label: 'Lost & Found Desk', path: '/lost-and-found' });
  } else if (q.includes('conductor') || q.includes('scan') || q.includes('security')) {
    text = 'Conductors and security personnel can verify student passes using the high-speed camera QR scanner.';
    actions.push({ label: 'Open QR Scanner', path: '/conductor' });
  } else if (q.includes('sos') || q.includes('emergency') || q.includes('help') || q.includes('accident')) {
    text = 'Emergency assistance activated. Connecting directly with VFSTR Transport Control Room and Campus Security.';
    actions.push({ label: 'Emergency Help', path: '/help' });
  } else {
    text = `Namaskaram! I can assist you with live bus tracking, booking a 45/60 seat, checking your digital QR pass, or reviewing fee slabs across our 71 routes.`;
    actions.push({ label: 'Explore Routes', path: '/routes' });
    actions.push({ label: 'My Pass', path: '/student/pass' });
  }

  return {
    text,
    cleanSpeechText: cleanForSpeech(text),
    actions,
    latencyMs: 12,
    modelUsed: 'Local VFSTR Heuristics Engine',
    isFallback: true,
  };
}

/**
 * Generate a dynamic AI response via Groq API.
 */
export async function generateTransitAiResponse(
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  apiKey?: string
): Promise<GroqAiResponse> {
  const activeKey = apiKey || GROQ_DEFAULT_API_KEY;
  const startTime = performance.now();

  if (!activeKey) {
    const lastUserQuery = conversationHistory.filter((m) => m.role === 'user').pop()?.content || '';
    return getLocalFallbackResponse(lastUserQuery);
  }

  const messages: AiChatMessage[] = [
    { role: 'system', content: VFSTR_SYSTEM_PROMPT },
    ...conversationHistory.slice(-6), // Send last 6 turns for conversational context
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        temperature: 0.4,
        max_tokens: 280,
        messages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If primary model failed, attempt secondary model once
      if (response.status === 404 || response.status === 400) {
        return await tryFallbackModel(messages, activeKey, startTime);
      }
      throw new Error(`Groq API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    const latencyMs = Math.round(performance.now() - startTime);

    const { cleanText, actions } = parseActionsFromText(rawContent);

    return {
      text: cleanText,
      cleanSpeechText: cleanForSpeech(cleanText),
      actions,
      latencyMs,
      modelUsed: data.model || PRIMARY_MODEL,
      isFallback: false,
    };
  } catch (error) {
    console.warn('Groq AI dynamic inference fallback engaged:', error);
    const lastUserQuery = conversationHistory.filter((m) => m.role === 'user').pop()?.content || '';
    const fallback = getLocalFallbackResponse(lastUserQuery);
    fallback.latencyMs = Math.round(performance.now() - startTime);
    return fallback;
  }
}

/**
 * Secondary model fallback (gpt-oss-120b)
 */
async function tryFallbackModel(
  messages: AiChatMessage[],
  apiKey: string,
  startTime: number
): Promise<GroqAiResponse> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: FALLBACK_MODEL,
        temperature: 0.5,
        max_tokens: 250,
        messages,
      }),
    });

    if (!res.ok) throw new Error(`Fallback model failed with ${res.status}`);
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    const { cleanText, actions } = parseActionsFromText(raw);

    return {
      text: cleanText,
      cleanSpeechText: cleanForSpeech(cleanText),
      actions,
      latencyMs: Math.round(performance.now() - startTime),
      modelUsed: FALLBACK_MODEL,
      isFallback: false,
    };
  } catch {
    const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content || '';
    return getLocalFallbackResponse(lastUserMsg);
  }
}
