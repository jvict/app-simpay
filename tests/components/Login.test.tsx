import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import LoginScreen from '../../app/(public)/login';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ options }: any) => null,
  },
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock('../../src/features/auth/store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

describe('LoginScreen', () => {
  const mockUseAuthStore = require('../../src/features/auth/store/auth.store').useAuthStore;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        signIn: jest.fn(),
        error: null,
        isLoading: false,
        setError: jest.fn(),
      };
      return selector(state);
    });
  });

  describe('Renderização', () => {
    it('deve renderizar todos os elementos da tela', () => {
      const { getByText, getByPlaceholderText } = render(<LoginScreen />);

      expect(getByText('Login')).toBeTruthy();
      expect(getByText('CPF/E-mail')).toBeTruthy();
      expect(getByText('Senha')).toBeTruthy();
      expect(getByPlaceholderText('Seu CPF ou E-mail')).toBeTruthy();
      expect(getByPlaceholderText('Sua senha')).toBeTruthy();
      expect(getByText('Entrar')).toBeTruthy();
      expect(getByText('Criar Senha (Primeiro Acesso)')).toBeTruthy();
    });

    it('deve mostrar "Entrando..." quando isLoading for true', () => {
      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          signIn: jest.fn(),
          error: null,
          isLoading: true,
          setError: jest.fn(),
        };
        return selector(state);
      });

      const { getByText } = render(<LoginScreen />);
      expect(getByText('Entrando...')).toBeTruthy();
    });
  });

  describe('Validação de Formulário', () => {
    it('deve mostrar erro quando CPF/Email estiver vazio', async () => {
      const { getByText } = render(<LoginScreen />);
      
      fireEvent.press(getByText('Entrar'));

      await waitFor(() => {
        expect(getByText('CPF/E-mail é obrigatório.')).toBeTruthy();
      });
    });

    it('deve mostrar erro quando senha estiver vazia', async () => {
      const { getByText, getByPlaceholderText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Seu CPF ou E-mail'), 'test@email.com');
      fireEvent.press(getByText('Entrar'));

      await waitFor(() => {
        expect(getByText('Senha é obrigatória.')).toBeTruthy();
      });
    });

    it('deve mostrar ambos os erros quando ambos os campos estiverem vazios', async () => {
      const { getByText } = render(<LoginScreen />);
      
      fireEvent.press(getByText('Entrar'));

      await waitFor(() => {
        expect(getByText('CPF/E-mail é obrigatório.')).toBeTruthy();
        expect(getByText('Senha é obrigatória.')).toBeTruthy();
      });
    });
  });

  describe('Interações do Usuário', () => {
    it('deve atualizar o valor do campo CPF/Email', () => {
      const { getByPlaceholderText } = render(<LoginScreen />);
      const input = getByPlaceholderText('Seu CPF ou E-mail');

      fireEvent.changeText(input, 'test@email.com');
      
      expect(input.props.value).toBe('test@email.com');
    });

    it('deve atualizar o valor do campo senha', () => {
      const { getByPlaceholderText } = render(<LoginScreen />);
      const input = getByPlaceholderText('Sua senha');

      fireEvent.changeText(input, 'password123');
      
      expect(input.props.value).toBe('password123');
    });

    it('deve limpar erros quando o usuário digitar nos campos', async () => {
      const { getByText, getByPlaceholderText, queryByText } = render(<LoginScreen />);
      
      fireEvent.press(getByText('Entrar'));
      
      await waitFor(() => {
        expect(getByText('CPF/E-mail é obrigatório.')).toBeTruthy();
      });

      fireEvent.changeText(getByPlaceholderText('Seu CPF ou E-mail'), 'test@email.com');

      await waitFor(() => {
        expect(queryByText('CPF/E-mail é obrigatório.')).toBeNull();
      });
    });
  });

  describe('Autenticação', () => {
    it('deve chamar signIn com dados corretos quando o formulário for válido', async () => {
      const mockSignIn = jest.fn().mockResolvedValue(true as never);
      
      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          signIn: mockSignIn,
          error: null,
          isLoading: false,
          setError: jest.fn(),
        };
        return selector(state);
      });

      const { getByText, getByPlaceholderText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Seu CPF ou E-mail'), 'test@email.com');
      fireEvent.changeText(getByPlaceholderText('Sua senha'), 'password123');
      fireEvent.press(getByText('Entrar'));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@email.com', 'password123');
      });
    });

    it('deve redirecionar para home quando login for bem-sucedido', async () => {
      const mockSignIn = jest.fn().mockResolvedValue(true as never);
      
      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          signIn: mockSignIn,
          error: null,
          isLoading: false,
          setError: jest.fn(),
        };
        return selector(state);
      });

      const { getByText, getByPlaceholderText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Seu CPF ou E-mail'), 'test@email.com');
      fireEvent.changeText(getByPlaceholderText('Sua senha'), 'password123');
      fireEvent.press(getByText('Entrar'));

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/(app)/home');
      });
    });

    it('deve mostrar erro quando login falhar', async () => {
      const mockSignIn = jest.fn().mockResolvedValue(false as never);
      
      mockUseAuthStore.mockImplementation((selector: any) => {
        const state = {
          signIn: mockSignIn,
          error: 'Credenciais inválidas',
          isLoading: false,
          setError: jest.fn(),
        };
        return selector(state);
      });

      const { getByText, getByPlaceholderText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Seu CPF ou E-mail'), 'test@email.com');
      fireEvent.changeText(getByPlaceholderText('Sua senha'), 'wrongpassword');
      fireEvent.press(getByText('Entrar'));

      await waitFor(() => {
        expect(getByText('Credenciais inválidas')).toBeTruthy();
      });
    });
  });

  describe('Navegação', () => {
    it('deve navegar para tela de criar senha', () => {
      const { getByText } = render(<LoginScreen />);
      
      fireEvent.press(getByText('Criar Senha (Primeiro Acesso)'));
      
      expect(mockPush).toHaveBeenCalledWith('/(public)/create-password');
    });
  });
});