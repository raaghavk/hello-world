import { useNavigate } from 'react-router-dom';
import { useRecordings } from '../hooks/useRecordings';
import RecordingCard from '../components/RecordingCard';
import EmptyState from '../components/EmptyState';

export default function HomePage() {
  const navigate = useNavigate();
  const { recordings, isLoading } = useRecordings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* New Recording button */}
      <button
        onClick={() => navigate('/record')}
        className="btn-primary w-full flex items-center justify-center gap-2 mb-6"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
        New Recording
      </button>

      {recordings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-800">
            Your Recordings ({recordings.length})
          </h2>
          {recordings.map((rec) => (
            <RecordingCard key={rec.id} recording={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
