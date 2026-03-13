export type SoundEffectName =
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

const MASTER_GAIN = 0.22;
const SOUND_LIBRARY: Record<SoundEffectName, ToneStep[]> = {
  tab: [
    { frequency: 420, duration: 0.05, gain: 0.14, type: "triangle" },
    { frequency: 620, duration: 0.04, gain: 0.1, type: "sine" },
  ],
  dialog: [
    { frequency: 520, duration: 0.05, gain: 0.16, type: "sine" },
    { frequency: 760, duration: 0.06, gain: 0.12, type: "triangle" },
  ],
  success: [
    { frequency: 520, duration: 0.05, gain: 0.18, type: "triangle" },
    { frequency: 820, duration: 0.09, gain: 0.13, type: "sine" },
  ],
  toggle: [
    { frequency: 460, duration: 0.04, gain: 0.15, type: "sine" },
    { frequency: 700, duration: 0.05, gain: 0.12, type: "triangle" },
  ],
  dismiss: [
    { frequency: 420, duration: 0.05, gain: 0.14, type: "triangle" },
    { frequency: 260, duration: 0.07, gain: 0.1, type: "sine" },
  ],
};

let audioContextInstance: AudioContext | null = null;
let masterGainNode: GainNode | null = null;

function getAudioContextClass(): typeof AudioContext | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

function getAudioContext(): AudioContext | null {
  const AudioContextClass = getAudioContextClass();

  if (!AudioContextClass) {
    return null;
  }

  audioContextInstance ??= new AudioContextClass();
  return audioContextInstance;
}

function getMasterGain(audioContext: AudioContext): GainNode {
  if (masterGainNode) {
    return masterGainNode;
  }

  masterGainNode = audioContext.createGain();
  masterGainNode.gain.setValueAtTime(MASTER_GAIN, audioContext.currentTime);
  masterGainNode.connect(audioContext.destination);
  return masterGainNode;
}

function logAudioWarning(message: string, error?: unknown) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.warn(message, error);
}

export async function primeAudioContext(): Promise<boolean> {
  const audioContext = getAudioContext();

  if (!audioContext) {
    return false;
  }

  try {
    getMasterGain(audioContext);

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return audioContext.state === "running";
  } catch (error) {
    logAudioWarning("Failed to unlock audio context.", error);
    return false;
  }
}

export async function playSoundEffect(name: SoundEffectName): Promise<boolean> {
  const audioContext = getAudioContext();

  if (!audioContext) {
    return false;
  }

  const ready = await primeAudioContext();

  if (!ready) {
    return false;
  }

  const outputNode = getMasterGain(audioContext);
  const now = audioContext.currentTime;

  try {
    SOUND_LIBRARY[name].forEach((step, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const startTime = now + index * 0.04;
      const endTime = startTime + step.duration;

      oscillator.type = step.type ?? "sine";
      oscillator.frequency.setValueAtTime(step.frequency, startTime);
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.linearRampToValueAtTime(step.gain, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

      oscillator.connect(gainNode);
      gainNode.connect(outputNode);
      oscillator.start(startTime);
      oscillator.stop(endTime + 0.01);
    });

    return true;
  } catch (error) {
    logAudioWarning(`Failed to play sound effect: ${name}`, error);
    return false;
  }
}

export function resetSoundEngineForTest() {
  audioContextInstance = null;
  masterGainNode = null;
}
