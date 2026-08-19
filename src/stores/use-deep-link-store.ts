import { create } from "zustand";

interface DeepLinkState {
  urls: string[];
  addUrls: (urls: string[]) => void;
}

export const useDeepLinkStore = create<DeepLinkState>((set) => ({
  urls: [],
  addUrls: (urls) =>
    set((state) => ({
      urls: [...urls, ...state.urls]
        .filter((url, index, all) => all.indexOf(url) === index)
        .slice(0, 5),
    })),
}));
