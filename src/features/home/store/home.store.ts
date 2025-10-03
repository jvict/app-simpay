import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeService, FeedItem } from '../api/home.service';

interface HomeState {
  feed: FeedItem[];
  isLoadingFeed: boolean;
  hasOfflineData: boolean;
  error: string | null;

  fetchFeed: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  feed: [],
  isLoadingFeed: false,
  hasOfflineData: false,
  error: null,

  fetchFeed: async () => {
    set({ isLoadingFeed: true, error: null });
    let cachedFeedItems: FeedItem[] = [];

    try {
      const cachedFeedString = await AsyncStorage.getItem('homeFeed');
      if (cachedFeedString) {
        cachedFeedItems = JSON.parse(cachedFeedString);
        set({ feed: cachedFeedItems, hasOfflineData: true }); 
      }

      const { items: newFeedItems } = await HomeService.fetchHomeFeed();

      if (JSON.stringify(newFeedItems) !== JSON.stringify(cachedFeedItems)) {
        await AsyncStorage.setItem('homeFeed', JSON.stringify(newFeedItems));
        set({ feed: newFeedItems, hasOfflineData: false });
      } else {
        set({ hasOfflineData: false });
      }
      set({ isLoadingFeed: false, error: null });
    } catch (err: any) {
      console.error('Falha ao carregar o feed da Home:', err);

      if (!get().feed.length) {
        set({ error: err.message || 'Falha ao carregar o feed. Verifique sua conexão.', isLoadingFeed: false, hasOfflineData: false });
      } else {
        set({ isLoadingFeed: false, hasOfflineData: true, error: err.message || 'Não foi possível atualizar o feed. Exibindo dados antigos.' });
      }
    }
  },
}));