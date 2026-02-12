import { useState, useRef, useCallback, useEffect } from 'react';
import { PREFERRED_MIME_TYPE, FALLBACK_MIME_TYPES, AUDIO_CHUNK_DURATION_MS } from '../constants/config';

function getSupportedMimeType(): string {
  if (typeof MediaRecorder !== 'undefined') {
    if (MediaRecorder.isTypeSupported(PREFERRED_MIME_TYPE)) return PREFERRED_MIME_TYPE;
    for (const mt of FALLBACK_MIME_TYPES) {
      if (MediaRecorder.isTypeSupported(mt)) return mt;
    }
  }
  return '';
}

interface RecordingResult {
  audioBlob: Blob;
  audioChunks: Blob[];
  mimeType: string;
  durationSeconds: number;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const resolveStopRef = useRef<((result: RecordingResult) => void) | null>(null);
  const mimeTypeRef = useRef<string>('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio context for visualization
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      setAnalyserNode(analyser);

      // Set up MediaRecorder
      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const options: MediaRecorderOptions = {};
      if (mimeType) options.mimeType = mimeType;

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const chunks = chunksRef.current;
        const finalMime = mimeType || 'audio/webm';
        const audioBlob = new Blob(chunks, { type: finalMime });
        const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

        if (resolveStopRef.current) {
          resolveStopRef.current({
            audioBlob,
            audioChunks: [...chunks],
            mimeType: finalMime,
            durationSeconds,
          });
          resolveStopRef.current = null;
        }
      };

      // Start recording with timeslice for chunked output
      recorder.start(AUDIO_CHUNK_DURATION_MS);
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setElapsedSeconds(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not access microphone';
      setError(msg);
    }
  }, []);

  const stopRecording = useCallback((): Promise<RecordingResult> => {
    return new Promise((resolve) => {
      resolveStopRef.current = resolve;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setIsRecording(false);
      setAnalyserNode(null);
    });
  }, []);

  return { isRecording, elapsedSeconds, analyserNode, startRecording, stopRecording, error };
}
