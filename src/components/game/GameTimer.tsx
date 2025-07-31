
import React from 'react';

interface GameTimerProps {
  timeLeft: number;
  totalTime: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const GameTimer: React.FC<GameTimerProps> = ({ timeLeft, totalTime }) => {
  // progressPercentage represents the percentage of time that has *passed*.
  // It goes from 0 to 100 as timeLeft goes from totalTime to 0.
  const progressPercentage = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  
  // The rocket's visual path should stop just before the planet.
  // We'll clamp the rocket's max position at 96% to leave space for the planet icon.
  const rocketVisualPercentage = Math.min(96, Math.max(0, progressPercentage));
  
  const isTimeLow = timeLeft <= 15;

  return (
    <div className="w-full mb-4">
      {/* Rocket Timer Bar */}
      <div className="relative w-full bg-sky-200 rounded-full h-5 shadow-inner overflow-hidden border border-sky-300">
        {/* Fill (Represents Space the rocket has traveled) */}
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Thời gian còn lại"
        />

        {/* Rocket Icon */}
        <div
          className="absolute text-xl transition-all duration-1000 ease-linear"
          style={{
            left: `${rocketVisualPercentage}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
          aria-hidden="true"
        >
          🚀
        </div>

        {/* Finish Line Icon (Planet) */}
        <div
          className="absolute right-1 top-1/2 text-xl"
          style={{ transform: 'translateY(-50%)' }}
          aria-hidden="true"
        >
          🪐
        </div>
      </div>
      
      {/* Digital Clock - Moved down and with new blink animation */}
      <div className="flex justify-end pr-1 mt-1">
        <div className="inline-block bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm">
          <span className={`text-sm font-bold transition-colors ${isTimeLow ? 'text-red-600 animate-blink-warning' : 'text-gray-700'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameTimer;