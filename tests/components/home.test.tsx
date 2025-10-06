import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import HomeScreen from '../../app/(app)/home';
import { useAuthStore } from '../../src/features/auth/store/auth.store';
import { useHomeStore } from '../../src/features/home/store/home.store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  Stack: {
    Screen: ({ children, ...props }: any) => children,
  },
}));

jest.mock('../../src/features/auth/store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../src/features/home/store/home.store', () => ({
  useHomeStore: jest.fn(),
}));

jest.mock('date-fns', () => ({
  format: jest.fn(),
}));

jest.mock('date-fns/locale', () => ({
  ptBR: {},
}));

jest.mock('tamagui', () => ({
  YStack: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  XStack: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  H2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  H3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Button: ({ children, onPress, ...props }: any) => (
    <button {...props} onClick={onPress}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: any) => {
    const CardComponent = ({ children, ...cardProps }: any) => (
      <div {...props} {...cardProps}>{children}</div>
    );
    CardComponent.Header = ({ children, ...headerProps }: any) => (
      <div {...headerProps}>{children}</div>
    );
    CardComponent.Footer = ({ children, ...footerProps }: any) => (
      <div {...footerProps}>{children}</div>
    );
    return <CardComponent>{children}</CardComponent>;
  },
  Spinner: ({ ...props }: any) => <div {...props} data-testid="spinner">Loading...</div>,
  ScrollView: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

describe('HomeScreen', () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  const mockSignOut = jest.fn();
  const mockFetchFeed = jest.fn();

  const mockAuthStore = {
    user: {
      name: 'João Silva',
      cpfOrEmail: 'joao@email.com',
    },
    signOut: mockSignOut,
  };

  const mockHomeStore = {
    feed: [],
    isLoadingFeed: false,
    hasOfflineData: false,
    error: null,
    fetchFeed: mockFetchFeed,
  };

  const mockFeedData = [
    {
      id: '1',
      title: 'Título 1',
      subtitle: 'Subtítulo 1',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      title: 'Título 2',
      subtitle: 'Subtítulo 2',
      createdAt: '2024-01-16T14:45:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => 
      selector(mockAuthStore)
    );
    (useHomeStore as unknown as jest.Mock).mockReturnValue(mockHomeStore);
    (format as jest.Mock).mockImplementation((date, formatStr) => 
      `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    );
  });

  it('deve renderizar a tela inicial corretamente', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Olá, João Silva!')).toBeTruthy();
    expect(screen.getByText('Sair')).toBeTruthy();
    expect(screen.getByText('Seu Feed')).toBeTruthy();
    expect(screen.getByText('Informações Rápidas')).toBeTruthy();
    expect(screen.getByText('Saldo')).toBeTruthy();
    expect(screen.getByText('R\$ 1.234,56')).toBeTruthy();
    expect(screen.getByText('Notificações')).toBeTruthy();
    expect(screen.getByText('3 Novas')).toBeTruthy();
  });

  it('deve exibir nome do usuário quando disponível', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Olá, João Silva!')).toBeTruthy();
  });

  it('deve exibir cpfOrEmail quando nome não estiver disponível', () => {
    const mockAuthStoreWithoutName = {
      ...mockAuthStore,
      user: {
        cpfOrEmail: 'joao@email.com',
      },
    };

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => 
      selector(mockAuthStoreWithoutName)
    );

    render(<HomeScreen />);
    expect(screen.getByText('Olá, joao@email.com!')).toBeTruthy();
  });

  it('deve exibir "Usuário" quando não houver dados do usuário', () => {
    const mockAuthStoreWithoutUser = {
      ...mockAuthStore,
      user: null,
    };

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => 
      selector(mockAuthStoreWithoutUser)
    );

    render(<HomeScreen />);
    expect(screen.getByText('Olá, Usuário!')).toBeTruthy();
  });

  it('deve chamar fetchFeed no useEffect', () => {
    render(<HomeScreen />);
    expect(mockFetchFeed).toHaveBeenCalledTimes(1);
  });

  it('deve executar signOut e navegar para login quando botão Sair for pressionado', async () => {
    mockSignOut.mockResolvedValue(undefined);

    render(<HomeScreen />);

    const signOutButton = screen.getByText('Sair');
    fireEvent.press(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockRouter.replace).toHaveBeenCalledWith('/(public)/login');
    });
  });

  it('deve exibir skeleton cards quando estiver carregando e feed estiver vazio', () => {
    const mockHomeStoreLoading = {
      ...mockHomeStore,
      isLoadingFeed: true,
      feed: [],
    };

    (useHomeStore as unknown as jest.Mock).mockReturnValue(mockHomeStoreLoading);

    render(<HomeScreen />);
    expect(screen.getByText('Seu Feed')).toBeTruthy();
  });

  it('deve exibir items do feed quando dados estiverem disponíveis', () => {
    const mockHomeStoreWithFeed = {
      ...mockHomeStore,
      feed: mockFeedData,
    };

    (useHomeStore as unknown as jest.Mock).mockReturnValue(mockHomeStoreWithFeed);

    render(<HomeScreen />);

    expect(screen.getByText('Título 1')).toBeTruthy();
    expect(screen.getByText('Subtítulo 1')).toBeTruthy();
    expect(screen.getByText('Título 2')).toBeTruthy();
    expect(screen.getByText('Subtítulo 2')).toBeTruthy();
  });

  it('deve exibir mensagem de dados offline quando hasOfflineData for true', () => {
    const mockHomeStoreOffline = {
      ...mockHomeStore,
      hasOfflineData: true,
    };

    (useHomeStore as unknown as jest.Mock).mockReturnValue(mockHomeStoreOffline);

    render(<HomeScreen />);

    expect(screen.getByText('Você está offline. Exibindo dados cacheados.')).toBeTruthy();
  });

  it('deve exibir mensagem de erro quando houver erro', () => {
    const mockHomeStoreWithError = {
      ...mockHomeStore,
      error: 'Erro ao carregar dados',
    };

    (useHomeStore as unknown as jest.Mock).mockReturnValue(mockHomeStoreWithError);

    render(<HomeScreen />);

    expect(screen.getByText('Erro ao carregar dados')).toBeTruthy();
  });

  it('deve exibir mensagem quando feed estiver vazio e não estiver carregando', () => {
    const mockHomeStoreEmpty = {
      ...mockHomeStore,
      feed: [],
      isLoadingFeed: false,
    };

    (useHomeStore as unknown as jest.Mock).mockReturnValue(mockHomeStoreEmpty);

    render(<HomeScreen />);

    expect(screen.getByText('Nenhum item no feed.')).toBeTruthy();
  });

  it('deve exibir spinner de atualização quando estiver carregando com feed existente', () => {
    const mockHomeStoreUpdating = {
      ...mockHomeStore,
      feed: mockFeedData,
      isLoadingFeed: true,
    };

    (useHomeStore as unknown as jest.Mock).mockReturnValue(mockHomeStoreUpdating);

    render(<HomeScreen />);

    expect(screen.getByTestId('spinner')).toBeTruthy();
    expect(screen.getByText('Atualizando...')).toBeTruthy();
  });

  it('deve formatar datas corretamente nos items do feed', () => {
    const mockHomeStoreWithFeed = {
      ...mockHomeStore,
      feed: mockFeedData,
    };

    (useHomeStore as unknown as jest.Mock).mockReturnValue(mockHomeStoreWithFeed);

    render(<HomeScreen />);

    expect(format).toHaveBeenCalledWith(
      new Date('2024-01-15T10:30:00Z'),
      "dd/MM/yyyy HH:mm",
      { locale: ptBR }
    );
    expect(format).toHaveBeenCalledWith(
      new Date('2024-01-16T14:45:00Z'),
      "dd/MM/yyyy HH:mm",
      { locale: ptBR }
    );
  });

  it('deve exibir tanto mensagem de offline quanto erro se ambos estiverem presentes', () => {
    const mockHomeStoreWithBoth = {
      ...mockHomeStore,
      hasOfflineData: true,
      error: 'Erro de conexão',
    };

    (useHomeStore as unknown as jest.Mock).mockReturnValue(mockHomeStoreWithBoth);

    render(<HomeScreen />);

    expect(screen.getByText('Você está offline. Exibindo dados cacheados.')).toBeTruthy();
    expect(screen.getByText('Erro de conexão')).toBeTruthy();
  });

  it('deve renderizar cards de informações rápidas', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Informações Rápidas')).toBeTruthy();
    expect(screen.getByText('Saldo')).toBeTruthy();
    expect(screen.getByText('R\$ 1.234,56')).toBeTruthy();
    expect(screen.getByText('Notificações')).toBeTruthy();
    expect(screen.getByText('3 Novas')).toBeTruthy();
  });

  it('deve lidar com erro no signOut', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockSignOut.mockRejectedValue(new Error('Erro ao fazer logout'));

    render(<HomeScreen />);

    const signOutButton = screen.getByText('Sair');
    fireEvent.press(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    consoleErrorSpy.mockRestore();
  });
});