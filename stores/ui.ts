import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'ndc-ui-storage',
      // Only persist theme, onboarding progress, and QA preferences
      partialize: (state) => ({
        theme: state.theme,
        currentOnboardingStep: state.currentOnboardingStep,
        onboardingData: state.onboardingData,
        qaFilters: state.qaFilters,
        qaSidebarOpen: state.qaSidebarOpen,
      }),
    }
  )
)
