import React, { useEffect, useRef } from 'react';

export const AudioVisualizer = ({
  getAnalyserData,
  isPlaying,
  accentColor = '#c6ff34',
  height = 64,
  barCount = 32,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dataArray = isPlaying ? getAnalyserData() : null;
      const width = canvas.width;
      const h = canvas.height;
      const barWidth = Math.floor(width / barCount) - 2;

      if (dataArray && dataArray.length > 0) {
        const step = Math.floor(dataArray.length / barCount);

        for (let i = 0; i < barCount; i++) {
          const value = dataArray[i * step] || 0;
          const barHeight = Math.max(4, Math.floor((value / 255) * h));
          const x = i * (barWidth + 2);
          const y = h - barHeight;

          // Draw neon bar
          const gradient = ctx.createLinearGradient(0, h, 0, 0);
          gradient.addColorStop(0, '#171717');
          gradient.addColorStop(1, accentColor);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();
        }
      } else {
        // Idle ambient waves when paused or no signal
        const time = Date.now() / 300;
        for (let i = 0; i < barCount; i++) {
          const barHeight = isPlaying
            ? Math.floor(Math.sin(time + i * 0.3) * 12 + 18)
            : Math.floor(Math.sin(time + i * 0.15) * 4 + 6);
          const x = i * (barWidth + 2);
          const y = h - barHeight;

          ctx.fillStyle = accentColor;
          ctx.globalAlpha = isPlaying ? 0.8 : 0.25;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [getAnalyserData, isPlaying, accentColor, barCount]);

  return (
    <div className="w-full overflow-hidden flex items-end justify-center py-1">
      <canvas
        ref={canvasRef}
        width={320}
        height={height}
        className="w-full max-w-sm h-auto block rounded-lg"
      />
    </div>
  );
};
