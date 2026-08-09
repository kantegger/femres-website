import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserInteractions {
  likes: string[];
  bookmarks: string[];
}

interface AuthState {
  user: User | null;
  interactions: UserInteractions;
  isAuthenticated: boolean;
  isLoading: boolean;

  // API methods
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateUsername: (username: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  fetchInteractions: () => Promise<void>;

  // Content interactions
  toggleLike: (contentId: string, contentType: string) => Promise<void>;
  toggleBookmark: (contentId: string, contentType: string) => Promise<void>;
  isLiked: (contentId: string) => boolean;
  isBookmarked: (contentId: string) => boolean;

  // Utility
  getAuthHeaders: () => Record<string, string>;
}

// API utility functions
const apiUrl = (endpoint: string) => `/api${endpoint}`;

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      interactions: {
        likes: [],
        bookmarks: []
      },
      isAuthenticated: false,
      isLoading: false,

      getAuthHeaders: () => {
        return {};
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const url = apiUrl('/auth/register');

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
          });


          if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
              const text = await response.text();
              if (text) {
                try {
                  const data = JSON.parse(text);
                  errorMessage = data.error || errorMessage;
                } catch (e) {
                  errorMessage = text || errorMessage;
                }
              }
            } catch (e) {
            }
            set({ isLoading: false });
            return { success: false, error: errorMessage };
          }

          const data = await response.json();

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false
          });

          // Fetch user interactions
          await get().fetchInteractions();

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: `Network error: ${getErrorMessage(error)}` };
        }
      },

      login: async (identifier: string, password: string) => {
        set({ isLoading: true });
        try {
          const url = apiUrl('/auth/login');

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
          });


          if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
              const text = await response.text();
              if (text) {
                try {
                  const data = JSON.parse(text);
                  errorMessage = data.error || errorMessage;
                } catch (e) {
                  errorMessage = text || errorMessage;
                }
              }
            } catch (e) {
            }
            set({ isLoading: false });
            return { success: false, error: errorMessage };
          }

          const data = await response.json();

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false
          });

          // Fetch user interactions
          await get().fetchInteractions();

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: `Network error: ${getErrorMessage(error)}` };
        }
      },

      updateUsername: async (username: string) => {
        const { getAuthHeaders } = get();
        set({ isLoading: true });

        try {
          const response = await fetch(apiUrl('/auth/update-username'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            },
            body: JSON.stringify({ username })
          });

          if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
              const text = await response.text();
              if (text) {
                try {
                  const data = JSON.parse(text);
                  errorMessage = data.error || errorMessage;
                } catch (e) {
                  errorMessage = text || errorMessage;
                }
              }
            } catch (e) {
            }
            set({ isLoading: false });
            return { success: false, error: errorMessage };
          }

          const data = await response.json();

          set({
            user: data.user,
            isLoading: false
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: `Network error: ${getErrorMessage(error)}` };
        }
      },

      deleteAccount: async (password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(apiUrl('/auth/account'), {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            set({ isLoading: false });
            return { success: false, error: data.error || `HTTP ${response.status}` };
          }

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            interactions: { likes: [], bookmarks: [] }
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: `Network error: ${getErrorMessage(error)}` };
        }
      },

      refreshUser: async () => {
        try {
          const response = await fetch(apiUrl('/auth/me'), {
            method: 'GET'
          });

          if (response.ok) {
            const data = await response.json();
            set({
              user: data.user,
              isAuthenticated: true
            });
            await get().fetchInteractions();
          } else {
            set({
              user: null,
              isAuthenticated: false,
              interactions: { likes: [], bookmarks: [] }
            });
          }
        } catch (error) {
          console.error('Error refreshing user:', error);
        }
      },

      logout: () => {
        void fetch(apiUrl('/auth/logout'), { method: 'POST' }).catch(() => {});
        set({
          user: null,
          isAuthenticated: false,
          interactions: { likes: [], bookmarks: [] }
        });
      },

      toggleLike: async (contentId: string, contentType: string) => {
        const { getAuthHeaders, interactions } = get();

        try {
          const response = await fetch(apiUrl(`/interactions/${contentId}`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            },
            body: JSON.stringify({
              content_type: contentType,
              interaction_type: 'like'
            })
          });

          if (response.ok) {
            const data = await response.json();
            const likes = data.active
              ? [...interactions.likes, contentId]
              : interactions.likes.filter(id => id !== contentId);
            set({ interactions: { ...interactions, likes } });
          }
        } catch (error) {
          console.error('Error toggling like:', error);
        }
      },

      toggleBookmark: async (contentId: string, contentType: string) => {
        const { getAuthHeaders, interactions } = get();

        try {
          const response = await fetch(apiUrl(`/interactions/${contentId}`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            },
            body: JSON.stringify({
              content_type: contentType,
              interaction_type: 'bookmark'
            })
          });

          if (response.ok) {
            const data = await response.json();
            const bookmarks = data.active
              ? [...interactions.bookmarks, contentId]
              : interactions.bookmarks.filter(id => id !== contentId);
            set({ interactions: { ...interactions, bookmarks } });
          }
        } catch (error) {
          console.error('Error toggling bookmark:', error);
        }
      },

      isLiked: (contentId: string) => {
        return get().interactions.likes.includes(contentId);
      },

      isBookmarked: (contentId: string) => {
        return get().interactions.bookmarks.includes(contentId);
      },

      fetchInteractions: async () => {
        const { getAuthHeaders } = get();

        try {
          const response = await fetch(apiUrl('/users/interactions'), {
            method: 'GET',
            headers: getAuthHeaders()
          });


          if (response.ok) {
            const data = await response.json();
            set({
              interactions: {
                likes: data.likes || [],
                bookmarks: data.bookmarks || []
              }
            });
          }
        } catch (error) {
        }
      }
    }),
    {
      name: 'femhub-auth-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => { },
        removeItem: () => { },
      }),
      partialize: (state) => ({
        interactions: state.interactions
      })
    }
  )
);
