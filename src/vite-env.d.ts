// File này cung cấp định nghĩa TypeScript cho các biến môi trường
// được Vite cung cấp cho mã nguồn phía client.

interface ImportMetaEnv {
  // Khóa API cho dịch vụ Google Gemini.
  // Khóa này được đưa ra client theo yêu cầu của người dùng để đơn giản hóa việc triển khai.
  // Trong môi trường production, cách an toàn hơn là giữ khóa này trên máy chủ
  // và truy cập nó thông qua một serverless function proxy.
  readonly VITE_API_KEY: string;

  // Thêm các biến môi trường phía client khác tại đây.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
