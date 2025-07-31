import React, { useState, useEffect, useRef } from 'react';
import { MatchingPairsQuestion, MatchableItem, ShapeType } from '../../../types';
import { theme } from '../../config/theme';
import { QuestionComponentProps } from './QuestionProps';

const MatchingPairsDisplay: React.FC<QuestionComponentProps<MatchingPairsQuestion>> = ({ question, onAnswer, disabled }) => {
  const matchingPairCardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mainMatchingPairContainerRef = useRef<HTMLDivElement>(null);
  const [lineRenderTrigger, setLineRenderTrigger] = useState(0);

  useEffect(() => {
    // This effect redraws the connection lines when the screen resizes or the question changes
    const handleResize = () => {
      setLineRenderTrigger(prev => prev + 1);
    };

    window.addEventListener('resize', handleResize);
    // Initial draw
    const timer = setTimeout(() => handleResize(), 50);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [question.id]);

  const handleMatchingPairItemClick = (itemId: string) => {
    // Sound is handled in useGameLogic after evaluation
    if (disabled && !question.items.find(i => i.id === itemId && i.isSelected && !i.isMatched)) {
      return;
    }
    onAnswer(itemId);
  };
  
  const linesToDraw: { x1: number, y1: number, x2: number, y2: number, id: string }[] = [];
    
  if (!question || !question.items) {
      return <p>Đang tải cặp ghép...</p>;
  }

  const digitItems = question.items.filter(item => item.visualType === 'digit');
  const visualItems = question.items.filter(item => item.visualType === 'emoji_icon');

  const itemsByMatchId = new Map<string, MatchableItem[]>();
  question.items.forEach(item => {
      if (!itemsByMatchId.has(item.matchId)) {
          itemsByMatchId.set(item.matchId, []);
      }
      itemsByMatchId.get(item.matchId)!.push(item);
  });

  if (mainMatchingPairContainerRef.current) { 
      const containerRect = mainMatchingPairContainerRef.current.getBoundingClientRect();

      itemsByMatchId.forEach((pairItems) => {
          if (pairItems.length === 2 && pairItems.every(item => item.isMatched)) {
              const digitItem = pairItems.find(p => p.visualType === 'digit');
              const iconItem = pairItems.find(p => p.visualType === 'emoji_icon');

              if (digitItem && iconItem) {
                  const digitElement = matchingPairCardRefs.current[digitItem.id];
                  const iconElement = matchingPairCardRefs.current[iconItem.id];

                  if (digitElement && iconElement) {
                      const rectDigit = digitElement.getBoundingClientRect();
                      const rectIcon = iconElement.getBoundingClientRect();
                      
                      const x1 = rectDigit.left + rectDigit.width - containerRect.left; 
                      const y1 = rectDigit.top + rectDigit.height / 2 - containerRect.top; 
                      
                      const x2 = rectIcon.left - containerRect.left; 
                      const y2 = rectIcon.top + rectIcon.height / 2 - containerRect.top; 
                      
                      linesToDraw.push({ id: `${digitItem.id}-${iconItem.id}`, x1, y1, x2, y2 });
                  }
              }
          }
      });
  }
  
  const renderItemButton = (item: MatchableItem) => {
    let contentFontSizeClass: string;
    let buttonSizeClass: string;
    let textColorClass = item.visualType === 'digit' ? 'text-blue-600' : 'text-cyan-800'; 

    const graphemes = Array.from(item.display); 
    const emojiCount = graphemes.length;

    if (item.visualType === 'emoji_icon') {
        buttonSizeClass = theme.sizing.matchingPairIconButton;
        if (emojiCount <= 1) contentFontSizeClass = theme.fontSizes.matchingPairEmoji.xxlarge; 
        else if (emojiCount <= 3) contentFontSizeClass = theme.fontSizes.matchingPairEmoji.xlarge; 
        else if (emojiCount <= 6) contentFontSizeClass = theme.fontSizes.matchingPairEmoji.large; 
        else if (emojiCount <= 8) contentFontSizeClass = theme.fontSizes.matchingPairEmoji.medium; 
        else contentFontSizeClass = theme.fontSizes.matchingPairEmoji.small; 
    } else { 
         buttonSizeClass = theme.sizing.matchingPairButton;
         contentFontSizeClass = theme.fontSizes.matchingPairNumber;
    }

    const renderEmojiIconContent = () => {
        const rows: ShapeType[][] = [];
        if (emojiCount <= 3) { 
            rows.push(graphemes);
        } else if (emojiCount === 4) { 
            rows.push(graphemes.slice(0, 2));
            rows.push(graphemes.slice(2, 4));
        } else if (emojiCount <= 6) { 
            const half = Math.ceil(emojiCount / 2);
            rows.push(graphemes.slice(0, half));
            rows.push(graphemes.slice(half));
        } else { 
             const third = Math.ceil(emojiCount / 3);
             rows.push(graphemes.slice(0, third));
             rows.push(graphemes.slice(third, 2*third));
             rows.push(graphemes.slice(2*third));
        }

        return (
            <div className={`flex flex-col items-center justify-center w-full h-full ${contentFontSizeClass}`}>
                {rows.map((rowEmojis, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center items-center mb-0.5 md:mb-1"> 
                        {rowEmojis.map((emojiChar, charIndex) => (
                            <span 
                              key={charIndex} 
                              className="p-px text-center"
                              style={{ lineHeight: 1, overflow: 'hidden' }} 
                            >
                                {emojiChar}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        );
    };
    
    return (
        <button
          key={item.id}
          ref={el => { matchingPairCardRefs.current[item.id] = el; }}
          onClick={() => handleMatchingPairItemClick(item.id)}
          disabled={item.isMatched || (disabled && !item.isSelected)}
          className={`p-px rounded-lg shadow-md font-semibold transition-all duration-150 ease-in-out aspect-square flex flex-col items-center justify-center ${buttonSizeClass} overflow-hidden
            ${item.isMatched ? `${theme.colors.bg.matchingPairMatched} text-slate-500 opacity-60 cursor-not-allowed` :
             item.isSelected ? `${theme.colors.bg.matchingPairSelected} text-yellow-800 ring-4 ${theme.colors.border.matchingPairSelected} scale-105` :
             `${theme.colors.bg.matchingPairDefault} hover:bg-cyan-100 ${textColorClass} transform hover:scale-105` 
            }`}
          aria-pressed={item.isSelected}
          aria-label={`Ghép cặp với ${item.display}`}
        >
          {item.visualType === 'emoji_icon' ? renderEmojiIconContent() : 
            <span className={`${contentFontSizeClass} ${textColorClass} w-full h-full flex flex-wrap justify-center items-center leading-tight text-center p-0.5`}>
              {item.display}
            </span>
          }
        </button>
    );
  };

  return (
    <div ref={mainMatchingPairContainerRef} className="flex flex-col items-center w-full relative">
      <p className={`text-lg md:text-xl lg:text-2xl font-semibold ${theme.colors.text.secondary} mb-4 md:mb-6 text-center`}>{question.promptText}</p>
      <div className="grid grid-cols-2 gap-x-10 sm:gap-x-12 md:gap-x-16 lg:gap-x-20 w-full max-w-lg sm:max-w-xl md:max-w-2xl relative"> 
        <div className="space-y-2 md:space-y-3 lg:space-y-4 flex flex-col items-center relative z-[1] bg-transparent">
          {digitItems.map(item => renderItemButton(item))}
        </div>
        <div className="space-y-2 md:space-y-3 lg:space-y-4 flex flex-col items-center relative z-[1] bg-transparent">
          {visualItems.map(item => renderItemButton(item))}
        </div>
        
        <svg 
          key={`svg-lines-container-${question.id}-${lineRenderTrigger}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none" 
          style={{ zIndex: 0, minWidth: '100%', minHeight: '100%' }} 
          overflow="visible" 
          aria-hidden="true"
        >
            {linesToDraw.map(line => (
                <line 
                    key={line.id} 
                    x1={line.x1} y1={line.y1} 
                    x2={line.x2} y2={line.y2} 
                    stroke={theme.colors.border.svgLine}
                    strokeWidth="5" 
                    strokeOpacity="0.6"
                    strokeLinecap="round"
                />
            ))}
        </svg>
      </div>
    </div>
  );
};

export default MatchingPairsDisplay;
