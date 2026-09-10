"use client";

import { BLACK_KEYS, WHITE_KEYS, keyName } from "@/lib/chords";

type PianoProps = {
  activeKeys: number[];
  bassKey?: number;
  noteLabels?: Record<number, string>;
  onPlayKey?: (index: number) => void;
};

const WHITE_WIDTH = 100 / WHITE_KEYS.length;
const BLACK_WIDTH = WHITE_WIDTH * 0.58;

function blackKeyStyle(index: number): { left: string; width: string } {
  const whitesBefore = WHITE_KEYS.filter((key) => key < index).length;
  const left = whitesBefore * WHITE_WIDTH - BLACK_WIDTH / 2;
  return { left: `${left}%`, width: `${BLACK_WIDTH}%` };
}

export function Piano({ activeKeys, bassKey, noteLabels = {}, onPlayKey }: PianoProps) {
  const active = new Set(activeKeys);

  return (
    <div className="piano-shell">
      <div className="piano" role="group" aria-label="两八度钢琴键盘">
        <div className="piano-whites">
          {WHITE_KEYS.map((index) => {
            const isActive = active.has(index);
            const isBass = bassKey === index;
            const label = noteLabels[index] ?? keyName(index);
            return (
              <button
                key={index}
                type="button"
                className={`key key-white${isActive ? " is-active" : ""}${isBass ? " is-bass" : ""}`}
                aria-label={`${label} 键`}
                aria-pressed={isActive}
                onClick={() => onPlayKey?.(index)}
              >
                <span className="key-label">{isActive ? label : keyName(index)}</span>
              </button>
            );
          })}
        </div>
        <div className="piano-blacks">
          {[...BLACK_KEYS].map((index) => {
            const isActive = active.has(index);
            const isBass = bassKey === index;
            const label = noteLabels[index] ?? keyName(index);
            return (
              <button
                key={index}
                type="button"
                className={`key key-black${isActive ? " is-active" : ""}${isBass ? " is-bass" : ""}`}
                style={blackKeyStyle(index)}
                aria-label={`${label} 键`}
                aria-pressed={isActive}
                onClick={() => onPlayKey?.(index)}
              >
                {isActive ? <span className="key-label">{label}</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
