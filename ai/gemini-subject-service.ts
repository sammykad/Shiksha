import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { Subject } from '@/generated/prisma/client';

const google = createGoogleGenerativeAI({
  apiKey:
    process.env.NEXT_PUBLIC_GOOGLE_GEMINI_AI ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export interface AISubjectSuggestion {
  correctedName?: string;
  description?: string;
  codeSuggestions: string[];
  similarSubjects: Array<{
    id: string;
    name: string;
    code: string;
    similarity: number;
  }>;
  hasSpellingError: boolean;
  confidence: number;
}

// ---------------------------------------------------------------------------
// Static lookup tables
// ---------------------------------------------------------------------------

const COMMON_CORRECTIONS: Record<string, string> = {
  scince: 'Science', scinece: 'Science', sciense: 'Science', sience: 'Science',
  mathematic: 'Mathematics', matematics: 'Mathematics', mathmatics: 'Mathematics', maths: 'Mathematics',
  englsih: 'English', engish: 'English', enlgish: 'English',
  histroy: 'History', histry: 'History',
  geograpy: 'Geography', geografy: 'Geography',
  phisics: 'Physics', fisics: 'Physics', physic: 'Physics',
  chemestry: 'Chemistry', chimistry: 'Chemistry', chemisty: 'Chemistry',
  biologi: 'Biology', biolgy: 'Biology',
  'computer sience': 'Computer Science',
  'computr science': 'Computer Science',
  'compter science': 'Computer Science',
};

const SUBJECT_PREFIXES: Record<string, string> = {
  mathematics: 'MATH', math: 'MATH',
  english: 'ENG',
  science: 'SCI',
  physics: 'PHYS',
  chemistry: 'CHEM',
  biology: 'BIO',
  history: 'HIST',
  geography: 'GEO',
  computer: 'CS',
  programming: 'PROG',
  literature: 'LIT',
  philosophy: 'PHIL',
  psychology: 'PSYC',
  sociology: 'SOC',
  economics: 'ECON',
  business: 'BUS',
  management: 'MGMT',
};

const FALLBACK_DESCRIPTIONS: Record<string, string> = {
  mathematics: 'Study of numbers, structures, space, and change. Covers arithmetic, algebra, geometry, and calculus to build logical reasoning and problem-solving skills.',
  english: 'Language arts focusing on literature, writing, grammar, and communication. Develops reading comprehension, critical analysis, and effective expression.',
  science: 'Systematic study of the natural world through observation and experimentation. Introduces scientific method across various disciplines.',
  physics: 'Study of matter, energy, and their interactions. Covers mechanics, thermodynamics, electromagnetism, and modern physics.',
  chemistry: 'Study of matter, its properties, and chemical reactions. Explores atomic structure, bonding, and molecular behaviour.',
  biology: 'Study of living organisms and life processes. Covers cell structure, genetics, evolution, ecology, and human biology.',
  history: 'Study of past events and civilisations. Develops understanding of historical patterns and critical thinking.',
  geography: "Study of Earth's physical features, climate, and human settlements. Explores spatial relationships and environmental interactions.",
};

// ---------------------------------------------------------------------------
// Pure local helpers (synchronous — zero latency)
// ---------------------------------------------------------------------------

function levenshteinSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 1.0;

  const m = Array.from({ length: s2.length + 1 }, (_, j) =>
    Array.from({ length: s1.length + 1 }, (_, i) => (j === 0 ? i : i === 0 ? j : 0))
  );

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      m[j][i] = Math.min(
        m[j][i - 1] + 1,
        m[j - 1][i] + 1,
        m[j - 1][i - 1] + (s1[i - 1] === s2[j - 1] ? 0 : 1)
      );
    }
  }

  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1.0 : (maxLen - m[s2.length][s1.length]) / maxLen;
}

function spellCheck(input: string): { corrected: string; hasError: boolean } {
  const normalized = input.toLowerCase().trim();

  if (COMMON_CORRECTIONS[normalized]) {
    return { corrected: COMMON_CORRECTIONS[normalized], hasError: true };
  }

  for (const [typo, fix] of Object.entries(COMMON_CORRECTIONS)) {
    if (levenshteinSimilarity(normalized, typo) > 0.7) {
      return { corrected: fix, hasError: true };
    }
  }

  return { corrected: input, hasError: false };
}

function findSimilarSubjects(
  inputName: string,
  subjects: Subject[]
): AISubjectSuggestion['similarSubjects'] {
  if (!inputName.trim()) return [];
  return subjects
    .map((s) => ({ id: s.id, name: s.name, code: s.code, similarity: levenshteinSimilarity(inputName, s.name) }))
    .filter((s) => s.similarity > 0.6)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

function generateCodeSuggestions(name: string, subjects: Subject[]): string[] {
  if (!name.trim()) return [];

  const existing = new Set(subjects.map((s) => s.code.toUpperCase()));
  const words = name.trim().split(/\s+/);
  const first = words[0];
  const candidates: string[] = [];

  const tryAdd = (base: string) => {
    for (let n = 101; n <= 999 && candidates.length < 10; n++) {
      const code = base + n;
      if (!existing.has(code)) candidates.push(code);
    }
  };

  // 1. Known prefix
  for (const [key, prefix] of Object.entries(SUBJECT_PREFIXES)) {
    if (first.toLowerCase().includes(key)) { tryAdd(prefix); break; }
  }

  // 2. First 4 letters
  if (first.length >= 3) tryAdd(first.substring(0, 4).toUpperCase());

  // 3. First 3 letters
  if (first.length >= 3) tryAdd(first.substring(0, 3).toUpperCase());

  // 4. Acronym for multi-word subjects
  if (words.length > 1) {
    tryAdd(words.map((w) => w[0]).join('').toUpperCase());
  }

  return [...new Set(candidates)].slice(0, 6);
}

function fallbackDescription(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, desc] of Object.entries(FALLBACK_DESCRIPTIONS)) {
    if (lower.includes(key)) return desc;
  }
  return `Comprehensive study of ${name} covering fundamental concepts, practical applications, and critical thinking skills.`;
}

// ---------------------------------------------------------------------------
// Local-only suggestion (instant — no network)
// ---------------------------------------------------------------------------

export function getLocalSubjectSuggestions(
  inputName: string,
  subjects: Subject[]
): AISubjectSuggestion {
  const spell = spellCheck(inputName);
  const processedName = spell.corrected;

  return {
    correctedName: spell.hasError ? spell.corrected : undefined,
    description: fallbackDescription(processedName),
    codeSuggestions: generateCodeSuggestions(processedName, subjects),
    similarSubjects: findSimilarSubjects(inputName, subjects),
    hasSpellingError: spell.hasError,
    confidence: spell.hasError ? 0.9 : 0.8,
  };
}

// ---------------------------------------------------------------------------
// AI description — only called explicitly on demand
// ---------------------------------------------------------------------------

export async function generateAIDescription(subjectName: string): Promise<string> {
  if (!subjectName.trim()) return '';

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: `Write a concise academic description (max 150 characters) for the subject "${subjectName}". Cover what it studies and key learning objectives. Return only the description, no preamble.`,
      temperature: 0.5,
    });
    return text.trim();
  } catch {
    return fallbackDescription(subjectName);
  }
}

// ---------------------------------------------------------------------------
// Debounced local suggestions — used by the form for real-time feedback
// ---------------------------------------------------------------------------

export function createDebouncedSuggestions(delay = 400) {
  let timer: ReturnType<typeof setTimeout>;

  return (inputName: string, subjects: Subject[]): Promise<AISubjectSuggestion> =>
    new Promise((resolve) => {
      clearTimeout(timer);
      timer = setTimeout(() => resolve(getLocalSubjectSuggestions(inputName, subjects)), delay);
    });
}

// ---------------------------------------------------------------------------
// Kept for backwards compatibility — now just calls the local version
// ---------------------------------------------------------------------------

export async function getAISubjectSuggestions(
  inputName: string,
  subjects: Subject[]
): Promise<AISubjectSuggestion> {
  return getLocalSubjectSuggestions(inputName, subjects);
}