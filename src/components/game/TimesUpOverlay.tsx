import React from 'react';

const TimesUpOverlay: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="timesUpTitle"
    >
      <div 
        className="bg-gradient-to-br from-red-400 to-orange-500 text-white p-8 rounded-2xl shadow-2xl text-center transform animate-pop-scale"
      >
        <span className="text-7xl md:text-8xl" role="img" aria-label="Clock emoji">⏰</span>
        <h2 
          id="timesUpTitle" 
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mt-4"
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
        >
          Hết giờ!
        </h2>
      </div>
    </div>
  );
};

export default TimesUpOverlay;
