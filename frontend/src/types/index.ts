export interface ExtractedContent {
  url: string;
  title: string;
  content: string;
  success: boolean;
  error_message?: string;
  word_count: number;
}

export interface ExtractionResponse {
  success: boolean;
  extracted_content: ExtractedContent[];
  total_word_count: number;
  failed_urls: string[];
  session_id?: string;
}

export interface QuestionInput {
  question: string;
  session_id?: string;
}

export interface AnswerResponse {
  answer: string;
  sources: string[];
  session_id: string;
  confidence?: number;
}

export interface TTSResponse {
  audio_url: string;
  duration?: number;
}

export interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  audioLevel: number;
  transcript: string;
}

export interface AppState {
  urls: string[];
  extractedContent: ExtractedContent[];
  currentQuestion: string;
  currentAnswer: AnswerResponse | null;
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  voiceState: VoiceState;
}