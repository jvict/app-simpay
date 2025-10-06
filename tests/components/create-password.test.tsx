import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import CreatePasswordScreen from '../../app/(public)/create-password';
import { useAuthStore } from '../../src/features/auth/store/auth.store';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  Stack: {
    Screen: ({ children, ...props }: any) => children,
  },
}));

jest.mock('../../src/features/auth/store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('tamagui', () => ({
  YStack: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  H2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  Input: ({ onChangeText, value, placeholder, ...props }: any) => (
    <input
      {...props}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChangeText?.(e.target.value)}
      data-testid={props.id || props['data-testid']}
    />
  ),
  Button: ({ children, onPress, disabled, ...props }: any) => (
    <button {...props} onClick={onPress} disabled={disabled}>
      {children}
    </button>
  ),
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Progress: ({ children, value, ...props }: any) => (
    <div {...props} data-testid="progress" data-value={value}>
      {children}
    </div>
  ),
}));

describe('CreatePasswordScreen', () => {
  const mockRouter = {
    replace: jest.fn(),
    push: jest.fn(),
  };

  const mockSignUp = jest.fn();
  const mockAuthStore = {
    signUp: mockSignUp,
    error: null,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuthStore as unknown as jest.Mock ).mockImplementation((selector) => 
      selector(mockAuthStore)
    );
  });

  it('deve renderizar todos os elementos da tela', () => {
    render(<CreatePasswordScreen />);

    expect(screen.getByText('Primeiro Acesso')).toBeTruthy();
    expect(screen.getByText('CPF/E-mail')).toBeTruthy();
    expect(screen.getByText('Senha')).toBeTruthy();
    expect(screen.getByText('Confirmar Senha')).toBeTruthy();
    expect(screen.getByText('Criar Senha e Entrar')).toBeTruthy();
    expect(screen.getByText('Já tenho conta')).toBeTruthy();
  });

  it('deve atualizar os campos do formulário corretamente', () => {
    render(<CreatePasswordScreen />);

    const cpfInput = screen.getByTestId('cpfOrEmail');
    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByTestId('confirmPassword');

    fireEvent.changeText(cpfInput, 'test@email.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.changeText(confirmPasswordInput, 'Password123');

    expect(cpfInput.props.value).toBe('test@email.com');
    expect(passwordInput.props.value).toBe('Password123');
    expect(confirmPasswordInput.props.value).toBe('Password123');
  });

  it('deve calcular a força da senha corretamente', () => {
    render(<CreatePasswordScreen />);

    const passwordInput = screen.getByTestId('password');
    const progressBar = screen.getByTestId('progress');
    fireEvent.changeText(passwordInput, 'password');
    expect(progressBar.props['data-value']).toBe(50); 

    fireEvent.changeText(passwordInput, 'Password123');
    expect(progressBar.props['data-value']).toBe(100);
  });

  it('deve exibir erro quando CPF/Email não for preenchido', async () => {
    render(<CreatePasswordScreen />);

    const submitButton = screen.getByText('Criar Senha e Entrar');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('CPF/E-mail é obrigatório.')).toBeTruthy();
    });
  });

  it('deve exibir erro quando senhas não coincidirem', async () => {
    render(<CreatePasswordScreen />);

    const cpfInput = screen.getByTestId('cpfOrEmail');
    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByTestId('confirmPassword');
    const submitButton = screen.getByText('Criar Senha e Entrar');

    fireEvent.changeText(cpfInput, 'test@email.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.changeText(confirmPasswordInput, 'DifferentPassword123');

    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem.')).toBeTruthy();
    });
  });

  it('deve chamar signUp e navegar para home quando formulário válido', async () => {
    mockSignUp.mockResolvedValue(true);

    render(<CreatePasswordScreen />);

    const cpfInput = screen.getByTestId('cpfOrEmail');
    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByTestId('confirmPassword');
    const submitButton = screen.getByText('Criar Senha e Entrar');

    fireEvent.changeText(cpfInput, 'test@email.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.changeText(confirmPasswordInput, 'Password123');

    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@email.com', 'Password123');
      expect(mockRouter.replace).toHaveBeenCalledWith('/(app)/home');
    });
  });

  it('deve exibir erro quando signUp falhar', async () => {
    mockSignUp.mockResolvedValue(false);
    const mockAuthStoreWithError = {
      ...mockAuthStore,
      error: 'Erro ao criar conta',
    };

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => 
      selector(mockAuthStoreWithError)
    );

    render(<CreatePasswordScreen />);

    const cpfInput = screen.getByTestId('cpfOrEmail');
    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByTestId('confirmPassword');
    const submitButton = screen.getByText('Criar Senha e Entrar');

    fireEvent.changeText(cpfInput, 'test@email.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.changeText(confirmPasswordInput, 'Password123');

    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erro ao criar conta')).toBeTruthy();
    });
  });

  it('deve validar todos os critérios de senha', async () => {
    render(<CreatePasswordScreen />);

    const cpfInput = screen.getByTestId('cpfOrEmail');
    const passwordInput = screen.getByTestId('password');
    const submitButton = screen.getByText('Criar Senha e Entrar');

    fireEvent.changeText(cpfInput, 'test@email.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('A senha deve conter pelo menos uma letra maiúscula.')).toBeTruthy();
    });

    fireEvent.changeText(passwordInput, 'PASSWORD123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('A senha deve conter pelo menos uma letra minúscula.')).toBeTruthy();
    });

    fireEvent.changeText(passwordInput, 'Password');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText('A senha deve conter pelo menos um número.')).toBeTruthy();
    });
  });
});