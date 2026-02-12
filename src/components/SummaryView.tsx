import { useState } from 'react';

interface Props {
  summary: string;
}

export default function SummaryView({ summary }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Meeting Summary', text: summary });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="card bg-blue-50 border-blue-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">Summary</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="text-sm font-medium text-blue-600 active:text-blue-800 px-3 py-1 rounded-lg"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleShare}
            className="text-sm font-medium text-blue-600 active:text-blue-800 px-3 py-1 rounded-lg"
          >
            Share
          </button>
        </div>
      </div>
      <div className="prose prose-sm max-w-none">
        <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
          {summary}
        </p>
      </div>
    </div>
  );
}
