import { useRef, useState, useEffect } from 'react';
import { formatDuration } from '../services/audioUtils';

interface Props {
  audioBlob: Blob;
  mimeType: string;
}

export default function AudioPlayer({ audioBlob, mimeType }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const urlRef = useRef<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(new Blob([audioBlob], { type: mimeType }));
    urlRef.current = url;
    return () => URL.revokeObjectURL(url);
  }, [audioBlob, mimeType]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
  };

  return (
    <div className="card flex items-center gap-3">
      <audio
        ref={audioRef}
        src={urlRef.current}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
      />
      <button
        onClick={togglePlay}
        className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 active:bg-red-700"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
        />
        <div className="flex justify-between text-xs text-gray-500 font-mono">
          <span>{formatDuration(Math.round(currentTime))}</span>
          <span>{formatDuration(Math.round(duration))}</span>
        </div>
      </div>
    </div>
  );
}
