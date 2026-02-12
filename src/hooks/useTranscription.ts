import { useState, useCallback } from 'react';
import { LanguageCode } from '../types';
import { transcribeAudio } from '../services/sarvamApi';

export function useTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(
    async (
      audioChunks: Blob[],
      languageCode: LanguageCode
    ): Promise<{ transcript: string; detectedLanguage: string }> => {
      setIsTranscribing(true);
      setError(null);

      try {
        const apiKey = localStorage.getItem('sarvam-api-key') || '';
        if (!apiKey) {
          throw new Error('Please add your Sarvam AI API key in Settings');
        }

        const transcriptParts: string[] = [];
        let detectedLang = '';

        for (let i = 0; i < audioChunks.length; i++) {
          const result = await transcribeAudio(audioChunks[i], languageCode, apiKey);
          transcriptParts.push(result.transcript);
          if (!detectedLang && result.language_code) {
            detectedLang = result.language_code;
          }
        }

        const transcript = transcriptParts.join('\n\n');
        return { transcript, detectedLanguage: detectedLang };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Transcription failed';
        setError(msg);
        throw err;
      } finally {
        setIsTranscribing(false);
      }
    },
    []
  );

  return { transcribe, isTranscribing, error };
}
