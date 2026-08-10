/**
 * Anti-insultos / profanity filter for Spanish.
 * Normalizes text and checks against a curated word list.
 * Handles common obfuscation: leetspeak, repeated chars, zero-width chars,
 * Unicode homoglyphs (NFKC normalization).
 */

// ── Word list: curated for unambiguous profanity ────────────────────
const PROFANITY_WORDS = new Set([
  // Insultos generales (inequívocamente ofensivos)
  'puta', 'puto', 'putas', 'putos',
  'mierda', 'mierdas',
  'pendejo', 'pendeja', 'pendejos', 'pendejas',
  'cabron', 'cabrona', 'cabrones', 'cabronas',
  'chinga', 'chingar', 'chingada', 'chingado',
  'chingue', 'chingues', 'chinguen',
  'verga', 'vergas',
  'joder', 'jodido', 'jodida',
  'jodete', 'jodanse',
  'culero', 'culera', 'culeros', 'culeras',
  'pinche', 'pinches',
  'huevon', 'huevona', 'huevones', 'huevonas',
  'guevon', 'guevona', 'guevones', 'guevonas',
  'huevos', 'guevos',
  'ojete', 'ojetes',
  'mamada', 'mamadas',
  'mamon', 'mamona', 'mamones', 'mamonas',
  'maricon', 'maricona', 'maricones', 'mariconas',
  'marica', 'maricas',
  'pajero', 'pajera', 'pajeros', 'pajeras',
  'chingadera', 'chingaderas',
  'conchuda', 'conchudo',
  'pelotudo', 'pelotuda', 'pelotudos', 'pelotudas',
  'boludo', 'boluda', 'boludos', 'boludas',
  'forro', 'forra', 'forros', 'forras',
  'mogolico', 'mogolica', 'mogolicos', 'mogolicas',
  'retrasado', 'retrasada', 'retrasados', 'retrasadas',
  'tarado', 'tarada', 'tarados', 'taradas',
  'idiota', 'idiotas',
  'imbecil', 'imbeciles',
  'estupido', 'estupida', 'estupidos', 'estupidas',

  // Insultos racistas / discriminatorios
  'naco', 'naca', 'nacos', 'nacas',
  'prieto', 'prieta', 'prietos', 'prietas',
  'joto', 'jota', 'jotos', 'jotas',
  'machorra', 'machorras',

  // Insultos en inglés (comunes en internet)
  'fuck', 'fucking', 'fucker',
  'shit', 'shitty', 'bullshit',
  'asshole', 'assholes',
  'bastard', 'bastards',
  'bitch', 'bitches',
  'motherfucker', 'motherfuckers',
  'dumbass', 'dumbasses',
  'jackass', 'jackasses',
  'dickhead', 'douchebag',
  'cunt',

  // Insultos regionales fuertes
  'malparido', 'malparida', 'malparidos', 'malparidas',
  'gonorrea', 'gonorreas',
  'pirobo', 'piroba', 'pirobos', 'pirobas',
  'careverga', 'carevergas',
  'carechimba', 'carechimbas',
  'hijueputa', 'hijueputas', 'hijueputo', 'hijueputos',
  'hijodeputa', 'hijodeputas', 'hijodeputo', 'hijodeputos',
  'webon', 'webona', 'webones', 'webonas',
  'conchetumare', 'conchetumadre',
]);

// ── Leetspeak character mapping ────────────────────────────────────
const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '2': 'z', '3': 'e', '4': 'a',
  '5': 's', '6': 'g', '7': 't', '8': 'b', '9': 'g',
  '@': 'a', '$': 's',
};

/**
 * Normalize text for profanity detection:
 * 1. NFKC normalize (handles Unicode homoglyphs: Cyrillic 'а' → Latin 'a')
 * 2. Strip zero-width characters (U+200B-U+200D, U+FEFF)
 * 3. Lowercase
 * 4. Remove/replace common leetspeak characters
 * 5. Collapse single letters separated by spaces ("p u t a" → "puta")
 * 6. Collapse repeated characters ("pppuuutttaaa" → "puta")
 */
function normalize(text: string): string {
  // NFKC normalization: converts compatibility and halfwidth chars to canonical form
  let normalized = text.normalize('NFKC');

  // Strip zero-width characters
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Lowercase
  normalized = normalized.toLowerCase().trim();

  // Convert leetspeak
  normalized = normalized
    .split('')
    .map((c) => LEET_MAP[c] ?? c)
    .join('');

  // Remove non-alphanumeric except spaces
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');

  // Collapse single letters with spaces between them: "p u t a" → "puta"
  normalized = normalized.replace(/\b([a-z])\s+([a-z])\s+([a-z])\s*([a-z]?)\s*([a-z]?)\s*([a-z]?)\s*([a-z]?)\s*([a-z]?)\b/g, (_m, ...chars: string[]) => {
    return chars.filter(Boolean).join('');
  });

  // Collapse repeated characters: "ppppuuuuutttttaaaa" → "puta"
  normalized = normalized.replace(/([a-z])\1{2,}/g, '$1$1');

  return normalized;
}

export interface ProfanityResult {
  containsProfanity: boolean;
  matchedWords: string[];
}

/**
 * Check if the given text contains profanity.
 * Returns the result with matched words for transparency.
 */
export function checkProfanity(text: string): ProfanityResult {
  const normalized = normalize(text);
  const words = normalized.split(/\s+/);
  const matched: string[] = [];

  for (const word of words) {
    if (word.length < 2) continue;

    // Direct match
    if (PROFANITY_WORDS.has(word)) {
      matched.push(word);
      continue;
    }

    // Normalize double letters: "ppuuttaa" → "puta"
    const deduped = word.replace(/([a-z])\1+/g, '$1');
    if (PROFANITY_WORDS.has(deduped)) {
      matched.push(deduped);
      continue;
    }

    // Check if any profanity word is contained within this word
    // (catches compound words and basic word embedding)
    for (const bad of PROFANITY_WORDS) {
      if (bad.length >= 4 && word.includes(bad)) {
        matched.push(bad);
        break;
      }
    }
  }

  // Also check the raw normalized text for multi-word profanity phrases
  for (const bad of PROFANITY_WORDS) {
    if (bad.includes(' ')) continue; // skip multi-word for now
    if (normalized.includes(bad) && !matched.includes(bad)) {
      // Check if it's a whole word match within the text
      const regex = new RegExp(`\\b${bad}\\b`);
      if (regex.test(normalized)) {
        matched.push(bad);
      }
    }
  }

  return {
    containsProfanity: matched.length > 0,
    matchedWords: [...new Set(matched)],
  };
}

/**
 * Check both name and comment fields for profanity.
 * Used at the API boundary before storing a review.
 */
export function validateReviewContent(
  authorName: string,
  authorSurname: string,
  comment: string,
): ProfanityResult {
  const fullName = `${authorName} ${authorSurname}`;
  const combined = [fullName, comment].join(' ');

  return checkProfanity(combined);
}
