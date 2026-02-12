import { useState, useCallback } from 'react';
import { summarizeTranscript } from '../services/summarizationApi';

export function useSummarization() {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = useCallback(async (transcript: string): Promise<string> => {
    setIsSummarizing(true);
    setError(null);

    try {
      const apiKey = localStorage.getItem('sarvam-api-key') || '';
      if (!apiKey) {
        throw new Error('Please add your Sarvam AI API key in Settings');
      }

      const summary = await summarizeTranscript(transcript, apiKey);
      return summary;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Summarization failed';
      setError(msg);
      throw err;
    } finally {
      setIsSummarizing(false);
    }
  }, []);

  return { summarize, isSummarizing, error };
}
