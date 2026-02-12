import { useState } from 'react';

interface Props {
  transcript: string;
}

export default function TranscriptView({ transcript }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">Transcript</h3>
        <button
          onClick={handleCopy}
          className="text-sm font-medium text-blue-600 active:text-blue-800 px-3 py-1 rounded-lg"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
          {transcript}
        </p>
      </div>
    </div>
  );
}
