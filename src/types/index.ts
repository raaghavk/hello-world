export interface Recording {
  id: string;
  title: string;
  createdAt: number;
  durationSeconds: number;
  audioBlob: Blob;
  audioChunks: Blob[];
  audioMimeType: string;
  status: RecordingStatus;
  languageCode: LanguageCode;
  transcript: string | null;
  summary: string | null;
  detectedLanguage: string | null;
  error: string | null;
}

export type RecordingStatus =
  | 'recorded'
  | 'transcribing'
  | 'transcribed'
  | 'summarizing'
  | 'completed'
  | 'error';

export type LanguageCode =
  | 'unknown'
  | 'hi-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'kn-IN'
  | 'bn-IN'
  | 'mr-IN'
  | 'ml-IN'
  | 'gu-IN'
  | 'pa-IN'
  | 'en-IN';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export interface SarvamSTTResponse {
  transcript: string;
  language_code: string;
}

export interface SarvamChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}
