import { useState, useCallback } from 'react';
import { LanguageCode } from '../types';
import { transcribeAudio } from '../services/sarvamApi';

const DEMO_TRANSCRIPTS: Record<string, string[]> = {
  'hi-IN': [
    'नमस्ते, आज की मीटिंग में हम नए प्रोजेक्ट के बारे में बात करेंगे। पहले हम बजट पर चर्चा करते हैं। इस तिमाही में हमें पच्चीस लाख रुपये का बजट मिला है।',
    'अगला पॉइंट है टीम हायरिंग। हमें दो नए डेवलपर्स और एक डिज़ाइनर की ज़रूरत है। HR टीम ने कहा कि वो अगले हफ्ते तक शॉर्टलिस्ट भेज देंगे।',
    'लॉन्च की डेडलाइन पंद्रह मार्च है। सबको अपना-अपना काम टाइम पर पूरा करना होगा। कोई भी प्रॉब्लम हो तो तुरंत बताओ।',
  ],
  'ta-IN': [
    'வணக்கம், இன்றைய கூட்டத்தில் புதிய திட்டத்தைப் பற்றி பேசுவோம்। இந்த காலாண்டில் நமக்கு இருபத்தைந்து லட்சம் ரூபாய் பட்ஜெட் கிடைத்துள்ளது.',
    'டெவலப்மென்ட் டீம் இரண்டு புதிய என்ஜினியர்களை நியமிக்க வேண்டும். அடுத்த வாரம் இன்டர்வியூ நடக்கும்.',
  ],
  'en-IN': [
    'Good morning everyone, thank you for joining today\'s meeting. Let\'s start with the project status update. The development team has completed the backend API.',
    'We are now working on the mobile app integration. Testing is scheduled for next week. Regarding the budget, we have approval for hiring two more engineers.',
    'Action items: Rahul will prepare the testing plan by Friday. Priya will coordinate with the design team for the UI review. Next meeting is on Monday at 10 AM.',
  ],
  'default': [
    'Meeting started. The team discussed the quarterly goals and project milestones. The product launch is on track.',
    'Marketing campaign will begin next month. Customer feedback has been positive so far. Action items were assigned to each team member with deadlines.',
    'Follow-up meeting scheduled for next week. Budget review pending approval from management.',
  ],
};

function getDemoTranscript(languageCode: LanguageCode, chunkCount: number): string[] {
  const transcripts = DEMO_TRANSCRIPTS[languageCode] || DEMO_TRANSCRIPTS['default'];
  const result: string[] = [];
  for (let i = 0; i < chunkCount; i++) {
    result.push(transcripts[i % transcripts.length]);
  }
  return result;
}

function isDemoMode(): boolean {
  return localStorage.getItem('demo-mode') !== 'false';
}

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

        // Demo mode: return mock transcript
        if (!apiKey || isDemoMode()) {
          await new Promise((r) => setTimeout(r, 1500));
          const parts = getDemoTranscript(languageCode, Math.max(audioChunks.length, 1));
          const detectedLang = languageCode === 'unknown' ? 'hi-IN' : languageCode;
          return {
            transcript: parts.join('\n\n'),
            detectedLanguage: detectedLang,
          };
        }

        // Real API mode
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
