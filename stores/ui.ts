import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
    }),
    {
      name: 'ndc-ui-storage',
      // Only persist theme
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
)
