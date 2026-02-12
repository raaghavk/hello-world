import { useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { LANGUAGES } from '../constants/languages';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('unknown');
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [demoMode, setDemoMode] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(localStorage.getItem('sarvam-api-key') || '');
    setPreferredLanguage(
      (localStorage.getItem('preferred-language') as LanguageCode) || 'unknown'
    );
    setAutoTranscribe(localStorage.getItem('auto-transcribe') !== 'false');
    setDemoMode(localStorage.getItem('demo-mode') !== 'false');
  }, []);

  const handleSave = () => {
    localStorage.setItem('sarvam-api-key', apiKey);
    localStorage.setItem('preferred-language', preferredLanguage);
    localStorage.setItem('auto-transcribe', String(autoTranscribe));
    localStorage.setItem('demo-mode', String(demoMode));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="px-4 py-4 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Demo Mode */}
      <div className="card border-2 border-amber-200 bg-amber-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Demo Mode</h3>
            <p className="text-sm text-gray-600">
              Try the app with sample transcriptions - no API key needed!
            </p>
          </div>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              demoMode ? 'bg-amber-500' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={demoMode}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                demoMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {demoMode && (
          <p className="text-xs text-amber-700 mt-2 bg-amber-100 rounded-lg px-3 py-2">
            Demo mode is ON. Transcription and summary will use sample data. Turn off and add an API key for real AI processing.
          </p>
        )}
      </div>

      {/* API Key */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Sarvam AI API Key</h3>
        <p className="text-sm text-gray-500 mb-3">
          Required for transcription and summarization.
          Get your key from{' '}
          <a
            href="https://dashboard.sarvam.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            dashboard.sarvam.ai
          </a>
        </p>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full px-4 py-3 pr-16 text-base rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Preferred Language */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Default Language</h3>
        <p className="text-sm text-gray-500 mb-3">
          Choose the default language for new recordings.
        </p>
        <select
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
          className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label} {lang.code !== 'unknown' ? `(${lang.nativeLabel})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Auto-transcribe toggle */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Auto-transcribe</h3>
            <p className="text-sm text-gray-500">
              Automatically start transcription after recording
            </p>
          </div>
          <button
            onClick={() => setAutoTranscribe(!autoTranscribe)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              autoTranscribe ? 'bg-red-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={autoTranscribe}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                autoTranscribe ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save button */}
      <button onClick={handleSave} className="btn-primary w-full">
        {saved ? 'Saved!' : 'Save Settings'}
      </button>

      {/* About */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-2">About</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          <strong>Desi AI Notetaker</strong> helps you record meetings and voice notes,
          then transcribes them in Indian languages using AI. Your recordings are stored
          locally on your device and never uploaded without your permission.
        </p>
        <p className="text-xs text-gray-400 mt-3">Version 0.1.0</p>
      </div>
    </div>
  );
}
