import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActivityRecord, AnalyticsMetrics, AnswerResponse, AppState, ChatSession, ExtractedContent, Message, VoiceState } from '../types';

interface AppStore extends AppState {
  // URL management
  addUrl: (url: string) => void;
  removeUrl: (index: number) => void;
  clearUrls: () => void;
  
  // Content management
  setExtractedContent: (content: ExtractedContent[]) => void;
  
  // Question/Answer management
  setCurrentQuestion: (question: string) => void;
  setCurrentAnswer: (answer: AnswerResponse | null) => void;
  
  // Session management
  setSessionId: (sessionId: string) => void;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Voice state management
  setVoiceState: (voiceState: Partial<VoiceState>) => void;
  
  // Chat management
  createNewChat: () => string;
  selectChat: (chatId: string) => void;
  addMessageToCurrentChat: (message: Message) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
  getCurrentMessages: () => Message[];
  
  // Reset state
  reset: () => void;
  
  // Initialize dummy data if needed
  initializeDummyData: () => void;
  
  // Analytics methods
  trackQuestion: (question: string) => void;
  trackAnswer: (answer: string, responseTime: number) => void;
  addActivity: (activity: ActivityRecord) => void;
}

// Create 5 dummy chat histories
const createDummyChatHistory = (): ChatSession[] => {
  const now = new Date();
  return [
    {
      id: 'dummy-1',
      title: 'React Documentation - Hooks API',
      messages: [
        {
          id: 'msg-1-1',
          content: 'What are React hooks and how do they work?',
          isUser: true,
          timestamp: new Date(now.getTime() - 2 * 60 * 1000) // 2 minutes ago
        },
        {
          id: 'msg-1-2',
          content: 'React Hooks are functions that let you use state and other React features in functional components. They were introduced in React 16.8 as a way to use state and lifecycle methods without writing class components.',
          isUser: false,
          timestamp: new Date(now.getTime() - 2 * 60 * 1000 + 5000)
        }
      ],
      lastMessage: 'React Hooks are functions that let you use state and other React features...',
      timestamp: new Date(now.getTime() - 2 * 60 * 1000),
    },
    {
      id: 'dummy-2',
      title: 'JavaScript MDN - Closures Guide',
      messages: [
        {
          id: 'msg-2-1',
          content: 'Can you explain JavaScript closures with examples?',
          isUser: true,
          timestamp: new Date(now.getTime() - 60 * 60 * 1000) // 1 hour ago
        },
        {
          id: 'msg-2-2',
          content: 'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. This is a fundamental concept in JavaScript.',
          isUser: false,
          timestamp: new Date(now.getTime() - 60 * 60 * 1000 + 8000)
        }
      ],
      lastMessage: 'Can you explain JavaScript closures with examples?',
      timestamp: new Date(now.getTime() - 60 * 60 * 1000),
    },
    {
      id: 'dummy-3',
      title: 'REST API Best Practices Guide',
      messages: [
        {
          id: 'msg-3-1',
          content: 'What are the best practices for designing REST APIs?',
          isUser: true,
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          id: 'msg-3-2',
          content: 'REST API best practices include using proper HTTP methods (GET, POST, PUT, DELETE), meaningful resource URIs, consistent naming conventions, proper status codes, and implementing pagination for large datasets.',
          isUser: false,
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 12000)
        }
      ],
      lastMessage: 'What are the best practices for designing REST APIs?',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'dummy-4',
      title: 'CSS Grid Layout Complete Guide',
      messages: [
        {
          id: 'msg-4-1',
          content: 'What are the differences between CSS Grid and Flexbox?',
          isUser: true,
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          id: 'msg-4-2',
          content: 'CSS Grid is designed for two-dimensional layouts (rows and columns), while Flexbox is designed for one-dimensional layouts. Grid is better for overall page layout, while Flexbox excels at distributing space and aligning items within a container.',
          isUser: false,
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 7000)
        }
      ],
      lastMessage: 'What are the differences between CSS Grid and Flexbox?',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    {
      id: 'dummy-5',
      title: 'SQL Tutorial - JOIN Operations',
      messages: [
        {
          id: 'msg-5-1',
          content: 'How do different types of SQL JOINs work?',
          isUser: true,
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          id: 'msg-5-2',
          content: 'SQL JOINs combine rows from multiple tables. INNER JOIN returns matching rows, LEFT JOIN returns all rows from left table plus matches, RIGHT JOIN returns all rows from right table plus matches, and FULL JOIN returns all rows from both tables.',
          isUser: false,
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 15000)
        }
      ],
      lastMessage: 'How do different types of SQL JOINs work?',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    }
  ];
};

// Create initial analytics data with current dummy metrics
const createInitialAnalytics = (): AnalyticsMetrics => {
  const now = new Date();
  return {
    totalQuestions: 2456,
    activeSessions: 156,
    totalUsers: 47,
    dailyQuestions: [44, 55, 57, 56, 61, 58, 63], // Last 7 days
    weeklyQuestions: [245, 310, 278, 325, 289, 356, 298], // Last 7 weeks
    monthlyQuestions: [1250, 1389, 1456, 1234, 1567, 1678, 1456, 1789, 1923, 2145, 2334, 2456], // Last 12 months
    responseTime: 1250, // average in ms
    accuracy: 94.5, // percentage
    recentActivities: [
      {
        id: 'activity-1',
        activity: 'Question answered about React hooks',
        details: 'Provided detailed explanation about useState and useEffect',
        date: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        category: 'Q&A',
        status: 'success'
      },
      {
        id: 'activity-2',
        activity: 'Voice session completed',
        details: 'User completed voice Q&A session with 5 questions',
        date: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        category: 'Q&A',
        status: 'success'
      },
      {
        id: 'activity-3',
        activity: 'Analytics report generated',
        details: 'Monthly analytics report with performance metrics',
        date: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        category: 'Analytics',
        status: 'success'
      },
      {
        id: 'activity-4',
        activity: 'New user registered',
        details: 'User signed up and completed onboarding',
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        category: 'User',
        status: 'success'
      },
      {
        id: 'activity-5',
        activity: 'Content extraction completed',
        details: 'Successfully extracted content from 3 web sources',
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        category: 'System',
        status: 'success'
      }
    ]
  };
};

const initialState: AppState = {
  urls: [], // Start with no URLs
  extractedContent: [],
  currentQuestion: '',
  currentAnswer: null,
  sessionId: null,
  isLoading: false,
  error: null,
  voiceState: {
    isRecording: false,
    isProcessing: false,
    audioLevel: 0,
    transcript: '',
  },
  chatHistory: createDummyChatHistory(),
  currentChatId: null,
  analytics: createInitialAnalytics(),
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
  
  addUrl: (url: string) => {
    const { urls } = get();
    if (urls.length < 10) { // Max 10 URLs
      set({ urls: [...urls, url] });
    }
  },
  
  removeUrl: (index: number) => {
    const { urls } = get();
    set({ urls: urls.filter((_, i) => i !== index) });
  },
  
  clearUrls: () => {
    set({ urls: [] });
  },
  
  setExtractedContent: (content: ExtractedContent[]) => {
    set({ extractedContent: content });
  },
  
  setCurrentQuestion: (question: string) => {
    set({ currentQuestion: question });
  },
  
  setCurrentAnswer: (answer: AnswerResponse | null) => {
    set({ currentAnswer: answer });
  },
  
  setSessionId: (sessionId: string) => {
    set({ sessionId });
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  setVoiceState: (voiceStateUpdate: Partial<VoiceState>) => {
    const { voiceState } = get();
    set({ voiceState: { ...voiceState, ...voiceStateUpdate } });
  },
  
  // Chat management implementations
  createNewChat: () => {
    const chatId = `chat-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const { chatHistory, extractedContent } = get();
    
    // Generate title from extracted content if available
    let chatTitle = 'New Chat';
    if (extractedContent.length > 0) {
      const mainContent = extractedContent.find(content => content.success && content.title);
      chatTitle = mainContent ? mainContent.title : 'Q&A Session';
    }
    
    const newChat: ChatSession = {
      id: chatId,
      title: chatTitle,
      messages: [],
      lastMessage: '',
      timestamp: new Date(),
    };
    
    set({
      chatHistory: [newChat, ...chatHistory],
      currentChatId: chatId,
      currentQuestion: '',
      currentAnswer: null,
    });
    
    return chatId;
  },
  
  selectChat: (chatId: string) => {
    set({ 
      currentChatId: chatId,
      currentQuestion: '',
      currentAnswer: null,
    });
  },
  
  addMessageToCurrentChat: (message: Message) => {
    const { chatHistory, currentChatId, extractedContent } = get();
    if (!currentChatId) return;
    
    const updatedHistory = chatHistory.map(chat => {
      if (chat.id === currentChatId) {
        const updatedMessages = [...chat.messages, message];
        
        // Generate title from extracted content if available, otherwise use user message
        let newTitle = chat.title;
        if (chat.title === 'New Chat') {
          if (extractedContent.length > 0) {
            // Use the first successful extracted content title
            const mainContent = extractedContent.find(content => content.success && content.title);
            newTitle = mainContent ? mainContent.title : 'Q&A Session';
          } else if (message.isUser) {
            // Fallback to user message if no extracted content
            newTitle = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
          }
        }
        
        return {
          ...chat,
          messages: updatedMessages,
          lastMessage: message.content,
          timestamp: new Date(),
          title: newTitle
        };
      }
      return chat;
    });
    
    set({ chatHistory: updatedHistory });
  },
  
  updateChatTitle: (chatId: string, title: string) => {
    const { chatHistory } = get();
    const updatedHistory = chatHistory.map(chat =>
      chat.id === chatId ? { ...chat, title } : chat
    );
    set({ chatHistory: updatedHistory });
  },
  
  deleteChat: (chatId: string) => {
    const { chatHistory, currentChatId } = get();
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    const newCurrentChatId = currentChatId === chatId ? null : currentChatId;
    
    set({ 
      chatHistory: updatedHistory,
      currentChatId: newCurrentChatId,
      ...(newCurrentChatId === null && {
        currentQuestion: '',
        currentAnswer: null,
      })
    });
  },
  
  getCurrentMessages: () => {
    const { chatHistory, currentChatId } = get();
    const currentChat = chatHistory.find(chat => chat.id === currentChatId);
    return currentChat?.messages || [];
  },
  
  reset: () => {
    set(initialState);
  },
  
  initializeDummyData: () => {
    const { chatHistory } = get();
    // Only add dummy data if chat history is empty
    if (chatHistory.length === 0) {
      set({ chatHistory: createDummyChatHistory() });
    }
  },
  
  // Analytics tracking methods
  trackQuestion: (question: string) => {
    const { analytics } = get();
    const today = new Date().getDate() - 1; // for array index
    const newDailyQuestions = [...analytics.dailyQuestions];
    newDailyQuestions[today] = (newDailyQuestions[today] || 0) + 1;
    
    set({
      analytics: {
        ...analytics,
        totalQuestions: analytics.totalQuestions + 1,
        dailyQuestions: newDailyQuestions,
      }
    });
  },
  
  trackAnswer: (answer: string, responseTime: number) => {
    const { analytics } = get();
    const newResponseTime = Math.round((analytics.responseTime + responseTime) / 2);
    
    set({
      analytics: {
        ...analytics,
        responseTime: newResponseTime,
      }
    });
  },
  
  addActivity: (activity: ActivityRecord) => {
    const { analytics } = get();
    const newActivities = [activity, ...analytics.recentActivities].slice(0, 10); // Keep only last 10
    
    set({
      analytics: {
        ...analytics,
        recentActivities: newActivities,
      }
    });
  },
}),
    {
      name: 'voice-qa-storage',
      partialize: (state) => ({
        chatHistory: state.chatHistory,
        currentChatId: state.currentChatId,
        analytics: state.analytics,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && (!state.chatHistory || state.chatHistory.length === 0)) {
          state.chatHistory = createDummyChatHistory();
        }
        if (state && !state.analytics) {
          state.analytics = createInitialAnalytics();
        }
      },
    }
  )
);