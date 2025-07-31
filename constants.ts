

import { ImageSet, ShapeType } from './types';

export const NUM_QUESTIONS_PER_ROUND = 20; // Base number, can be overridden by specific modes/difficulties
export const VISUAL_PATTERN_QUESTIONS_MAM = 10;
export const VISUAL_PATTERN_QUESTIONS_CHOI = 15;
export const ODD_ONE_OUT_QUESTIONS_MAM = 10;
export const ODD_ONE_OUT_QUESTIONS_CHOI = 15;
export const COMPREHENSIVE_CHALLENGE_QUESTIONS = 15;
export const COMPREHENSIVE_CHALLENGE_TIME_MAM = 150; // 2.5 minutes
export const COMPREHENSIVE_CHALLENGE_TIME_CHOI = 120; // 2 minutes


export const MAX_SESSIONS_TO_STORE = 3;
export const NEXT_QUESTION_DELAY_MS = 1000; // New faster default
export const SLOW_NEXT_QUESTION_DELAY_MS = 2000; // For complex modes
export const MIN_EQUALS_IN_COMPARISON_ROUND = 3;


export const POSITIVE_FEEDBACKS: string[] = [
  "TUYỆT VỜI!",
  "GIỎI QUÁ!",
  "XUẤT SẮC!",
  "CHUẨN LUÔN!",
  "QUÁ ĐỈNH!",
  "BÉ LÀM TỐT LẮM!",
  "ĐÚNG RỒI ĐÓ BÉ!",
];

export const ENCOURAGING_FEEDBACKS: string[] = [
  "BÉ HÃY SUY NGHĨ KỸ HƠN!",
  "CỐ LÊN NÀO BÉ!",
  "THỬ LẠI NHÉ!",
  "SUÝT ĐÚNG RỒI!",
  "ĐỪNG NẢN LÒNG, BÉ CỐ GẮNG NHÉ!",
  "SAI MỘT CHÚT THÔI!",
];

export const MENU_EMOJIS_RANDOM: string[] = ['✨', '🎉', '🎈', '⭐', '🎯', '💡', '🚀', '💯', '🧩', '🌟', '🥳', '🤩'];

export const COMPARISON_ICON = '⚖️';
export const COUNTING_ICON = '🎨';
export const NUMBER_RECOGNITION_ICON = '🧐'; 
export const MATCHING_PAIRS_ICON = '🔗';
export const NUMBER_SEQUENCE_ICONS: string[] = ['📊', '📈', '📉', '🔢']; 
export const VISUAL_PATTERN_ICON = '🖼️'; 
export const ODD_ONE_OUT_ICONS_RANDOM: string[] = ['🔍', '🔎', '🤔', '🧐', '💡', '❓', '🧩']; // New random icons for Odd One Out
export const REVIEW_ICON = '📝';
export const COMPREHENSIVE_CHALLENGE_ICON = '⏱️';


// --- Start of Prompt Libraries for AI Modes ---
export const ODD_ONE_OUT_PROMPTS: string[] = [
  "Tìm vật khác biệt với những vật còn lại:",
  "Vật nào không cùng nhóm với các bạn khác?",
  "Trong các hình sau, có một hình bị lạc loài, đó là hình nào?",
  "Bé hãy tìm ra một vật không giống với những vật kia nhé.",
  "Có một vật không thuộc nhóm này, bé có biết là vật nào không?"
];

export const VISUAL_PATTERN_PROMPTS: string[] = [
  "Hình nào tiếp theo trong dãy?",
  "Tìm hình tiếp theo để hoàn thành dãy.",
  "Quy luật của dãy này là gì? Hãy chọn hình đúng.",
  "Bé hãy tìm hình còn thiếu nhé.",
  "Điền hình đúng vào dấu chấm hỏi."
];
// --- End of Prompt Libraries for AI Modes ---

// The INITIAL_COUNTING_ICONS array has been removed.
// All icon data is now centrally managed in src/data/iconData.ts


export const UNLOCKABLE_IMAGE_SETS: ImageSet[] = [
  { id: 'farm_animals', name: "Bộ Nông Trại Vui Vẻ", starsRequired: 20, icons: ['🐄', '🐖', '🐑', '🐓', '🦆', '🐴', '🐐', '🦃', '🦢', '🐇'] }, 
  { id: 'sea_creatures', name: "Bộ Sinh Vật Biển Kỳ Thú", starsRequired: 50, icons: ['🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🌊', '🐚', '🦈', '🦦'] }, 
  { id: 'space_explorer', name: "Bộ Khám Phá Vũ Trụ", starsRequired: 100, icons: ['🪐', '☄️', '🌌', '👽', '🧑‍🚀', '🛰️', '🌠', '🛸'] }, 
  { id: 'magical_items', name: "Bộ Vật Phẩm Diệu Kỳ", starsRequired: 180, icons: ['🪄', '🧪', '📜', '🔮', '🧿', '⚜️', '🗝️', '💍', '✨', '💎'] }, 
  { id: 'dinosaurs', name: "Bộ Khủng Long Bạo Chúa", starsRequired: 250, icons: ['🦖', '🦕', '🐉', '🌋', '🦴'] }, 
];


export const POSITIVE_FEEDBACK_EMOJIS: string[] = ['🥳', '🤩', '🎉', '👍', '🌟', '💖', '💫', '🎈', '💯', '✨', '✔️', '🏆', '🥇', '🏅'];
export const ENCOURAGING_FEEDBACK_EMOJIS: string[] = ['🤔', '🧐', '💡', '💪', '🌱', '➡️', '🚀', '👀', '✏️', '🧠'];

// End Game Messages & Icons
export const CONGRATS_MESSAGES: string[] = [
  "Xuất sắc! Bé thật là siêu!",
  "Tuyệt vời! Bé đã làm rất tốt!",
  "Giỏi quá! Bé là một thiên tài toán học!",
  "Hoàn thành xuất sắc! Tiếp tục phát huy nhé!",
  "Chúc mừng bé đã chinh phục thử thách!"
];
export const CONGRATS_ICONS: string[] = ['🎉', '🥳', '🌟', '🏆', '🥇', '🎈', '✨', '🤩', '💯'];

export const ENCOURAGE_TRY_AGAIN_MESSAGE = "Bé hãy cố gắng thêm ở lần sau nhé!";
export const ENCOURAGE_TRY_AGAIN_ICONS: string[] = ['💪', '👍', '💡', '🌱', '😊', '🤔'];

// LocalStorage Keys
export const TOTAL_STARS_STORAGE_KEY = 'toanHocThongMinh_totalStars';
export const UNLOCKED_SETS_STORAGE_KEY = 'toanHocThongMinh_unlockedSetIds';
export const CURRENT_DIFFICULTY_KEY = 'toanHocThongMinh_currentDifficulty';