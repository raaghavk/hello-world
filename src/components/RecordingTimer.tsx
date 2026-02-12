import { formatDuration } from '../services/audioUtils';

interface Props {
  seconds: number;
}

export default function RecordingTimer({ seconds }: Props) {
  return (
    <div className="text-center">
      <span className="text-5xl font-mono font-bold text-gray-800 tabular-nums">
        {formatDuration(seconds)}
      </span>
    </div>
  );
}
