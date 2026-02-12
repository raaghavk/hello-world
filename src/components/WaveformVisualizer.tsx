import { useRef, useEffect, useState } from 'react';

interface Props {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
}

export default function WaveformVisualizer({ analyserNode, isActive }: Props) {
  const [bars, setBars] = useState<number[]>(new Array(24).fill(4));
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!analyserNode || !isActive) {
      setBars(new Array(24).fill(4));
      return;
    }

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      analyserNode.getByteFrequencyData(dataArray);
      const step = Math.floor(bufferLength / 24);
      const newBars: number[] = [];
      for (let i = 0; i < 24; i++) {
        const value = dataArray[i * step];
        const height = Math.max(4, (value / 255) * 48);
        newBars.push(height);
      }
      setBars(newBars);
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyserNode, isActive]);

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-red-400 transition-all duration-75"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}
