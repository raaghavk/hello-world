import { SARVAM_CHAT_URL, SARVAM_CHAT_MODEL } from '../constants/config';
import { SarvamChatResponse } from '../types';

export async function summarizeTranscript(
  transcript: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(SARVAM_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey,
    },
    body: JSON.stringify({
      model: SARVAM_CHAT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful meeting notes assistant. Summarize the following transcript concisely.
Include: key topics discussed, decisions made, and action items if any.
Keep the summary in the same language as the transcript.
If the transcript is in a mix of languages, summarize in English.
Format as bullet points. Be concise - aim for 3-5 key points.`,
        },
        {
          role: 'user',
          content: `Please summarize this meeting transcript:\n\n${transcript}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Summarization failed (${response.status}): ${text}`);
  }

  const data: SarvamChatResponse = await response.json();
  return data.choices[0].message.content;
}
