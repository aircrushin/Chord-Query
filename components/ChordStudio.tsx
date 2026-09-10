"use client";

import { FormEvent, useMemo, useState } from "react";
import { Piano } from "@/components/Piano";
import { playKey, playKeys, unlockAudio } from "@/lib/audio";
import {
  keysForVoicing,
  parseChord,
  type ChordResult,
} from "@/lib/chords";
import { PRESETS } from "@/lib/presets";

const INVERSION_LABELS = ["原位", "第一转位", "第二转位", "第三转位", "第四转位", "第五转位", "第六转位"];

function inversionLabel(index: number): string {
  if (index === 0) return "原位";
  return INVERSION_LABELS[index] ?? `第${index}转位`;
}

export function ChordStudio() {
  const [query, setQuery] = useState("Cmaj7");
  const [inversion, setInversion] = useState(0);
  const [playMode, setPlayMode] = useState<"chord" | "arpeggio">("chord");

  const parsed = useMemo(() => parseChord(query), [query]);
  const chord: ChordResult | null = parsed.ok ? parsed.chord : null;
  const maxInversion = chord ? Math.max(0, chord.intervals.length - 1) : 0;
  const safeInversion = Math.min(inversion, maxInversion);
  const activeKeys = chord ? keysForVoicing(chord, chord.bass ? 0 : safeInversion) : [];

  const noteLabels = useMemo(() => {
    if (!chord) return {};
    const labels: Record<number, string> = {};
    for (let key = 0; key < 24; key += 1) {
      const pc = ((key % 12) + 12) % 12;
      const noteIndex = chord.intervals.findIndex(
        (interval) => (((chord.rootPc + interval) % 12) + 12) % 12 === pc,
      );
      if (noteIndex >= 0) labels[key] = chord.notes[noteIndex];
    }
    if (chord.bassKey !== undefined && chord.bass) {
      labels[chord.bassKey] = chord.bass;
    }
    return labels;
  }, [chord]);

  function applyQuery(next: string) {
    setQuery(next);
    setInversion(0);
  }

  function handlePlay() {
    unlockAudio();
    if (activeKeys.length === 0) return;
    playKeys(activeKeys, playMode);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    handlePlay();
  }

  const error = !parsed.ok && !("empty" in parsed) ? parsed.error : null;

  return (
    <div className="stage">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <p className="brand-kicker">Piano voicing</p>
            <h1 className="brand-title">Chord Query</h1>
          </div>
        </div>
        <p className="brand-side">输入和弦名，立刻看到指法</p>
      </header>

      <section className="hero">
        <form className="search" onSubmit={handleSubmit}>
          <label className="search-label" htmlFor="chord-input">
            和弦名称
          </label>
          <input
            id="chord-input"
            className={`search-input${error ? " has-error" : ""}`}
            value={query}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            placeholder="Cmaj7"
            aria-invalid={Boolean(error)}
            aria-describedby="chord-status"
            onChange={(event) => applyQuery(event.target.value)}
          />
          <div className="search-actions">
            <button type="submit" className="play-button" disabled={!chord}>
              播放
            </button>
            <button
              type="button"
              className={`ghost-button${playMode === "arpeggio" ? " is-on" : ""}`}
              onClick={() => setPlayMode((mode) => (mode === "chord" ? "arpeggio" : "chord"))}
            >
              {playMode === "chord" ? "柱式" : "分解"}
            </button>
          </div>
        </form>

        <div id="chord-status" className="status" aria-live="polite">
          {chord ? (
            <>
              <p className="status-symbol">{chord.symbol}</p>
              <p className="status-name">
                {chord.qualityName}
                <span>{chord.qualityNameEn}</span>
              </p>
            </>
          ) : error ? (
            <p className="status-error">{error}</p>
          ) : (
            <p className="status-empty">试着输入 C、Dm7、G7 或点选常用和弦</p>
          )}
        </div>

        <div className="presets" role="list">
          {PRESETS.map((preset) => (
            <button
              key={preset.symbol}
              type="button"
              role="listitem"
              className={`preset${query.replace(/\s+/g, "") === preset.symbol ? " is-selected" : ""}`}
              onClick={() => applyQuery(preset.symbol)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section className="keyboard-panel">
        <Piano
          activeKeys={activeKeys}
          bassKey={chord?.bassKey}
          noteLabels={noteLabels}
          onPlayKey={(index) => {
            unlockAudio();
            playKey(index);
          }}
        />
        <div className="legend">
          <span>
            <i className="swatch swatch-gold" />
            和弦音
          </span>
          <span>
            <i className="swatch swatch-bass" />
            斜杠低音
          </span>
          <span>点击琴键可试听单音，回车播放整个和弦</span>
        </div>
      </section>

      <section className="details">
        <article className="detail-card">
          <h2>组成音</h2>
          <p className="detail-value">{chord ? chord.notes.join("  ·  ") : "—"}</p>
        </article>
        <article className="detail-card">
          <h2>音程</h2>
          <p className="detail-value">{chord ? chord.degrees.join("  ·  ") : "—"}</p>
        </article>
        <article className="detail-card">
          <h2>转位</h2>
          {chord ? (
            <div className="inversion-row">
              {Array.from({ length: maxInversion + 1 }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`inversion${safeInversion === index ? " is-selected" : ""}`}
                  onClick={() => setInversion(index)}
                  disabled={Boolean(chord.bass)}
                >
                  {inversionLabel(index)}
                </button>
              ))}
            </div>
          ) : (
            <p className="detail-value">—</p>
          )}
          {chord?.bass ? <p className="hint">斜杠和弦已指定低音，转位保持原位以便看清低音</p> : null}
        </article>
      </section>

      <footer className="foot">
        <p>
          支持 C♯ / Db、大小增减、七到十三和弦、sus / add、6/9 与斜杠和弦。旧版 PyQt 程序仍保留在
          <code>legacy/</code>。
        </p>
      </footer>
    </div>
  );
}
