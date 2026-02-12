import { RecordingStatus } from '../types';

const STATUS_CONFIG: Record<RecordingStatus, { label: string; className: string }> = {
  recorded: { label: 'Ready', className: 'bg-gray-100 text-gray-700' },
  transcribing: { label: 'Transcribing...', className: 'bg-amber-100 text-amber-700' },
  transcribed: { label: 'Transcribed', className: 'bg-blue-100 text-blue-700' },
  summarizing: { label: 'Summarizing...', className: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  error: { label: 'Error', className: 'bg-red-100 text-red-700' },
};

interface Props {
  status: RecordingStatus;
}

export default function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
