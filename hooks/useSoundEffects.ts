"use client";

import { useEffect } from "react";

import { playSoundEffect, primeAudioContext } from "@/lib/sound";
import { useSettingsStore } from "@/stores/settingsStore";

export function useSoundEffects() {
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const initializeSettings = useSettingsStore((state) => state.initialize);
  const initialized = useSettingsStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      void initializeSettings();
    }
  }, [initializeSettings, initialized]);

  useEffect(() => {
    const handlePrime = () => {
      void primeAudioContext();
    };

    window.addEventListener("pointerdown", handlePrime, { passive: true });
    window.addEventListener("keydown", handlePrime);

    return () => {
      window.removeEventListener("pointerdown", handlePrime);
      window.removeEventListener("keydown", handlePrime);
    };
  }, []);

  return {
    play: (name: Parameters<typeof playSoundEffect>[0]) => {
      if (!soundEnabled) {
        return;
      }

      void playSoundEffect(name);
    },
  };
}
