import React from 'react';

interface ProgressBarProps {
  current: number; // Percentage value (0-100)
  total: number;   // This will be 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const rawPercentage = total > 0 ? (current / total) * 100 : 0;
  // Ensure fillPercentage is strictly between 0 and 100 for the visual bar
  const fillPercentage = Math.min(Math.max(rawPercentage, 0), 100);

  // Clamp the rabbit's visual position to prevent it from going too far off edges or overlapping the carrot too much.
  // The rabbit's center is positioned at `rabbitVisualPercentage%`.
  // These values (e.g., 3% and 97%) create a small "margin" for the rabbit's travel path.
  const rabbitVisualPercentage = Math.min(97, Math.max(3, fillPercentage));

  return (
    <div className="relative w-full bg-gray-200 rounded-full h-5 mb-4 shadow-inner overflow-hidden">
      {/* Fill */}
      <div
        className="bg-pink-500 h-full rounded-full transition-all duration-300 ease-out"
        style={{ width: `${fillPercentage}%` }}
        role="progressbar"
        aria-valuenow={fillPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tiến độ trò chơi"
      />

      {/* Rabbit Icon */}
      <div
        className="absolute text-xl transition-all duration-300 ease-out" // text-xl for rabbit
        style={{
          left: `${rabbitVisualPercentage}%`, // Use clamped percentage for visual positioning
          bottom: '-2px', // Lowered the rabbit so its feet are on the bottom edge of the bar
          transform: 'translateX(-50%) scaleX(-1)', // Center horizontally then flip to face right
          zIndex: 1, // Ensure rabbit is above the fill bar
        }}
        aria-hidden="true"
      >
        🐇
      </div>

      {/* Finish Line Icon (Carrot) */}
      <div
        className="absolute right-0 top-1/2 text-xl" // text-xl for carrot
        style={{ transform: 'translateY(-50%)' }}
        aria-hidden="true"
      >
        🥕
      </div>
    </div>
  );
};

export default ProgressBar;