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

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date | string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: string;
  timestamp: Date | string;
  sessionId?: string;
}

export interface AnalyticsMetrics {
  totalQuestions: number;
  activeSessions: number;
  totalUsers: number;
  dailyQuestions: number[];
  weeklyQuestions: number[];
  monthlyQuestions: number[];
  responseTime: number; // average in ms
  accuracy: number; // percentage
  recentActivities: ActivityRecord[];
}

export interface ActivityRecord {
  id: string;
  activity: string;
  details: string;
  date: Date | string;
  category: 'Q&A' | 'Analytics' | 'System' | 'User';
  status: 'success' | 'error' | 'pending';
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
  chatHistory: ChatSession[];
  currentChatId: string | null;
  analytics: AnalyticsMetrics;
}