export const AI_MARKERS = [
  { id: 'ai_word', regex: /\bAI\b/, name: "\"AI mentioned\"", level: 3 },
  { id: 'testament', regex: /testament to/i, name: "\"Testament to\"", level: 3 },
  { id: 'dive_deep', regex: /dive deep/i, name: "\"Dive deep\"", level: 3 },
  { id: 'not_x_but_y', regex: /(?:it(?:')?s not .*?, it(?:')?s|it(?:')?s .*?, not)/i, name: "\"It's not X, it's Y\"", level: 2 },
  { id: 'buckle_up', regex: /buckle up/i, name: "\"Buckle up\"", level: 2 },
  { id: 'game_changer', regex: /game-?changer/i, name: "\"Game-changer\"", level: 2 },
  { id: 'unlock_power', regex: /unlock the power of/i, name: "\"Unlock the power of\"", level: 2 },
  { id: 'ever_evolving', regex: /ever-?evolving/i, name: "\"Ever-evolving\"", level: 2 },
  { id: 'supercharge', regex: /supercharge your/i, name: "\"Supercharge your\"", level: 2 },
  { id: 'ah_the', regex: /\bah, the\b/i, name: "\"Ah, the\"", level: 2 },
  { id: 'in_conclusion', regex: /\bin conclusion\b/i, name: "\"In conclusion\"", level: 2 },
  { id: 'lets_dive_in', regex: /let(?:')?s dive in/i, name: "\"Let's dive in\"", level: 2 },
  { id: 'important_to_remember', regex: /it(?:')?s important to remember/i, name: "\"It's important to remember\"", level: 2 },
  { id: 'picture_this', regex: /\bpicture this\b/i, name: "\"Picture this\"", level: 2 },
  { id: 'imagine_a_world', regex: /imagine a world where/i, name: "\"Imagine a world\"", level: 2 },
  { id: 'in_the_realm_of', regex: /in the realm of/i, name: "\"In the realm of\"", level: 2 },
  { id: 'delve', regex: /\bdelve\b/i, name: "\"Delve\"", level: 1 },
  { id: 'fast_paced', regex: /in today(?:')?s fast(?:\-)?paced/i, name: "\"In today's fast-paced\"", level: 1 },
  { id: 'navigating', regex: /navigating the(?: complexities)?/i, name: "\"Navigating the complexities\"", level: 1 },
  { id: 'paradigm_shift', regex: /a paradigm shift/i, name: "\"A paradigm shift\"", level: 1 },
  { id: 'tapestry', regex: /tapestry of/i, name: "\"Tapestry of\"", level: 1 },
  { id: 'transformative', regex: /transformative power/i, name: "\"Transformative power\"", level: 1 },
  { id: 'as_an_ai', regex: /\bas an ai\b/i, name: "\"As an AI\"", level: 1 }
];

export function checkAIText(text: string, disabledRules: string[] = []) {
  const matchedMarkers: string[] = [];
  for (const marker of AI_MARKERS) {
    if (!disabledRules.includes(marker.id) && marker.regex.test(text)) {
      matchedMarkers.push(marker.name);
    }
  }
  return matchedMarkers;
}
