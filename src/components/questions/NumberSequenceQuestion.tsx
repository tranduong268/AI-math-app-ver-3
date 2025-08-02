import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NumberSequenceQuestion, FillInTheBlanksQuestion, FindAndFixErrorQuestion, SortSequenceQuestion } from '../../../types';
import { useAudio } from '../../contexts/AudioContext';
import { theme } from '../../config/theme';
import { QuestionComponentProps } from './QuestionProps';
import CustomNumpad from '../shared/CustomNumpad';


// --- Helper to render the styled prompt ---
const StyledPrompt = ({ text }: { text: string }) => {
  const parts = text.split(/(\d+)/);
  return (
    <>
      {parts.map((part, index) => {
        if (/\d+/.test(part)) {
          return <strong key={index} className={`${theme.colors.text.promptHighlightNumber} ${theme.fontSizes.promptHighlightNumber} mx-1 align-middle`}>{part}</strong>;
        }
        return <span key={index} className="align-middle">{part}</span>;
      })}
    </>
  );
};

// --- Find and Fix Error Component ---
const FindAndFixErrorDisplay: React.FC<QuestionComponentProps<FindAndFixErrorQuestion>> = ({ question, onAnswer, disabled }) => {
  const { playSound } = useAudio();
  const [corrections, setCorrections] = useState<Record<number, string>>({});
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const numErrors = Object.keys(question.errors).length;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const numpadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCorrections({});
    setActiveIndex(null);
  }, [question.id]);

  const handleItemClick = (index: number) => {
    if (disabled) return;
    playSound('BUTTON_CLICK');
    setActiveIndex(index);
    setCorrections(prev => ({ ...prev, [index]: '' }));
  };
  
  const handleSubmit = useCallback(() => {
    if (disabled || Object.keys(corrections).filter(k => corrections[Number(k)]).length < numErrors) return;
    playSound('DECISION');
    
    const numericCorrections: Record<number, number> = {};
    for (const key in corrections) {
      const numValue = parseInt(corrections[key], 10);
      if (!isNaN(numValue)) {
        numericCorrections[key] = numValue;
      }
    }
    onAnswer(JSON.stringify(numericCorrections));
  }, [disabled, corrections, numErrors, onAnswer, playSound]);

  const handleNumpadInput = useCallback((num: string) => {
    if (activeIndex === null) return;
    playSound('TYPE');
    setCorrections(prev => {
      const newCorrections = { ...prev };
      const currentVal = newCorrections[activeIndex] || '';
      if (currentVal.length < 2) {
        newCorrections[activeIndex] = currentVal + num;
      }
      return newCorrections;
    });
  }, [activeIndex, playSound]);

  const handleNumpadDelete = useCallback(() => {
    if (activeIndex === null) return;
    playSound('TYPE');
    setCorrections(prev => {
      const newCorrections = { ...prev };
      newCorrections[activeIndex] = (newCorrections[activeIndex] || '').slice(0, -1);
      return newCorrections;
    });
  }, [activeIndex, playSound]);

  useEffect(() => {
    if (disabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeIndex === null && event.key !== 'Enter') return;
      if (event.key >= '0' && event.key <= '9') handleNumpadInput(event.key);
      else if (event.key === 'Backspace') handleNumpadDelete();
      else if (event.key === 'Enter') { event.preventDefault(); handleSubmit(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, activeIndex, handleNumpadInput, handleNumpadDelete, handleSubmit]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeIndex !== null &&
        containerRef.current && !containerRef.current.contains(event.target as Node) &&
        numpadRef.current && !numpadRef.current.contains(event.target as Node)
      ) {
        const index = activeIndex;
        if (!corrections[index]) {
            const revertedCorrections = { ...corrections };
            delete revertedCorrections[index];
            setCorrections(revertedCorrections);
        }
        setActiveIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeIndex, corrections]);
  
  const themeContainerClass = 'flex flex-wrap items-center justify-center gap-2 md:gap-3';

  const renderItem = (value: number, index: number) => {
    const isCorrected = corrections[index] !== undefined && corrections[index] !== '';
    const correctedValue = corrections[index];
    const isActive = activeIndex === index && !disabled;
    
    let displayContent;
    if (isActive) displayContent = correctedValue || <span className="animate-pulse text-pink-600">?</span>;
    else if (isCorrected) displayContent = correctedValue;
    else displayContent = value;
    
    const itemBaseClass = `font-bold rounded-lg shadow-md transition-all transform cursor-pointer flex items-center justify-center ${theme.fontSizes.sequenceNumber} ${theme.inputs.sequenceItem}`;
    const textColorClass = isCorrected ? theme.colors.text.userInput : theme.colors.text.operand;
    const themeItemClass = `${theme.colors.bg.sequenceFindErrorDefault} hover:bg-sky-300`;
    
    return (
      <button key={index} onClick={() => handleItemClick(index)} disabled={disabled} className={`${itemBaseClass} ${themeItemClass} ${textColorClass} ${isActive ? `ring-2 ${theme.colors.border.sequenceItemActive}` : isCorrected ? `ring-2 ${theme.colors.border.sequenceItemCorrected}` : 'hover:scale-105'}`}>
        {displayContent}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className={`text-xl md:text-2xl lg:text-3xl font-semibold ${theme.colors.text.secondary} mb-4 md:mb-6 text-center`}><StyledPrompt text={question.promptText} /></p>
      <div ref={containerRef} className={`w-full min-h-[120px] p-4 ${themeContainerClass}`}>{question.sequenceWithErrors.map(renderItem)}</div>
      <div className="mt-6 md:mt-8 w-full flex flex-col items-center gap-4">{!disabled && <CustomNumpad ref={numpadRef} onInput={handleNumpadInput} onDelete={handleNumpadDelete} onEnter={handleSubmit} />}</div>
    </div>
  );
};

// --- Fill In The Blanks Component ---
const FillInTheBlanksDisplay: React.FC<QuestionComponentProps<FillInTheBlanksQuestion>> = ({ question, onAnswer, disabled, lastAnswer }) => {
  const { playSound } = useAudio();
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const numBlanks = question.sequence.filter(s => s === null).length;
    setInputValues(Array(numBlanks).fill(''));
    setActiveIndex(0);
    
    if (!disabled) {
      const soundToPlay = question.theme === 'train' ? 'SEQUENCE_ITEM_SLIDE' : 'SEQUENCE_ITEM_POP';
      question.sequence.forEach((part, index) => {
        if (part !== null) {
          const delay = index * (question.theme === 'train' ? 150 : 120);
          setTimeout(() => { playSound(soundToPlay); }, delay);
        }
      });
    }
  }, [question.id, question.sequence, question.theme, disabled, playSound]);

  const handleSubmit = useCallback(() => { if (!disabled && !inputValues.some(val => val.trim() === '')) { playSound('DECISION'); onAnswer(inputValues); } }, [disabled, inputValues, onAnswer, playSound]);
  const handleNumpadInput = useCallback((num: string) => { if (activeIndex !== null && !disabled) { playSound('TYPE'); setInputValues(prev => { const newValues = [...prev]; const currentVal = newValues[activeIndex] || ''; if (currentVal.length < 2) newValues[activeIndex] = currentVal + num; return newValues; }); } }, [activeIndex, playSound, disabled]);
  const handleNumpadDelete = useCallback(() => { if (activeIndex !== null && !disabled) { playSound('TYPE'); setInputValues(prev => { const newValues = [...prev]; newValues[activeIndex] = (newValues[activeIndex] || '').slice(0, -1); return newValues; }); } }, [activeIndex, playSound, disabled]);
  
  useEffect(() => {
    if (disabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key >= '0' && event.key <= '9') handleNumpadInput(event.key);
        else if (event.key === 'Backspace') handleNumpadDelete();
        else if (event.key === 'Enter') { event.preventDefault(); handleSubmit(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, handleNumpadInput, handleNumpadDelete, handleSubmit]);
  
  let blankCounter = -1;
  const themeContainerClass = 'flex flex-wrap items-center justify-center gap-2 md:gap-3';
  const userAnswersArray = (Array.isArray(lastAnswer) ? lastAnswer : []) as string[];
  
  return (
    <div className="flex flex-col items-center w-full">
      <p className={`text-xl md:text-2xl lg:text-3xl font-semibold ${theme.colors.text.secondary} mb-4 text-center`}>{question.promptText}</p>
      <div className={`w-full min-h-[120px] p-4 ${themeContainerClass}`}>
          {question.sequence.map((part, index) => {
            const itemBaseClass = `font-bold rounded-lg shadow-md transition-all transform flex items-center justify-center ${theme.inputs.sequenceItem}`;
            const animClass = question.theme === 'train' ? 'animate-train-jiggle' : 'animate-fall-and-bounce';
            const animDelay = { animationDelay: `${index * (question.theme === 'train' ? 150 : 120)}ms` };

            if (part === null) {
              blankCounter++;
              const currentBlankIndex = blankCounter;
              
              if (disabled) {
                  const userAnswer = userAnswersArray[currentBlankIndex] ?? '?';
                  const isCorrect = userAnswer !== '?' && parseInt(userAnswer, 10) === question.answers[currentBlankIndex];
                  
                  let feedbackClasses = '';

                  if (isCorrect) {
                      feedbackClasses = 'bg-green-200 text-green-800 animate-pop-scale';
                  } else {
                      feedbackClasses = 'bg-red-200 text-red-800 animate-shake-short';
                  }

                  return (
                      <div key={`${question.id}-blank-${index}-fb`} className={`${itemBaseClass} ${theme.fontSizes.sequenceInput} ${feedbackClasses}`}>
                          {userAnswer}
                      </div>
                  );
              }

              const isActive = currentBlankIndex === activeIndex;
              const hasValue = inputValues[currentBlankIndex]?.trim() !== '';
              return (
                <button key={`${question.id}-blank-${index}`} onClick={() => setActiveIndex(currentBlankIndex)} disabled={disabled} className={`${itemBaseClass} ${theme.fontSizes.sequenceInput} ${theme.colors.bg.sequenceTrainBlank} text-center cursor-pointer ${animClass} ${isActive ? `ring-2 ${theme.colors.border.sequenceItemActive}` : ''} ${hasValue ? theme.colors.text.userInput : 'text-gray-400'}`} style={animDelay}>
                  {inputValues[currentBlankIndex] || (isActive ? <span className="animate-pulse text-pink-600">?</span> : <span className="text-gray-400">?</span>)}
                </button>
              );
            }
            const themeItemClass = `text-white ${index % 2 === 0 ? theme.colors.bg.sequenceTrainPrimary : theme.colors.bg.sequenceTrainSecondary}`;
            return <div key={`${question.id}-num-${index}`} className={`${itemBaseClass} ${theme.fontSizes.sequenceNumber} ${themeItemClass} ${animClass}`} style={animDelay}>{part}</div>;
          })}
      </div>
      <div className="mt-6 md:mt-8 w-full flex flex-col items-center gap-4">{!disabled && <CustomNumpad onInput={handleNumpadInput} onDelete={handleNumpadDelete} onEnter={handleSubmit} />}</div>
    </div>
  );
};


// --- Sort Sequence Component (Overhauled for better UX on both Mouse and Touch) ---
const SortSequenceDisplay: React.FC<QuestionComponentProps<SortSequenceQuestion>> = ({ question, onAnswer, disabled }) => {
    const { playSound } = useAudio();
    const [items, setItems] = useState(() => question.scrambledSequence.map((val, i) => ({ id: `${val}-${i}`, value: val })));
    
    // State for rich drag experience
    const [isDragging, setIsDragging] = useState(false);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [draggedItemStyle, setDraggedItemStyle] = useState<React.CSSProperties | null>(null);
    const [initialPointerOffset, setInitialPointerOffset] = useState<{ x: number, y: number } | null>(null);

    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    itemRefs.current = [];

    useEffect(() => {
        setItems(question.scrambledSequence.map((val, i) => ({ id: `${val}-${i}`, value: val })));
        setIsDragging(false);
        setDraggingIndex(null);
        setDragOverIndex(null);
    }, [question.id, question.scrambledSequence]);

    const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, index: number) => {
        if (disabled) return;
        e.preventDefault(); // Prevents default behaviors like text selection on mouse drag
        
        const pointer = 'touches' in e ? e.touches[0] : e;
        const targetElement = e.currentTarget;
        const rect = targetElement.getBoundingClientRect();
        
        setInitialPointerOffset({ x: pointer.clientX - rect.left, y: pointer.clientY - rect.top });
        setDraggedItemStyle({
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            zIndex: 50,
            opacity: 0.8,
            transform: 'scale(1.1)',
        });
        
        setIsDragging(true);
        setDraggingIndex(index);
        if (navigator.vibrate) navigator.vibrate(50);
    };
    
    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging || initialPointerOffset === null) return;
        if (e.cancelable) e.preventDefault();
        
        const pointer = 'touches' in e ? e.touches[0] : e;

        setDraggedItemStyle(prev => ({
            ...prev,
            top: pointer.clientY - initialPointerOffset.y,
            left: pointer.clientX - initialPointerOffset.x,
        }));

        const targetIndex = itemRefs.current.findIndex(ref => {
            if (!ref) return false;
            const rect = ref.getBoundingClientRect();
            return pointer.clientX >= rect.left && pointer.clientX <= rect.right && pointer.clientY >= rect.top && pointer.clientY <= rect.bottom;
        });
        
        if (targetIndex !== -1 && targetIndex !== dragOverIndex) {
            setDragOverIndex(targetIndex);
        }
    }, [isDragging, initialPointerOffset, dragOverIndex]);

    const handleDragEnd = useCallback(() => {
        if (!isDragging || draggingIndex === null) return;
        
        const newItems = [...items];
        if (dragOverIndex !== null && draggingIndex !== dragOverIndex) {
            playSound('SEQUENCE_ITEM_SLIDE');
            const [draggedItem] = newItems.splice(draggingIndex, 1);
            newItems.splice(dragOverIndex, 0, draggedItem);
            setItems(newItems);
        }
        
        setIsDragging(false);
        setDraggingIndex(null);
        setDragOverIndex(null);
        setDraggedItemStyle(null);
        setInitialPointerOffset(null);
    }, [isDragging, draggingIndex, dragOverIndex, items, playSound]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('touchmove', handleDragMove, { passive: false });
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    const getTransform = (index: number): string => {
        if (draggingIndex === null || dragOverIndex === null || draggingIndex === dragOverIndex || index === draggingIndex) {
            return '';
        }
        if (draggingIndex < dragOverIndex) { // Dragging forward
            if (index > draggingIndex && index <= dragOverIndex) return 'translateX(-105%)';
        } else { // Dragging backward
            if (index >= dragOverIndex && index < draggingIndex) return 'translateX(105%)';
        }
        return '';
    };
    
    const handleSubmit = useCallback(() => {
        if (disabled) return;
        playSound('DECISION');
        onAnswer(items.map(item => String(item.value)));
    }, [disabled, items, onAnswer, playSound]);

    return (
        <div className="flex flex-col items-center w-full">
            {/* Ghost Element */}
            {isDragging && draggedItemStyle && draggingIndex !== null && (
                <div style={draggedItemStyle} className={`font-bold rounded-lg flex items-center justify-center pointer-events-none ${theme.fontSizes.sequenceNumber} text-white bg-indigo-500 ring-2 ring-yellow-400 shadow-xl`}>
                    {items[draggingIndex].value}
                </div>
            )}
            
            <div className="flex items-center justify-center gap-x-3 mb-4">
                <p className={`text-xl md:text-2xl lg:text-3xl font-semibold ${theme.colors.text.secondary} text-center`}>{question.promptText}</p>
                <span className={`text-4xl ${question.sortOrder === 'asc' ? 'text-blue-500' : 'text-red-500'}`} aria-hidden="true">
                    {question.sortOrder === 'asc' ? '↑' : '↓'}
                </span>
            </div>

            <div className="w-full min-h-[120px] p-4 bg-sky-100 rounded-lg shadow-inner flex flex-wrap items-center justify-center gap-2 md:gap-3">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        ref={el => { itemRefs.current[index] = el; }}
                        onMouseDown={(e) => handleDragStart(e, index)}
                        onTouchStart={(e) => handleDragStart(e, index)}
                        className={`font-bold rounded-lg shadow-md flex items-center justify-center transition-all duration-300 ${theme.inputs.sequenceItem} ${theme.fontSizes.sequenceNumber} text-white bg-indigo-400
                        ${!disabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'}
                        ${(isDragging && draggingIndex === index) ? 'opacity-0' : 'opacity-100'}
                        `}
                        style={{ transform: getTransform(index) }}
                    >
                        {item.value}
                    </div>
                ))}
            </div>

             <div className="mt-8 w-full flex justify-center">
                <button
                    onClick={handleSubmit}
                    disabled={disabled}
                    className={`${theme.buttons.base} ${theme.buttons.primary}`}
                >
                    OK
                </button>
            </div>
        </div>
    );
};


// --- Main Component ---
const NumberSequenceDisplay: React.FC<QuestionComponentProps<NumberSequenceQuestion>> = (props) => {
  switch (props.question.variant) {
    case 'find_and_fix_error':
        return <FindAndFixErrorDisplay {...props as QuestionComponentProps<FindAndFixErrorQuestion>} />;
    case 'fill_in_the_blanks':
        return <FillInTheBlanksDisplay {...props as QuestionComponentProps<FillInTheBlanksQuestion>} />;
    case 'sort_sequence':
        return <SortSequenceDisplay {...props as QuestionComponentProps<SortSequenceQuestion>} />;
    default:
        return <div>Loại câu hỏi dãy số không xác định.</div>;
  }
};

export default NumberSequenceDisplay;