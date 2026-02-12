import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useRecordings } from '../hooks/useRecordings';
import RecordButton from '../components/RecordButton';
import RecordingTimer from '../components/RecordingTimer';
import WaveformVisualizer from '../components/WaveformVisualizer';
import { LanguageCode } from '../types';
import { LANGUAGES } from '../constants/languages';

export default function RecordPage() {
  const navigate = useNavigate();
  const { isRecording, elapsedSeconds, analyserNode, startRecording, stopRecording, error } =
    useAudioRecorder();
  const { addRecording } = useRecordings();
  const [language, setLanguage] = useState<LanguageCode>(
    () => (localStorage.getItem('preferred-language') as LanguageCode) || 'unknown'
  );
  const [saving, setSaving] = useState(false);

  const handleTap = async () => {
    if (isRecording) {
      setSaving(true);
      try {
        const result = await stopRecording();
        const now = new Date();
        const title = `Recording - ${now.toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
        })}, ${now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        })}`;

        const recording = {
          id: crypto.randomUUID(),
          title,
          createdAt: Date.now(),
          durationSeconds: result.durationSeconds,
          audioBlob: result.audioBlob,
          audioChunks: result.audioChunks,
          audioMimeType: result.mimeType,
          status: 'recorded' as const,
          languageCode: language,
          transcript: null,
          summary: null,
          detectedLanguage: null,
          error: null,
        };

        await addRecording(recording);
        navigate(`/recording/${recording.id}`);
      } catch {
        // Error handled by the hook
      } finally {
        setSaving(false);
      }
    } else {
      await startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 gap-8">
      {/* Language selector */}
      <div className="w-full max-w-xs">
        <label htmlFor="language" className="block text-sm font-medium text-gray-600 mb-1 text-center">
          Recording Language
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
          disabled={isRecording}
          className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label} {lang.code !== 'unknown' ? `(${lang.nativeLabel})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Timer */}
      <RecordingTimer seconds={elapsedSeconds} />

      {/* Waveform */}
      <WaveformVisualizer analyserNode={analyserNode} isActive={isRecording} />

      {/* Record button */}
      <RecordButton isRecording={isRecording} onTap={handleTap} />

      {/* Saving indicator */}
      {saving && (
        <p className="text-base text-gray-500 animate-pulse">Saving recording...</p>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-xs">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Hint text */}
      {!isRecording && !saving && (
        <p className="text-sm text-gray-400 text-center max-w-xs">
          Your recording will be saved on this device. Transcription requires an internet connection.
        </p>
      )}
    </div>
  );
}
