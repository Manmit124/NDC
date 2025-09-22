# 🚀 NDC Development Guide

## 📋 **Table of Contents**
1. [Architecture Overview](#architecture-overview)
2. [When to Use What](#when-to-use-what)
3. [Creating New Hooks](#creating-new-hooks)
4. [Using Zustand Store](#using-zustand-store)
5. [Database Types](#database-types)
6. [Component Patterns](#component-patterns)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
8. [Code Examples](#code-examples)

---

## 🏗️ **Architecture Overview**

Our NDC app follows a **clean, scalable architecture** with clear separation of concerns:

```
📁 Project Structure
├── hooks/
│   ├── auth/useAuth.ts          # Authentication state
│   └── api/                     # Server state hooks
│       ├── useProfile.ts        # Profile CRUD operations
│       ├── useDashboard.ts      # Dashboard stats
│       └── useSearch.ts         # Search functionality
├── stores/
│   └── ui.ts                    # Client-side UI state
├── types/
│   └── database.ts              # TypeScript types
└── components/                  # React components
```

### **State Management Strategy**

- **Server State** → React Query (hooks/api/)
- **Client State** → Zustand (stores/)
- **Auth State** → React Query (hooks/auth/)

---

## 🎯 **When to Use What**

### **Use React Query Hooks When:**
✅ **Fetching data from database**
✅ **CRUD operations (Create, Read, Update, Delete)**
✅ **Authentication state**
✅ **Any server-side data that needs caching**

**Examples:**
- User profiles
- Dashboard statistics
- Search results
- Job listings (future)
- Q&A posts (future)

### **Use Zustand Store When:**
✅ **UI state that persists across pages**
✅ **Global application state**
✅ **User preferences**
✅ **Temporary client-side data**

**Examples:**
- Sidebar open/closed
- Theme (light/dark)
- Search query
- Modal states
- Form data (temporary)

### **Use Database Types When:**
✅ **Defining API responses**
✅ **Component props that use database data**
✅ **Form validation**
✅ **TypeScript interfaces**

---

## 🔧 **Creating New Hooks**

### **1. Server State Hook (React Query)**

**When to create:** Need to fetch/mutate server data

**Location:** `hooks/api/useYourFeature.ts`

**Template:**
```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { YourType } from '@/types/database'

const supabase = createClient()

// Fetch function
async function fetchYourData(): Promise<YourType[]> {
  const { data } = await supabase
    .from('your_table')
    .select('*')
  
  return data || []
}

// Update function
async function updateYourData(id: string, updates: Partial<YourType>): Promise<YourType> {
  const { data, error } = await supabase
    .from('your_table')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Read hook
export function useYourData() {
  return useQuery({
    queryKey: ['your-feature'],
    queryFn: fetchYourData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

// Mutation hook
export function useUpdateYourData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<YourType> }) =>
      updateYourData(id, updates),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['your-feature'] })
    },
  })
}
```

### **2. Query Keys Pattern**

**Location:** `lib/queryKeys.ts`

**Add your feature:**
```typescript
export const queryKeys = {
  // Existing...
  auth: ['auth'] as const,
  profile: {
    byUsername: (username: string) => ['profile', 'username', username] as const,
  },
  
  // Add your new feature
  yourFeature: {
    list: (filters?: any) => ['your-feature', filters] as const,
    detail: (id: string) => ['your-feature', id] as const,
  },
} as const
```

---

## 🗄️ **Using Zustand Store**

### **When to Add to UI Store:**

**✅ Good Examples:**
- Modal open/close states
- Search filters
- Theme preferences
- Sidebar state
- Temporary form data

**❌ Bad Examples:**
- User profile data (use React Query)
- Database records (use React Query)
- Authentication state (use React Query)

### **Adding New UI State:**

**Location:** `stores/ui.ts`

```typescript
interface UIState {
  // Existing state...
  
  // Add your new state
  yourFeature: YourType
  setYourFeature: (value: YourType) => void
  resetYourFeature: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Existing state...
      
      // Add your implementation
      yourFeature: defaultValue,
      setYourFeature: (value) => set({ yourFeature: value }),
      resetYourFeature: () => set({ yourFeature: defaultValue }),
    }),
    {
      name: 'ndc-ui-storage',
      // Only persist what you need
      partialize: (state) => ({
        theme: state.theme,
        yourFeature: state.yourFeature, // Add if needed
      }),
    }
  )
)
```

---

## 📊 **Database Types**

### **When to Add New Types:**

**✅ Create new types when:**
- Adding new database tables
- New API endpoints
- Complex data structures

**Location:** `types/database.ts`

### **Type Naming Convention:**
```typescript
// Main type (matches database row)
export interface YourTable {
  id: string
  name: string
  created_at: string
  updated_at: string
}

// Insert type (for creating new records)
export interface YourTableInsert extends Omit<YourTable, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

// Update type (for updating records)
export interface YourTableUpdate extends Partial<Omit<YourTable, 'id' | 'created_at'>> {
  updated_at?: string
}
```

### **Update Database Interface:**
```typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      // Add your new table
      your_table: {
        Row: YourTable
        Insert: YourTableInsert
        Update: YourTableUpdate
      }
    }
  }
}
```

---

## 🧩 **Component Patterns**

### **1. Smart vs Dumb Components**

**Smart Component (Container):**
```typescript
// Handles data fetching and state
export default function ProfilePageContainer({ username }: { username: string }) {
  const { data: profile, isLoading } = useProfile(username)
  const updateProfile = useUpdateProfile()
  
  if (isLoading) return <Loading />
  
  return (
    <ProfileCard 
      profile={profile} 
      onUpdate={(updates) => updateProfile.mutate({ profileId: profile.id, updates })}
    />
  )
}
```

**Dumb Component (Presentational):**
```typescript
// Only handles UI rendering
interface ProfileCardProps {
  profile: Profile
  onUpdate: (updates: Partial<Profile>) => void
}

export function ProfileCard({ profile, onUpdate }: ProfileCardProps) {
  return (
    <div>
      <h1>{profile.full_name}</h1>
      <button onClick={() => onUpdate({ bio: 'New bio' })}>
        Update
      </button>
    </div>
  )
}
```

### **2. Loading States Pattern**

```typescript
export default function YourComponent() {
  const { data, isLoading, error } = useYourData()
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!data) return <EmptyState />
  
  return <YourContent data={data} />
}
```

---

## ❌ **Common Mistakes to Avoid**

### **1. Don't Mix State Management**
```typescript
// ❌ BAD: Using useState for server data
const [profile, setProfile] = useState(null)
useEffect(() => {
  fetchProfile().then(setProfile)
}, [])

// ✅ GOOD: Use React Query
const { data: profile } = useProfile(username)
```

### **2. Don't Put Server Data in Zustand**
```typescript
// ❌ BAD: Server data in Zustand
const useProfileStore = create((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile })
}))

// ✅ GOOD: Server data in React Query
const { data: profile } = useProfile(username)
```

### **3. Don't Forget Error Handling**
```typescript
// ❌ BAD: No error handling
const { data } = useProfile(username)

// ✅ GOOD: Handle all states
const { data, isLoading, error } = useProfile(username)
if (error) return <ErrorMessage />
```

### **4. Don't Skip TypeScript**
```typescript
// ❌ BAD: Using any
const updateProfile = (data: any) => { ... }

// ✅ GOOD: Proper typing
const updateProfile = (data: Partial<Profile>) => { ... }
```

---

## 💡 **Code Examples**

### **Example 1: Adding Jobs Feature**

**1. Add Database Type:**
```typescript
// types/database.ts
export interface Job {
  id: string
  title: string
  description: string
  company: string
  location?: string
  remote: boolean
  salary_min?: number
  salary_max?: number
  skills_required: string[]
  created_at: string
  updated_at: string
}
```

**2. Create Hook:**
```typescript
// hooks/api/useJobs.ts
export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}
```

**3. Use in Component:**
```typescript
// app/jobs/page.tsx
export default function JobsPage() {
  const { data: jobs, isLoading } = useJobs()
  const createJob = useCreateJob()
  
  if (isLoading) return <Loading />
  
  return (
    <div>
      {jobs?.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
```

### **Example 2: Adding Modal State**

**1. Add to UI Store:**
```typescript
// stores/ui.ts
interface UIState {
  // Existing...
  jobFormOpen: boolean
  openJobForm: () => void
  closeJobForm: () => void
}

// Implementation...
jobFormOpen: false,
openJobForm: () => set({ jobFormOpen: true }),
closeJobForm: () => set({ jobFormOpen: false }),
```

**2. Use in Component:**
```typescript
export default function JobsPage() {
  const { jobFormOpen, openJobForm, closeJobForm } = useUIStore()
  
  return (
    <div>
      <button onClick={openJobForm}>Create Job</button>
      {jobFormOpen && (
        <JobFormModal onClose={closeJobForm} />
      )}
    </div>
  )
}
```

---

## 🎯 **Quick Decision Tree**

```
Need to manage state?
├── Is it server data? → Use React Query Hook
├── Is it UI state? → Use Zustand Store
└── Is it component-specific? → Use useState

Need to fetch data?
├── From database? → Create React Query Hook
├── From API? → Create React Query Hook
└── Static data? → Import directly

Need TypeScript types?
├── Database related? → Add to types/database.ts
├── Component props? → Define inline or in component file
└── Utility types? → Create separate type file
```

---

## ✅ **Checklist for New Features**

**Before you start:**
- [ ] Identify if you need server state (React Query) or client state (Zustand)
- [ ] Check if similar patterns exist in the codebase
- [ ] Plan your TypeScript interfaces

**During development:**
- [ ] Create database types first
- [ ] Add query keys if using React Query
- [ ] Handle loading, error, and empty states
- [ ] Add proper TypeScript types
- [ ] Test optimistic updates (if applicable)

**Before submitting:**
- [ ] No linting errors
- [ ] Follows existing patterns
- [ ] Proper error handling
- [ ] TypeScript types are correct
- [ ] Loading states work properly

---

## 🚀 **Getting Started**

1. **Read this guide completely**
2. **Look at existing code examples** (useAuth, useProfile, useSearch)
3. **Follow the patterns** shown in this guide
4. **Ask questions** if something is unclear
5. **Test thoroughly** before submitting

---

**Remember: Consistency is key! Follow these patterns and your code will integrate seamlessly with the existing architecture.** 🎯
