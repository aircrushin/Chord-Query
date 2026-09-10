import { describe, expect, it } from "vitest";
import { invertIntervals, parseChord } from "./chords";

function keysOf(input: string): number[] {
  const result = parseChord(input);
  if (!result.ok) {
    throw new Error("empty" in result ? "empty" : result.error);
  }
  return [...result.chord.keys].sort((a, b) => a - b);
}

function notesOf(input: string): string[] {
  const result = parseChord(input);
  if (!result.ok) {
    throw new Error("empty" in result ? "empty" : result.error);
  }
  return result.chord.notes;
}

describe("parseChord", () => {
  it("parses C major as a triad on C E G", () => {
    const result = parseChord("C");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.chord.qualityName).toBe("大三和弦");
    expect(result.chord.notes).toEqual(["C", "E", "G"]);
    expect(result.chord.keys).toEqual([0, 4, 7]);
  });

  it("parses minor, seventh and extended qualities from the original app", () => {
    expect(notesOf("Cm")).toEqual(["C", "E♭", "G"]);
    expect(notesOf("C7")).toEqual(["C", "E", "G", "B♭"]);
    expect(notesOf("Cmaj7")).toEqual(["C", "E", "G", "B"]);
    expect(notesOf("CM7")).toEqual(["C", "E", "G", "B"]);
    expect(notesOf("Cdim")).toEqual(["C", "E♭", "G♭"]);
    expect(notesOf("Caug")).toEqual(["C", "E", "G♯"]);
    expect(notesOf("C9")).toEqual(["C", "E", "G", "B♭", "D"]);
    expect(notesOf("Cmaj13")).toEqual(["C", "E", "G", "B", "D", "F", "A"]);
  });

  it("accepts original prefix accidentals and standard accidentals", () => {
    expect(keysOf("#C")).toEqual(keysOf("C#"));
    expect(keysOf("bD")).toEqual(keysOf("Db"));
    expect(keysOf("F#m7")).toEqual(keysOf("F♯m7"));
    expect(parseChord("Dbmaj7").ok).toBe(true);
  });

  it("is case-insensitive for the root and keeps M7 as major seven", () => {
    expect(keysOf("cmaj7")).toEqual(keysOf("Cmaj7"));
    expect(notesOf("Am")).toEqual(["A", "C", "E"]);
    expect(notesOf("Am7")).toEqual(["A", "C", "E", "G"]);
    expect(notesOf("AM7")).toEqual(["A", "C♯", "E", "G♯"]);
  });

  it("applies sus and add modifiers", () => {
    expect(notesOf("Csus")).toEqual(["C", "F", "G"]);
    expect(notesOf("Csus4")).toEqual(["C", "F", "G"]);
    expect(notesOf("Csus2")).toEqual(["C", "D", "G"]);
    expect(notesOf("Cadd9")).toEqual(["C", "E", "G", "D"]);
    expect(notesOf("C7sus4")).toEqual(["C", "F", "G", "B♭"]);
  });

  it("keeps all chord tones for slash chords and marks the bass", () => {
    const result = parseChord("C/E");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.chord.notes).toEqual(["C", "E", "G"]);
    expect(result.chord.bass).toBe("E");
    expect(result.chord.keys.sort((a, b) => a - b)).toEqual([0, 4, 7]);
    expect(result.chord.bassKey).toBe(4);
  });

  it("adds a missing slash bass to the keyboard", () => {
    const result = parseChord("C/B");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.chord.bassKey).toBe(11);
    expect(result.chord.keys).toContain(11);
  });

  it("does not treat 6/9 as a slash chord", () => {
    const result = parseChord("C6/9");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.chord.bass).toBeUndefined();
    expect(result.chord.notes).toEqual(["C", "E", "G", "A", "D"]);
  });

  it("wraps high extensions into the two-octave keyboard", () => {
    expect(keysOf("B13").every((key) => key >= 0 && key <= 23)).toBe(true);
  });

  it("returns empty and unknown states", () => {
    expect(parseChord("").ok).toBe(false);
    expect(parseChord("   ")).toMatchObject({ empty: true });
    const unknown = parseChord("Cxyz");
    expect(unknown.ok).toBe(false);
    if (unknown.ok || "empty" in unknown) return;
    expect(unknown.error).toContain("无法识别");
  });
});

describe("invertIntervals", () => {
  it("rotates a triad into first and second inversion", () => {
    expect(invertIntervals([0, 4, 7], 0)).toEqual([0, 4, 7]);
    expect(invertIntervals([0, 4, 7], 1)).toEqual([4, 7, 12]);
    expect(invertIntervals([0, 4, 7], 2)).toEqual([7, 12, 16]);
  });
});
