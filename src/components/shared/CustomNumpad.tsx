import React, { forwardRef } from 'react';

interface CustomNumpadProps {
  onInput: (num: string) => void;
  onDelete: () => void;
  onEnter?: () => void; // Optional: for submission
}

const CustomNumpad = forwardRef<HTMLDivElement, CustomNumpadProps>(({ onInput, onDelete, onEnter }, ref) => {
  const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div ref={ref} className="bg-sky-100/80 backdrop-blur-sm p-3 rounded-lg shadow-md w-full max-w-sm mx-auto">
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {numpadKeys.map(num => (
          <button
            key={num}
            onClick={() => onInput(num)}
            className="py-3 text-3xl md:text-4xl font-bold rounded-md bg-white hover:bg-sky-50 transition-colors shadow-sm aspect-square flex items-center justify-center"
          >
            {num}
          </button>
        ))}
      </div>
      <div className={`grid ${onEnter ? 'grid-cols-2' : 'grid-cols-1'} gap-2 md:gap-3 mt-2 md:mt-3`}>
        <button
          onClick={onDelete}
          className="py-3 text-2xl font-bold rounded-md bg-rose-200 hover:bg-rose-300 transition-colors shadow-sm"
        >
          Xóa
        </button>
        {onEnter && (
          <button
            onClick={onEnter}
            className="py-3 text-2xl font-bold rounded-md bg-green-200 hover:bg-green-300 transition-colors shadow-sm"
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
});
CustomNumpad.displayName = 'CustomNumpad';

export default CustomNumpad;