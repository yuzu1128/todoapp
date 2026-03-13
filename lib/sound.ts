type SoundEffectName =
  | "dialog"
  | "dismiss"
  | "success"
  | "tab"
  | "toggle";

type ToneStep = {
  duration: number;
  frequency: number;
  gain: number;
  type?: OscillatorType;
};

const SOUND_LIBRARY: Record<SoundEffectName, ToneStep[]> = {
  tab: [
    { frequency: 420, duration: 0.05, gain: 0.04, type: "triangle" },
    { frequency: 610, duration: 0.04, gain: 0.03, type: "sine" },
  ],
  dialog: [
    { frequency: 520, duration: 0.04, gain: 0.04, type: "sine" },
    { frequency: 720, duration: 0.05, gain: 0.03, type: "triangle" },
  ],
  success: [
    { frequency: 520, duration: 0.05, gain: 0.05, type: "triangle" },
    { frequency: 780, duration: 0.08, gain: 0.04, type: "sine" },
  ],
  toggle: [
    { frequency: 460, duration: 0.04, gain: 0.04, type: "sine" },
    { frequency: 680, duration: 0.05, gain: 0.035, type: "triangle" },
  ],
  dismiss: [
    { frequency: 420, duration: 0.05, gain: 0.04, type: "triangle" },
    { frequency: 260, duration: 0.06, gain: 0.03, type: "sine" },
  ],
};

let audioContextInstance: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass =
    window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  audioContextInstance ??= new AudioContextClass();
  return audioContextInstance;
}

export async function primeAudioContext(): Promise<void> {
  const audioContext = getAudioContext();

  if (!audioContext) {
    return;
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume().catch(() => undefined);
  }
}

export async function playSoundEffect(name: SoundEffectName): Promise<void> {
  const audioContext = getAudioContext();

  if (!audioContext) {
    return;
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume().catch(() => undefined);
  }

  if (audioContext.state !== "running") {
    return;
  }

  const now = audioContext.currentTime;

  SOUND_LIBRARY[name].forEach((step, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const startTime = now + index * 0.035;
    const endTime = startTime + step.duration;

    oscillator.type = step.type ?? "sine";
    oscillator.frequency.setValueAtTime(step.frequency, startTime);
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(step.gain, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime + 0.01);
  });
}
