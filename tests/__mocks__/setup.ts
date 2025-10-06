import { jest } from '@jest/globals';

jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: any) => null,
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock('tamagui', () => ({
  YStack: ({ children, ...props }: any) => children,
  H2: ({ children }: any) => children,
  Label: ({ children }: any) => children,
  Input: ({ onChangeText, value, ...props }: any) => ({
    props: { onChangeText, value, ...props },
  }),
  Button: ({ onPress, children, disabled }: any) => ({
    props: { onPress, children, disabled },
  }),
  Text: ({ children }: any) => children,
}));

const mockAuthStore = {
  signIn: jest.fn(),
  error: null,
  isLoading: false,
  setError: jest.fn(),
};

jest.mock('../../src/features/auth/store/auth.store', () => ({
  useAuthStore: (selector: any) => selector(mockAuthStore),
}));

export { mockAuthStore };