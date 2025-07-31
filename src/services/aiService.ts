// src/services/aiService.ts

import { GoogleGenAI, Type } from "@google/genai";
import { DifficultyLevel, OddOneOutQuestion, VisualPatternQuestion, GameMode, VisualPatternOption, OddOneOutOption, Question, IconData, ShapeType } from '../../types';
import { generateId, shuffleArray, getVietnameseName } from './questionUtils';

// Helper to format icon data for the prompt, providing rich context to the AI.
const formatIconDataForPrompt = (icon: IconData): string => {
    const attributes: string[] = [];
    if (icon.primaryCategory) attributes.push(`chủ đề: '${getVietnameseName(icon.primaryCategory)}'`);
    if (icon.subCategory) attributes.push(`phân loại: '${getVietnameseName(icon.subCategory)}'`);
    if (icon.attributes.color) attributes.push(`màu sắc: '${icon.attributes.color.map(getVietnameseName).join(', ')}'`);
    if (icon.attributes.environment) attributes.push(`môi trường: '${getVietnameseName(icon.attributes.environment)}'`);
    if (icon.attributes.can_fly !== undefined) attributes.push(icon.attributes.can_fly ? 'biết bay' : 'không biết bay');
    if (icon.attributes.is_edible !== undefined) attributes.push(icon.attributes.is_edible ? 'ăn được' : 'không ăn được');
    if (icon.attributes.is_living_organism !== undefined) attributes.push(icon.attributes.is_living_organism ? 'là vật sống' : 'là vật không sống');
    if (icon.attributes.function) attributes.push(`công dụng: '${getVietnameseName(icon.attributes.function)}'`);
    if (icon.attributes.diet) attributes.push(`chế độ ăn: '${getVietnameseName(icon.attributes.diet)}'`);
    if (icon.attributes.power_source) attributes.push(`nguồn năng lượng: '${getVietnameseName(icon.attributes.power_source)}'`);

    return `- ${icon.emoji} (${icon.name}): { ${attributes.join(', ')} }`;
};

const generatePrompt = (
    mode: GameMode,
    difficulty: DifficultyLevel,
    numQuestions: number,
    availableIcons: IconData[],
    seedIcons: IconData[]
): string => {
    const age = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? "3-4 tuổi" : "4-5 tuổi";
    
    const iconListForPrompt = `Dưới đây là danh sách các icon và thuộc tính của chúng mà bạn có thể sử dụng:
${availableIcons.map(formatIconDataForPrompt).join('\n')}`;

    let seedRequirements = '';
    if (seedIcons.length > 0) {
        const seedDescriptions = seedIcons.map(icon => `- ${icon.emoji} (${icon.name})`).join('\n');
        seedRequirements = `
**YÊU CẦU BẮT BUỘC VỀ ICON:**
Để đảm bảo sự đa dạng, bạn **BẮT BUỘC** phải sử dụng các icon sau đây trong các câu hỏi bạn tạo ra. Mỗi icon phải xuất hiện trong ít nhất một câu hỏi:
${seedDescriptions}
`;
    }

    const basePrompt = `Bạn là một chuyên gia thiết kế game giáo dục thông minh và sáng tạo cho trẻ em ${age}. Nhiệm vụ của bạn là tạo ra một danh sách gồm ${numQuestions} câu hỏi độc đáo và thú vị.
${iconListForPrompt}
${seedRequirements}
Yêu cầu chung:
1.  **GIẢI THÍCH ĐƠN GIẢN:** Cung cấp lời giải thích ("explanation") ngắn gọn, súc tích, dễ hiểu bằng tiếng Việt cho trẻ em.
2.  **ĐA DẠNG HÓA:** Mỗi câu hỏi trong lô ${numQuestions} câu bạn tạo ra phải có **logic khác nhau** và sử dụng **bộ icon hoàn toàn khác nhau**.`;

    if (mode === GameMode.ODD_ONE_OUT) {
        const logicInstructions = `
**HƯỚNG DẪN TƯ DUY LOGIC:**
Nhiệm vụ của bạn là tạo ra các câu đố "Tìm vật khác biệt" có chiều sâu. Hãy ưu tiên tạo logic theo thứ tự sau:

1.  **Ưu tiên cao nhất (Logic thuộc tính sâu):** Tạo câu hỏi dựa trên các thuộc tính (attributes) cụ thể. Đây là cách tạo câu đố thông minh nhất.
    *   *Ví dụ hay:* 3 con vật ăn cỏ (chế độ ăn: 'ăn cỏ') vs 1 con ăn thịt (chế độ ăn: 'ăn thịt').
    *   *Ví dụ hay:* 3 phương tiện di chuyển trên cạn (môi trường: 'trên cạn') vs 1 phương tiện bay (môi trường: 'trên không').
    *   *Ví dụ hay:* 3 dụng cụ dùng để viết (công dụng: 'viết') vs 1 dụng cụ dùng để cắt (công dụng: 'cắt').
    *   *Ví dụ hay:* 3 vật là vật sống (là vật sống: true) vs 1 vật không sống (là vật không sống: false).

2.  **Ưu tiên vừa (Logic phân loại phụ):** Nếu không thể tạo logic thuộc tính sâu, hãy dùng phân loại phụ (phân loại).
    *   *Ví dụ:* 3 động vật có vú (phân loại: 'động vật có vú') vs 1 loài chim (phân loại: 'loài chim').

3.  **Hạn chế (Logic chủ đề chính):** CHỈ SỬ DỤNG KHI CÁC CÁCH TRÊN KHÔNG PHÙ HỢP.
    *   *Ví dụ rất đơn giản (cần tránh):* 3 động vật (chủ đề: 'động vật') vs 1 phương tiện (chủ đề: 'phương tiện').

**TRÁNH XA SỰ MƠ HỒ (AVOID AMBIGUITY):** Câu hỏi lý tưởng nhất là chỉ có **MỘT** lời giải thích hợp lý duy nhất. Trước khi chốt một bộ 4 hình, hãy tự kiểm tra xem có cách phân loại nào khác cũng hợp lý hay không. Nếu có, hãy tạo một bộ khác. Ví dụ, bộ (Đại bàng, Dơi, Máy bay, Bò) là một bộ **TỒI** vì có thể loại trừ 'Bò' (không bay) hoặc 'Máy bay' (không phải con vật). Hãy tạo ra những bộ chặt chẽ hơn.

**QUAN TRỌNG NHẤT: TRÁNH** tạo ra những câu hỏi lặp đi lặp lại và quá đơn giản như "3 con vật, 1 cái xe". Hãy luôn cố gắng tìm ra mối liên hệ thông minh và bất ngờ nhất có thể!
`;
        return `${basePrompt}
${logicInstructions}
Hãy trả về kết quả dưới dạng một mảng JSON.`;
    }

    // VISUAL_PATTERN
    const patternExamples = "Ví dụ các quy luật tốt: ABAB (táo, chuối, táo, chuối), AABB (xe, xe, thuyền, thuyền), ABC (mặt trời, mặt trăng, sao), AAB (mèo, mèo, chó).";
    return `${basePrompt}

Yêu cầu cụ thể cho mỗi câu hỏi "TÌM QUY LUẬT HÌNH ẢNH":
1.  **QUAN TRỌNG:** Quy luật phải dựa trên sự lặp lại của các hình ảnh (visual repetition), KHÔNG phải quy luật về ý nghĩa hay chủ đề. Hãy coi các icon như các ký tự A, B, C.
2.  Tạo ra một quy luật lặp lại đơn giản, vui nhộn. ${patternExamples} Hãy tự do sáng tạo các quy luật tương tự.
3.  Dựa trên quy luật đó, tạo một \`sequence_emojis\` (dãy hiển thị cho bé) gồm 3 đến 5 icon. Icon tiếp theo trong quy luật sẽ là đáp án đúng.
4.  Tạo \`options_emojis\` gồm 4 lựa chọn, trong đó có 1 đáp án đúng (icon tiếp theo) và 3 đáp án gây nhiễu hợp lý (có thể là các icon khác trong dãy hoặc icon mới).
5.  \`explanation\` phải mô tả rõ quy luật lặp lại. Ví dụ: "Cứ 2 quả táo lại đến 2 quả chuối." hoặc "Quy luật là một quả táo, rồi đến một quả chuối, lặp lại."
Hãy trả về kết quả dưới dạng một mảng JSON.`;
};


const generateOddOneOutSchema = () => ({
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            explanation: {
                type: Type.STRING,
                description: "Lời giải thích ngắn gọn, dễ hiểu bằng tiếng Việt về logic của câu trả lời đúng."
            },
            options_emojis: {
                type: Type.ARRAY,
                description: "Một mảng chứa chính xác 4 emoji (string) cho câu hỏi này.",
                items: { type: Type.STRING }
            },
            correct_emoji: {
                type: Type.STRING,
                description: "Emoji (string) là đáp án đúng trong 4 options_emojis."
            },
        },
        required: ['options_emojis', 'correct_emoji', 'explanation']
    }
});

const generateVisualPatternSchema = () => ({
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            explanation: {
                type: Type.STRING,
                description: "Lời giải thích ngắn gọn, dễ hiểu bằng tiếng Việt về logic của câu trả lời đúng."
            },
            sequence_emojis: {
                type: Type.ARRAY,
                description: "Một mảng chứa 3-5 emoji (string) thể hiện quy luật.",
                items: { type: Type.STRING }
            },
            options_emojis: {
                type: Type.ARRAY,
                description: "Một mảng chứa chính xác 4 emoji (string) cho các lựa chọn.",
                items: { type: Type.STRING }
            },
            correct_emoji: {
                type: Type.STRING,
                description: "Emoji (string) là đáp án đúng trong 4 options_emojis."
            },
        },
        required: ['sequence_emojis', 'options_emojis', 'correct_emoji', 'explanation']
    }
});


export const generateAiQuestionsBatch = async (
    mode: GameMode,
    difficulty: DifficultyLevel,
    numQuestions: number,
    availableIcons: IconData[],
    seedIcons: IconData[]
): Promise<{ questions: Question[], iconsUsed: ShapeType[] }> => {
    // This uses the client-side API key, prefixed with VITE_ as per Vite's convention.
    // The user must set VITE_API_KEY in their Vercel environment variables.
    const apiKey = import.meta.env.VITE_API_KEY;

    if (!apiKey) {
        console.error("VITE_API_KEY is not defined in the environment variables.");
        // Return an empty array so the UI can display a friendly error.
        return { questions: [], iconsUsed: [] };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = generatePrompt(mode, difficulty, numQuestions, availableIcons, seedIcons);
        const schema = mode === GameMode.ODD_ONE_OUT ? generateOddOneOutSchema() : generateVisualPatternSchema();
        const allIconsUsedInBatch = new Set<ShapeType>();

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema },
        });

        const rawQuestions = JSON.parse(response.text);
        const processedQuestions: Question[] = [];

        if (mode === GameMode.ODD_ONE_OUT) {
            rawQuestions.forEach((q: any) => {
                if (!q.options_emojis || !q.correct_emoji || q.options_emojis.length !== 4) return;
                
                let correctAnswerId = '';
                const options: OddOneOutOption[] = q.options_emojis.map((emoji: string) => {
                    const id = generateId();
                    if (emoji === q.correct_emoji) {
                        correctAnswerId = id;
                    }
                    allIconsUsedInBatch.add(emoji);
                    return { id, emoji };
                });

                if (correctAnswerId) {
                    processedQuestions.push({
                        id: generateId(), type: 'odd_one_out', mode, difficulty,
                        options: shuffleArray(options), 
                        correctAnswerId,
                        promptText: "", // Placeholder, will be filled by questionService
                        explanation: q.explanation || "Vì vật này khác với các vật còn lại."
                    });
                }
            });
        } else { // VISUAL_PATTERN
            rawQuestions.forEach((q: any) => {
                if (!q.sequence_emojis || !q.options_emojis || !q.correct_emoji || q.options_emojis.length !== 4) return;

                const options: VisualPatternOption[] = q.options_emojis.map((emoji: string) => {
                     allIconsUsedInBatch.add(emoji);
                     return {
                        id: generateId(),
                        emoji,
                        isCorrect: emoji === q.correct_emoji
                    }
                });

                q.sequence_emojis.forEach((emoji: string) => allIconsUsedInBatch.add(emoji));

                processedQuestions.push({
                    id: generateId(), type: 'visual_pattern', mode, difficulty,
                    displayedSequence: q.sequence_emojis,
                    options: shuffleArray(options),
                    promptText: "", // Placeholder, will be filled by questionService
                    explanation: q.explanation || "Vì đó là hình đúng theo quy luật."
                });
            });
        }
        
        return { 
            questions: processedQuestions.slice(0, numQuestions), 
            iconsUsed: Array.from(allIconsUsedInBatch) 
        };

    } catch (error) {
        console.error(`Error calling Gemini API directly from client for mode ${mode}:`, error);
        return { questions: [], iconsUsed: [] };
    }
};
