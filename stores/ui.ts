import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TypingIndicator } from '@/types/database'

// Onboarding data types
interface OnboardingData {
  step1: {
    username: string
    fullName: string
  }
  step2: {
    bio: string
    skills: string[]
  }
  step3: {
    githubUrl: string
    linkedinUrl: string
    portfolioUrl: string
  }
}

// Chat-related UI state types
interface ChatState {
  activeRoomId: string | null
  isAnonymousMode: boolean
  sessionToken: string
  typingIndicators: TypingIndicator[]
  showRoomList: boolean
  messageInput: string
  replyingTo: string | null
}

interface UIState {
  // Sidebar state - matches your ClientLayout pattern
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  
  // Theme state
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleTheme: () => void
  
  // Modal state - for profile editing, etc.
  modals: Record<string, boolean>
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  toggleModal: (modalId: string) => void
  
  // Search state
  searchQuery: string
  setSearchQuery: (query: string) => void
  clearSearch: () => void
  
  // Onboarding state
  currentOnboardingStep: number
  onboardingData: OnboardingData
  setOnboardingStep: (step: number) => void
  updateOnboardingData: <K extends keyof OnboardingData>(step: K, data: Partial<OnboardingData[K]>) => void
  resetOnboarding: () => void
  
  // QA state - Discord-like interface
  qaFilters: {
    tag?: string
    solved?: boolean
    category?: string
  }
  setQAFilters: (filters: Partial<UIState['qaFilters']>) => void
  clearQAFilters: () => void
  
  // QA modals and UI state
  askQuestionModalOpen: boolean
  openAskQuestionModal: () => void
  closeAskQuestionModal: () => void
  
  // Selected question for detail view (mobile/responsive)
  selectedQuestionId: string | null
  setSelectedQuestionId: (id: string | null) => void
  
  // QA sidebar state (categories/filters)
  qaSidebarOpen: boolean
  setQASidebarOpen: (open: boolean) => void
  toggleQASidebar: () => void

  // Chat state
  chat: ChatState
  setActiveRoom: (roomId: string | null) => void
  toggleAnonymousMode: () => void
  setAnonymousMode: (isAnonymous: boolean) => void
  addTypingIndicator: (indicator: TypingIndicator) => void
  removeTypingIndicator: (anonymousUserId: string) => void
  clearTypingIndicators: () => void
  toggleRoomList: () => void
  setRoomListVisible: (visible: boolean) => void
  setMessageInput: (message: string) => void
  setReplyingTo: (messageId: string | null) => void
  generateSessionToken: () => void
}

// Generate a unique session token for anonymous users
function generateSessionToken(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Sidebar - matches your ClientLayout useState pattern
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      
      // Modals - for profile editing modal, etc.
      modals: {},
      openModal: (modalId) => set((state) => ({
        modals: { ...state.modals, [modalId]: true }
      })),
      closeModal: (modalId) => set((state) => ({
        modals: { ...state.modals, [modalId]: false }
      })),
      toggleModal: (modalId) => set((state) => ({
        modals: { ...state.modals, [modalId]: !state.modals[modalId] }
      })),
      
      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      clearSearch: () => set({ searchQuery: '' }),
      
      // Onboarding - temporary client state for multi-step flow
      currentOnboardingStep: 1,
      onboardingData: {
        step1: { username: '', fullName: '' },
        step2: { bio: '', skills: [] },
        step3: { githubUrl: '', linkedinUrl: '', portfolioUrl: '' }
      },
      setOnboardingStep: (step) => {
        console.log('Setting onboarding step to:', step);
        set({ currentOnboardingStep: step });
      },
      updateOnboardingData: (step, data) => {
        console.log('Updating onboarding data:', step, data);
        set((state) => ({
          onboardingData: {
            ...state.onboardingData,
            [step]: { ...state.onboardingData[step], ...data }
          }
        }));
      },
      resetOnboarding: () => set({
        currentOnboardingStep: 1,
        onboardingData: {
          step1: { username: '', fullName: '' },
          step2: { bio: '', skills: [] },
          step3: { githubUrl: '', linkedinUrl: '', portfolioUrl: '' }
        }
      }),
      
      // QA state implementation
      qaFilters: {},
      setQAFilters: (filters) => set((state) => ({
        qaFilters: { ...state.qaFilters, ...filters }
      })),
      clearQAFilters: () => set({ qaFilters: {} }),
      
      // QA modals
      askQuestionModalOpen: false,
      openAskQuestionModal: () => set({ askQuestionModalOpen: true }),
      closeAskQuestionModal: () => set({ askQuestionModalOpen: false }),
      
      // Selected question (for mobile/responsive)
      selectedQuestionId: null,
      setSelectedQuestionId: (id) => set({ selectedQuestionId: id }),
      
      // QA sidebar
      qaSidebarOpen: true, // Default open on desktop
      setQASidebarOpen: (open) => set({ qaSidebarOpen: open }),
      toggleQASidebar: () => set((state) => ({ qaSidebarOpen: !state.qaSidebarOpen })),

      // Chat state - client-side UI state for chat functionality
      chat: {
        activeRoomId: null,
        isAnonymousMode: true, // Default to anonymous for privacy
        sessionToken: generateSessionToken(),
        typingIndicators: [],
        showRoomList: true,
        messageInput: '',
        replyingTo: null,
      },
      
      // Chat actions
      setActiveRoom: (roomId) => set((state) => ({
        chat: { ...state.chat, activeRoomId: roomId }
      })),
      
      toggleAnonymousMode: () => set((state) => ({
        chat: { ...state.chat, isAnonymousMode: !state.chat.isAnonymousMode }
      })),
      
      setAnonymousMode: (isAnonymous) => set((state) => ({
        chat: { ...state.chat, isAnonymousMode: isAnonymous }
      })),
      
      addTypingIndicator: (indicator) => set((state) => ({
        chat: {
          ...state.chat,
          typingIndicators: [
            ...state.chat.typingIndicators.filter(
              t => t.anonymous_user_id !== indicator.anonymous_user_id
            ),
            indicator
          ]
        }
      })),
      
      removeTypingIndicator: (anonymousUserId) => set((state) => ({
        chat: {
          ...state.chat,
          typingIndicators: state.chat.typingIndicators.filter(
            t => t.anonymous_user_id !== anonymousUserId
          )
        }
      })),
      
      clearTypingIndicators: () => set((state) => ({
        chat: { ...state.chat, typingIndicators: [] }
      })),
      
      toggleRoomList: () => set((state) => ({
        chat: { ...state.chat, showRoomList: !state.chat.showRoomList }
      })),
      
      setRoomListVisible: (visible) => set((state) => ({
        chat: { ...state.chat, showRoomList: visible }
      })),
      
      setMessageInput: (message) => set((state) => ({
        chat: { ...state.chat, messageInput: message }
      })),
      
      setReplyingTo: (messageId) => set((state) => ({
        chat: { ...state.chat, replyingTo: messageId }
      })),
      
      generateSessionToken: () => set((state) => ({
        chat: { ...state.chat, sessionToken: generateSessionToken() }
      })),
    }),
    {
      name: 'ndc-ui-storage',
      // Persist theme, onboarding progress, and chat preferences
      partialize: (state) => ({
        theme: state.theme,
        currentOnboardingStep: state.currentOnboardingStep,
        onboardingData: state.onboardingData,
        qaFilters: state.qaFilters,
        qaSidebarOpen: state.qaSidebarOpen,
        chat: {
          isAnonymousMode: state.chat.isAnonymousMode,
          sessionToken: state.chat.sessionToken,
        },
      }),
    }
  )
)
