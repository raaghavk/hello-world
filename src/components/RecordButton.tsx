interface Props {
  isRecording: boolean;
  onTap: () => void;
}

export default function RecordButton({ isRecording, onTap }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 bg-red-400 rounded-full animate-pulse-ring" />
        )}
        <button
          onClick={onTap}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
            isRecording ? 'bg-red-700' : 'bg-red-600'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <div className="w-7 h-7 bg-white rounded-sm" />
          ) : (
            <div className="w-8 h-8 bg-white rounded-full" />
          )}
        </button>
      </div>
      <p className="text-lg font-medium text-gray-600">
        {isRecording ? 'Recording...' : 'Tap to Record'}
      </p>
    </div>
  );
}
