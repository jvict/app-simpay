import 'react-native';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import LoginScreen from '../../app/(public)/login';
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../../tamagui.config'; // Seu config Tamagui
import { useAuthStore } from '../../src/features/auth/store/auth.store';

import { beforeEach, describe, expect, jest } from '@jest/globals';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
  Stack: {
    Screen: ({ children }: any) => children,
  },
}));

jest.mock('../../src/features/auth/store/auth.store', () => ({
    useAuthStore: jest.fn(),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      signIn: jest.fn(),
      error: null,
      isLoading: false,
      setError: jest.fn(),
    });
  });

  const renderComponent = () =>
    render(
      <TamaguiProvider config={config}>
        <Theme name="light">
          <LoginScreen />
        </Theme>
      </TamaguiProvider>
    );

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Login')).toBeTruthy();
    expect(screen.getByPlaceholderText('Seu CPF ou E-mail')).toBeTruthy();
    expect(screen.getByPlaceholderText('Sua senha')).toBeTruthy();
    expect(screen.getByText('Entrar')).toBeTruthy();
    expect(screen.getByText('Criar Senha (Primeiro Acesso)')).toBeTruthy();
  });

  it('displays error messages for invalid input', async () => {
    renderComponent();

    const signInMock = jest.fn().mockResolvedValue(false);
    (useAuthStore as jest.Mock).mockReturnValue({
        signIn: signInMock,
        error: "Credenciais inválidas.",
        isLoading: false,
        setError: jest.fn(),
    });

    fireEvent.press(screen.getByText('Entrar'));
    expect(await screen.findByText('CPF/E-mail é obrigatório.')).toBeTruthy();
    expect(await screen.findByText('Senha é obrigatória.')).toBeTruthy();
    expect(signInMock).not.toHaveBeenCalled();
  });
});