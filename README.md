# Desi AI Notetaker

A multilingual meeting recorder Progressive Web App (PWA) for the Indian market. Record meetings and voice notes, get AI-powered transcriptions in Indian languages, and generate smart summaries.

## Features

- **Record meetings** - One-tap recording with real-time audio visualization
- **10+ Indian languages** - Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Malayalam, Gujarati, Punjabi, and English
- **AI transcription** - Powered by Sarvam AI with auto language detection and Hindi-English code-mixing support
- **Smart summaries** - AI-generated meeting summaries with key points and action items
- **Works offline** - Recordings saved locally on your device; transcription when online
- **Installable PWA** - Add to your phone's home screen for a native app experience
- **Accessible design** - Large buttons, big text, simple navigation designed for all ages

## Tech Stack

- React 18 + TypeScript
- Vite + Tailwind CSS
- IndexedDB (via idb) for local storage
- Sarvam AI for speech-to-text and summarization
- PWA with Workbox service worker

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Setup

1. Get a Sarvam AI API key from [dashboard.sarvam.ai](https://dashboard.sarvam.ai)
2. Open the app and go to **Settings**
3. Paste your API key
4. Start recording!

## Supported Languages

| Language | Code |
|----------|------|
| Auto-detect | auto |
| Hindi | hi-IN |
| English | en-IN |
| Tamil | ta-IN |
| Telugu | te-IN |
| Kannada | kn-IN |
| Bengali | bn-IN |
| Marathi | mr-IN |
| Malayalam | ml-IN |
| Gujarati | gu-IN |
| Punjabi | pa-IN |
