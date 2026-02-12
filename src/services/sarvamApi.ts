import { SARVAM_STT_URL, SARVAM_STT_MODEL } from '../constants/config';
import { LanguageCode, SarvamSTTResponse } from '../types';

export async function transcribeAudio(
  audioBlob: Blob,
  languageCode: LanguageCode,
  apiKey: string
): Promise<SarvamSTTResponse> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  if (languageCode !== 'unknown') {
    formData.append('language_code', languageCode);
  }
  formData.append('model', SARVAM_STT_MODEL);

  const response = await fetch(SARVAM_STT_URL, {
    method: 'POST',
    headers: {
      'api-subscription-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Transcription failed (${response.status}): ${text}`);
  }

  return response.json();
}
