const BASE_MIDI = 60;

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

export function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

function playVoice(context: AudioContext, frequency: number, when: number, duration: number) {
  const master = context.createGain();
  const filter = context.createBiquadFilter();
  const oscA = context.createOscillator();
  const oscB = context.createOscillator();
  const gainA = context.createGain();
  const gainB = context.createGain();

  oscA.type = "triangle";
  oscB.type = "sine";
  oscA.frequency.setValueAtTime(frequency, when);
  oscB.frequency.setValueAtTime(frequency * 2.003, when);
  gainA.gain.value = 0.24;
  gainB.gain.value = 0.05;

  filter.type = "lowpass";
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(2100, when);
  filter.frequency.exponentialRampToValueAtTime(900, when + duration * 0.7);

  master.gain.setValueAtTime(0.0001, when);
  master.gain.exponentialRampToValueAtTime(0.9, when + 0.016);
  master.gain.exponentialRampToValueAtTime(0.28, when + 0.22);
  master.gain.exponentialRampToValueAtTime(0.0001, when + duration);

  oscA.connect(gainA).connect(filter);
  oscB.connect(gainB).connect(filter);
  filter.connect(master);
  master.connect(context.destination);

  oscA.start(when);
  oscB.start(when);
  oscA.stop(when + duration + 0.05);
  oscB.stop(when + duration + 0.05);
}

export function playKey(index: number, duration = 0.9) {
  const context = getContext();
  if (!context) return;
  playVoice(context, midiToFreq(BASE_MIDI + index), context.currentTime + 0.01, duration);
}

export function playKeys(indices: number[], mode: "chord" | "arpeggio" = "chord") {
  const context = getContext();
  if (!context || indices.length === 0) return;
  const unique = [...new Set(indices)];
  const now = context.currentTime + 0.02;
  unique.forEach((index, i) => {
    const delay = mode === "arpeggio" ? i * 0.13 : i * 0.02;
    const duration = mode === "arpeggio" ? 1.55 : 1.4;
    playVoice(context, midiToFreq(BASE_MIDI + index), now + delay, duration);
  });
}

export function unlockAudio() {
  getContext();
}
