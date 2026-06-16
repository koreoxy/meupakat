'use client';

import { useState, useEffect, useRef } from 'react';

interface UseSilenceDetectorOptions {
  isRecording: boolean;
  thresholdDecibels?: number; // default -55dB
  silenceDurationMs?: number; // default 1500ms
}

/**
 * Hook to monitor microphone input and detect if the user is silent.
 * Returns true if silence is detected for longer than silenceDurationMs.
 */
export function useSilenceDetector({
  isRecording,
  thresholdDecibels = -55,
  silenceDurationMs = 1500,
}: UseSilenceDetectorOptions): boolean {
  const [isSilent, setIsSilent] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording) {
      cleanup();
      setIsSilent(false);
      return;
    }

    async function initAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);

        silenceStartRef.current = null;
        setIsSilent(false);

        const checkAudio = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getFloatTimeDomainData(dataArray);

          // Calculate RMS (Root Mean Square)
          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sumSquares += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);

          // Convert RMS to Decibels
          const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;

          if (db < thresholdDecibels) {
            // Silent frame
            if (silenceStartRef.current === null) {
              silenceStartRef.current = Date.now();
            } else {
              const silentDuration = Date.now() - silenceStartRef.current;
              if (silentDuration >= silenceDurationMs) {
                setIsSilent(true);
              }
            }
          } else {
            // User is speaking
            silenceStartRef.current = null;
            setIsSilent(false);
          }

          animationFrameRef.current = requestAnimationFrame(checkAudio);
        };

        checkAudio();
      } catch (err) {
        console.error('Error initializing silence detector:', err);
        setIsSilent(false);
      }
    }

    initAudio();

    return () => {
      cleanup();
    };
  }, [isRecording, thresholdDecibels, silenceDurationMs]);

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    silenceStartRef.current = null;
  };

  return isSilent;
}
