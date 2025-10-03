import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService, User } from '../api/auth.service'; // Importa o AuthService e a interface User

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (cpfOrEmail: string, password: string) => Promise<boolean>;
  signUp: (cpfOrEmail: string, password: string) => Promise<boolean>;
  restoreSession: () => Promise<void>;
  signOut: () => Promise<void>;
  setError: (message: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true, 
  isAuthenticated: false,
  error: null,

  signIn: async (cpfOrEmail, password) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken, user } = await AuthService.login(cpfOrEmail, password);

      await SecureStore.setItemAsync('userToken', accessToken);
      await AsyncStorage.setItem('userProfile', JSON.stringify(user));

      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      const message = err.message || 'Credenciais inválidas. Tente novamente.'; 
      set({ error: message, isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  signUp: async (cpfOrEmail, password) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken, user } = await AuthService.createPassword(cpfOrEmail, password);

      await SecureStore.setItemAsync('userToken', accessToken);
      await AsyncStorage.setItem('userProfile', JSON.stringify(user));

      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      const message = err.message || 'Erro ao criar conta. Verifique os dados.'; 
      set({ error: message, isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userProfileString = await AsyncStorage.getItem('userProfile');

      if (token && userProfileString) {
        const user = JSON.parse(userProfileString) as User; 
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      console.error('Falha ao restaurar sessão:', e);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await SecureStore.deleteItemAsync('userToken');
      await AsyncStorage.removeItem('userProfile');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    } catch (e) {
      console.error('Falha ao fazer logout:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (message) => set({ error: message }),
}));