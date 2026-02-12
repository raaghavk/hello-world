import { useNavigate } from 'react-router-dom';
import { Recording } from '../types';
import StatusBadge from './StatusBadge';
import { formatDurationLong } from '../services/audioUtils';

interface Props {
  recording: Recording;
}

export default function RecordingCard({ recording }: Props) {
  const navigate = useNavigate();
  const date = new Date(recording.createdAt);
  const dateStr = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <button
      onClick={() => navigate(`/recording/${recording.id}`)}
      className="card w-full text-left flex items-center gap-3 active:bg-gray-50 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {recording.title}
        </h3>
        <p className="text-sm text-gray-500">
          {dateStr} at {timeStr} &middot; {formatDurationLong(recording.durationSeconds)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <StatusBadge status={recording.status} />
      </div>
      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
}
