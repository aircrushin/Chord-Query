export type ChordResult = {
  raw: string;
  symbol: string;
  root: string;
  rootPc: number;
  qualityKey: string;
  qualityName: string;
  qualityNameEn: string;
  intervals: number[];
  degrees: string[];
  notes: string[];
  keys: number[];
  bass?: string;
  bassPc?: number;
  bassKey?: number;
};

export type ParseResult =
  | { ok: true; chord: ChordResult }
  | { ok: false; raw: string; empty: true }
  | { ok: false; raw: string; error: string };

type QualityDef = {
  key: string;
  aliases: string[];
  intervals: number[];
  name: string;
  nameEn: string;
  symbol: string;
};

const LETTER_PC: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;

const ADD_INTERVAL: Record<string, number> = {
  "2": 2,
  "4": 5,
  "6": 9,
  "8": 12,
  "9": 14,
  "11": 17,
  "13": 21,
};

const DEGREE_BY_INTERVAL: Record<number, string> = {
  0: "1",
  1: "♭2",
  2: "2",
  3: "♭3",
  4: "3",
  5: "4",
  6: "♭5",
  7: "5",
  8: "♯5",
  9: "6",
  10: "♭7",
  11: "7",
  12: "8",
  13: "♭9",
  14: "9",
  15: "♯9",
  16: "♭11",
  17: "11",
  18: "♯11",
  19: "12",
  20: "♭13",
  21: "13",
};

const QUALITIES: QualityDef[] = [
  { key: "maj13", aliases: ["maj13", "ma13"], intervals: [0, 4, 7, 11, 14, 17, 21], name: "大十三和弦", nameEn: "Major 13th", symbol: "maj13" },
  { key: "m13", aliases: ["m13", "min13", "-13"], intervals: [0, 3, 7, 10, 14, 17, 21], name: "小十三和弦", nameEn: "Minor 13th", symbol: "m13" },
  { key: "13", aliases: ["13", "dom13"], intervals: [0, 4, 7, 10, 14, 17, 21], name: "属十三和弦", nameEn: "Dominant 13th", symbol: "13" },
  { key: "maj11", aliases: ["maj11", "ma11"], intervals: [0, 4, 7, 11, 14, 17], name: "大十一和弦", nameEn: "Major 11th", symbol: "maj11" },
  { key: "m11", aliases: ["m11", "min11", "-11"], intervals: [0, 3, 7, 10, 14, 17], name: "小十一和弦", nameEn: "Minor 11th", symbol: "m11" },
  { key: "11", aliases: ["11", "dom11"], intervals: [0, 4, 7, 10, 14, 17], name: "属十一和弦", nameEn: "Dominant 11th", symbol: "11" },
  { key: "maj9", aliases: ["maj9", "ma9"], intervals: [0, 4, 7, 11, 14], name: "大九和弦", nameEn: "Major 9th", symbol: "maj9" },
  { key: "m9", aliases: ["m9", "min9", "-9"], intervals: [0, 3, 7, 10, 14], name: "小九和弦", nameEn: "Minor 9th", symbol: "m9" },
  { key: "9", aliases: ["9", "dom9"], intervals: [0, 4, 7, 10, 14], name: "属九和弦", nameEn: "Dominant 9th", symbol: "9" },
  { key: "69", aliases: ["69", "6/9", "maj69"], intervals: [0, 4, 7, 9, 14], name: "六九和弦", nameEn: "6/9", symbol: "6/9" },
  { key: "m69", aliases: ["m69", "m6/9"], intervals: [0, 3, 7, 9, 14], name: "小六九和弦", nameEn: "Minor 6/9", symbol: "m6/9" },
  { key: "maj7", aliases: ["maj7", "ma7"], intervals: [0, 4, 7, 11], name: "大七和弦", nameEn: "Major 7th", symbol: "maj7" },
  { key: "mM7", aliases: ["mm7", "mmaj7", "mma7", "mΔ7", "minmaj7"], intervals: [0, 3, 7, 11], name: "小大七和弦", nameEn: "Minor-major 7th", symbol: "mM7" },
  { key: "augM7", aliases: ["augmaj7", "augm7", "maj7#5", "maj7♯5"], intervals: [0, 4, 8, 11], name: "增大七和弦", nameEn: "Augmented major 7th", symbol: "augM7" },
  { key: "m7b5", aliases: ["m7b5", "m7-5", "m7♭5", "hdim", "hdim7", "ø", "ø7"], intervals: [0, 3, 6, 10], name: "半减七和弦", nameEn: "Half-diminished 7th", symbol: "m7♭5" },
  { key: "7b5", aliases: ["7b5", "7-5", "7♭5"], intervals: [0, 4, 6, 10], name: "七减五和弦", nameEn: "Dominant 7♭5", symbol: "7♭5" },
  { key: "7b9", aliases: ["7b9", "7♭9", "7-9"], intervals: [0, 4, 7, 10, 13], name: "属七降九和弦", nameEn: "Dominant 7♭9", symbol: "7♭9" },
  { key: "7sharp9", aliases: ["7#9", "7♯9"], intervals: [0, 4, 7, 10, 15], name: "属七升九和弦", nameEn: "Dominant 7♯9", symbol: "7♯9" },
  { key: "7sharp11", aliases: ["7#11", "7♯11"], intervals: [0, 4, 7, 10, 18], name: "属七升十一和弦", nameEn: "Dominant 7♯11", symbol: "7♯11" },
  { key: "maj7sharp11", aliases: ["maj7#11", "maj7♯11"], intervals: [0, 4, 7, 11, 18], name: "大七升十一和弦", nameEn: "Major 7♯11", symbol: "maj7♯11" },
  { key: "m7", aliases: ["m7", "min7", "-7"], intervals: [0, 3, 7, 10], name: "小七和弦", nameEn: "Minor 7th", symbol: "m7" },
  { key: "7", aliases: ["7", "dom7"], intervals: [0, 4, 7, 10], name: "属七和弦", nameEn: "Dominant 7th", symbol: "7" },
  { key: "aug7", aliases: ["aug7", "7#5", "7♯5", "7+5", "+7"], intervals: [0, 4, 8, 10], name: "增七和弦", nameEn: "Augmented 7th", symbol: "aug7" },
  { key: "dim7", aliases: ["dim7", "o7", "°7"], intervals: [0, 3, 6, 9], name: "减七和弦", nameEn: "Diminished 7th", symbol: "dim7" },
  { key: "maj6", aliases: ["6", "maj6", "add6"], intervals: [0, 4, 7, 9], name: "六和弦", nameEn: "Major 6th", symbol: "6" },
  { key: "m6", aliases: ["m6", "min6"], intervals: [0, 3, 7, 9], name: "小六和弦", nameEn: "Minor 6th", symbol: "m6" },
  { key: "dim", aliases: ["dim", "o", "°"], intervals: [0, 3, 6], name: "减三和弦", nameEn: "Diminished", symbol: "dim" },
  { key: "aug", aliases: ["aug", "+", "+5"], intervals: [0, 4, 8], name: "增三和弦", nameEn: "Augmented", symbol: "aug" },
  { key: "m", aliases: ["m", "min", "-"], intervals: [0, 3, 7], name: "小三和弦", nameEn: "Minor", symbol: "m" },
  { key: "maj", aliases: ["", "maj", "ma", "Δ"], intervals: [0, 4, 7], name: "大三和弦", nameEn: "Major", symbol: "" },
  { key: "5", aliases: ["5", "power"], intervals: [0, 7], name: "强力和弦", nameEn: "Power chord", symbol: "5" },
];

const QUALITY_LOOKUP = (() => {
  const entries: { alias: string; def: QualityDef }[] = [];
  for (const def of QUALITIES) {
    for (const alias of def.aliases) {
      entries.push({ alias, def });
    }
  }
  entries.sort((a, b) => b.alias.length - a.alias.length);
  return entries;
})();

function wrapPc(pc: number): number {
  return ((pc % 12) + 12) % 12;
}

function accidentalValue(acc: string): number {
  const normalized = acc.replace(/♯/g, "#").replace(/♭/g, "b");
  let value = 0;
  for (const ch of normalized) {
    if (ch === "#") value += 1;
    else if (ch === "b") value -= 1;
  }
  return value;
}

function accidentalGlyph(semitones: number): string {
  if (semitones === 0) return "";
  if (semitones === 1) return "♯";
  if (semitones === 2) return "𝄪";
  if (semitones === -1) return "♭";
  if (semitones === -2) return "𝄫";
  return (semitones > 0 ? "♯" : "♭").repeat(Math.abs(semitones));
}

function letterIndex(letter: string): number {
  return LETTERS.indexOf(letter.toUpperCase() as (typeof LETTERS)[number]);
}

function spellPitchClass(pc: number, preferFlats = false): string {
  const names = preferFlats
    ? ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"]
    : ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  return names[wrapPc(pc)];
}

function spellInterval(rootLetter: string, rootPc: number, interval: number): string {
  const simple = ((interval % 12) + 12) % 12;
  const generic = [0, 1, 1, 2, 2, 3, 4, 4, 4, 5, 6, 6][simple];
  const letter = LETTERS[(letterIndex(rootLetter) + generic) % 7];
  const naturalPc = LETTER_PC[letter];
  const targetPc = wrapPc(rootPc + simple);
  let acc = targetPc - naturalPc;
  if (acc > 6) acc -= 12;
  if (acc < -6) acc += 12;
  return `${letter}${accidentalGlyph(acc)}`;
}

function parseRootToken(input: string): { name: string; pc: number; rest: string } | null {
  const text = input.trim();
  if (!text) return null;

  const prefix = text.match(/^([#b♯♭])([A-Ga-g])/);
  if (prefix) {
    const letter = prefix[2].toUpperCase();
    const pc = wrapPc(LETTER_PC[letter] + accidentalValue(prefix[1]));
    const name = `${letter}${accidentalGlyph(accidentalValue(prefix[1]))}`;
    return { name, pc, rest: text.slice(prefix[0].length) };
  }

  const standard = text.match(/^([A-Ga-g])([#b♯♭]*)/);
  if (!standard) return null;
  const letter = standard[1].toUpperCase();
  const acc = standard[2];
  const pc = wrapPc(LETTER_PC[letter] + accidentalValue(acc));
  const name = `${letter}${accidentalGlyph(accidentalValue(acc))}`;
  return { name, pc, rest: text.slice(standard[0].length) };
}

function canonicalizeQuality(raw: string): string {
  let s = raw.replace(/[♯]/g, "#").replace(/[♭]/g, "b").replace(/Δ|∆/g, "maj");
  s = s.replace(/ø7?/gi, "hdim");
  s = s.replace(/°7/g, "dim7");
  s = s.replace(/°/g, "dim");
  s = s.replace(/6\/9/g, "69");
  s = s.replace(/m6\/9/i, "m69");
  s = s.replace(/min/gi, "m");
  s = s.replace(/dom/gi, "");
  s = s.replace(/^Maj(?=7|9|11|13|$)/, "maj");
  s = s.replace(/^MAJ(?=7|9|11|13|$)/, "maj");
  s = s.replace(/^M(?=7|9|11|13|$)/, "maj");
  s = s.replace(/^mM7$/, "mm7");
  s = s.replace(/^mMaj7$/i, "mm7");
  s = s.replace(/^augM7$/, "augmaj7");
  if (s === "+") s = "aug";
  s = s.replace(/7\+5/g, "7#5");
  return s;
}

function extractModifiers(quality: string): {
  core: string;
  sus?: 2 | 4;
  adds: number[];
} {
  let core = quality;
  const adds: number[] = [];
  let sus: 2 | 4 | undefined;

  const addMatch = core.match(/add(13|11|9|8|6|4|2)/i);
  if (addMatch) {
    adds.push(ADD_INTERVAL[addMatch[1]]);
    core = core.replace(addMatch[0], "");
  }

  const susMatch = core.match(/sus([24])?/i);
  if (susMatch) {
    sus = susMatch[1] === "2" ? 2 : 4;
    core = core.replace(susMatch[0], "");
  }

  return { core, sus, adds };
}

function findQuality(core: string): QualityDef | undefined {
  const needle = core.toLowerCase();
  for (const { alias, def } of QUALITY_LOOKUP) {
    if (alias.toLowerCase() === needle) return def;
  }
  return undefined;
}

function applySus(intervals: number[], sus: 2 | 4): number[] {
  const replacement = sus === 2 ? 2 : 5;
  const next = [...intervals];
  const thirdIndex = next.findIndex((value) => value === 3 || value === 4);
  if (thirdIndex >= 0) next[thirdIndex] = replacement;
  else if (!next.includes(replacement)) next.splice(1, 0, replacement);
  return next;
}

function toKeyIndex(rootPc: number, interval: number): number {
  let key = rootPc + interval;
  while (key > 23) key -= 12;
  while (key < 0) key += 12;
  return key;
}

export function invertIntervals(intervals: number[], inversion: number): number[] {
  if (intervals.length === 0) return [];
  const count = ((inversion % intervals.length) + intervals.length) % intervals.length;
  const rotated = [
    ...intervals.slice(count),
    ...intervals.slice(0, count).map((value) => value + 12),
  ];
  const lowest = Math.min(...rotated);
  const shift = Math.floor(lowest / 12) * 12;
  return rotated.map((value) => value - shift);
}

export function parseChord(input: string): ParseResult {
  const raw = input.trim();
  if (!raw) return { ok: false, raw, empty: true };

  const normalized = raw.replace(/\s+/g, "");
  const slashIndex = (() => {
    const last = normalized.lastIndexOf("/");
    if (last <= 0) return -1;
    const head = normalized.slice(0, last).toLowerCase();
    if (head.endsWith("6") && /^9/i.test(normalized.slice(last + 1))) return -1;
    return last;
  })();

  const main = slashIndex >= 0 ? normalized.slice(0, slashIndex) : normalized;
  const bassRaw = slashIndex >= 0 ? normalized.slice(slashIndex + 1) : "";

  const root = parseRootToken(main);
  if (!root) {
    return { ok: false, raw, error: "请用 C、F♯、Bb 这样的音名开头" };
  }

  const qualitySource = canonicalizeQuality(root.rest);
  const { core, sus, adds } = extractModifiers(qualitySource);
  const quality = findQuality(core);
  if (!quality) {
    return { ok: false, raw, error: `无法识别和弦类型「${root.rest || core}」` };
  }

  let intervals = [...quality.intervals];
  if (sus) intervals = applySus(intervals, sus);
  for (const extra of adds) {
    if (!intervals.includes(extra)) intervals.push(extra);
  }
  intervals = [...new Set(intervals)].sort((a, b) => a - b);

  let symbol = `${root.name}${quality.symbol}`;
  if (sus) symbol += sus === 2 ? "sus2" : "sus4";
  if (adds.length) {
    const addToken = Object.entries(ADD_INTERVAL).find(([, value]) => value === adds[0]);
    if (addToken) symbol += `add${addToken[0]}`;
  }

  const rootLetter = root.name[0] ?? "C";
  let bassName: string | undefined;
  let bassPc: number | undefined;
  let bassKey: number | undefined;
  if (bassRaw) {
    const bass = parseRootToken(bassRaw);
    if (!bass || bass.rest) {
      return { ok: false, raw, error: "斜杠后的低音无法识别" };
    }
    bassName = bass.name;
    bassPc = bass.pc;
    bassKey = bass.pc;
    symbol += `/${bass.name}`;
  }

  const notes = intervals.map((interval) => spellInterval(rootLetter, root.pc, interval));
  const degrees = intervals.map((interval) => DEGREE_BY_INTERVAL[interval] ?? String(interval));
  const keys = intervals.map((interval) => toKeyIndex(root.pc, interval));
  if (bassKey !== undefined && !keys.includes(bassKey)) {
    keys.unshift(bassKey);
  }

  return {
    ok: true,
    chord: {
      raw,
      symbol,
      root: root.name,
      rootPc: root.pc,
      qualityKey: quality.key,
      qualityName: sus ? `${quality.name}（${sus === 2 ? "挂二" : "挂四"}）` : quality.name,
      qualityNameEn: quality.nameEn,
      intervals,
      degrees,
      notes,
      keys,
      bass: bassName,
      bassPc,
      bassKey,
    },
  };
}

export function keysForVoicing(chord: ChordResult, inversion: number): number[] {
  const voiced = invertIntervals(chord.intervals, inversion);
  const keys = voiced.map((interval) => toKeyIndex(chord.rootPc, interval));
  if (chord.bassKey !== undefined && !keys.includes(chord.bassKey)) {
    keys.unshift(chord.bassKey);
  }
  return keys;
}

export const KEY_COUNT = 24;
export const BLACK_KEYS = new Set([1, 3, 6, 8, 10, 13, 15, 18, 20, 22]);
export const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23];
export const BASE_MIDI = 60;

export function keyName(index: number, flats = false): string {
  return spellPitchClass(index, flats);
}

export function keyMidi(index: number): number {
  return BASE_MIDI + index;
}
