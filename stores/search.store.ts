import { create } from "zustand";
import {
  SearchParams,
  SearchResult,
  searchAllResources,
} from "../lib/api/search.api";
import { getErrorMessage } from "../lib/utils/errorHandler";

interface SearchStore {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  lastSearchParams: SearchParams | null;

  searchResources: (params: SearchParams) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
  resetStore: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  results: [],
  isLoading: false,
  error: null,
  lastSearchParams: null,

  searchResources: async (params: SearchParams) => {
    set({ isLoading: true, error: null, lastSearchParams: params });
    try {
      const response = await searchAllResources(params);
      const results = response.results || [];
      set({ results, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to search resources",
        isLoading: false,
        results: [],
      });
    }
  },

  clearResults: () => {
    set({ results: [], error: null });
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set({
      results: [],
      isLoading: false,
      error: null,
      lastSearchParams: null,
    });
  },
}));
