import { useState, useCallback } from 'react';
import { summarizeTranscript } from '../services/summarizationApi';

const DEMO_SUMMARIES: Record<string, string> = {
  'hi-IN': `• बजट: इस तिमाही का बजट 25 लाख रुपये approve हुआ है
• हायरिंग: 2 डेवलपर्स और 1 डिज़ाइनर की भर्ती होगी, HR अगले हफ्ते शॉर्टलिस्ट भेजेगा
• डेडलाइन: प्रोजेक्ट लॉन्च 15 मार्च तक - सबको टाइम पर काम पूरा करना है
• Action Item: कोई भी problem हो तो तुरंत report करें`,

  'ta-IN': `• பட்ஜெட்: இந்த காலாண்டுக்கு 25 லட்சம் ரூபாய் ஒதுக்கப்பட்டுள்ளது
• நியமனம்: 2 புதிய என்ஜினியர்கள் நியமிக்கப்படுவார்கள்
• அடுத்த வாரம் இன்டர்வியூ நடைபெறும்`,

  'en-IN': `• Project Status: Backend API completed, now integrating mobile app
• Testing: Scheduled for next week
• Hiring: Approved to hire 2 more engineers, recruitment starting immediately
• Action Items:
  - Rahul: Testing plan by Friday
  - Priya: UI review coordination with design team
• Next Meeting: Monday at 10 AM`,

  'default': `• Quarterly goals and project milestones reviewed - launch on track
• Marketing campaign launching next month
• Customer feedback has been positive
• Action items assigned with deadlines to all team members
• Follow-up meeting next week, budget review pending`,
};

function isDemoMode(): boolean {
  return localStorage.getItem('demo-mode') !== 'false';
}

function getDemoSummary(transcript: string): string {
  // Try to detect language from transcript content
  if (/[\u0900-\u097F]/.test(transcript)) return DEMO_SUMMARIES['hi-IN'];
  if (/[\u0B80-\u0BFF]/.test(transcript)) return DEMO_SUMMARIES['ta-IN'];
  if (/meeting|project|team|action/i.test(transcript)) return DEMO_SUMMARIES['en-IN'];
  return DEMO_SUMMARIES['default'];
}

export function useSummarization() {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = useCallback(async (transcript: string): Promise<string> => {
    setIsSummarizing(true);
    setError(null);

    try {
      const apiKey = localStorage.getItem('sarvam-api-key') || '';

      // Demo mode: return mock summary
      if (!apiKey || isDemoMode()) {
        await new Promise((r) => setTimeout(r, 1200));
        return getDemoSummary(transcript);
      }

      // Real API mode
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
