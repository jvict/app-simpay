export interface User {
  cpfOrEmail: string;
  name: string;
}

const MOCK_USERS_DB: { [cpfOrEmail: string]: { password: string; user: User } } = {
  'teste@simpay.com': { password: 'Password123', user: { cpfOrEmail: 'teste@simpay.com', name: 'Usuário Teste' } },
  '123.456.789-00': { password: 'Password123', user: { cpfOrEmail: '123.456.789-00', name: 'Usuário CPF' } },
};

const simulateNetworkDelay = () => new Promise(resolve => {
  const delay = Math.floor(Math.random() * 1000) + 500;
  setTimeout(resolve, delay);
});

export const AuthService = {
  /**
   * Simula a criação de senha e o login automático.
   * Contrato: POST /mock/auth/create-password
   */
  async createPassword(cpfOrEmail: string, password: string): Promise<{ accessToken: string; user: User }> {
    await simulateNetworkDelay();

    if (MOCK_USERS_DB[cpfOrEmail]) {
      throw new Error('Este CPF/E-mail já está registrado.');
    }

    const newUser: User = {
      cpfOrEmail,
      name: cpfOrEmail.includes('@') ? cpfOrEmail.split('@')[0].split('.')[0] : 'Novo Usuário', 
    };

    MOCK_USERS_DB[cpfOrEmail] = { password, user: newUser };

    return {
      accessToken: `fake-token-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      user: newUser,
    };
  },

  /**
   * Simula o login do usuário.
   * Contrato: POST /mock/auth/login
   */
  async login(cpfOrEmail: string, password: string): Promise<{ accessToken: string; user: User }> {
    await simulateNetworkDelay(); 

    const userEntry = MOCK_USERS_DB[cpfOrEmail];

    if (!userEntry || userEntry.password !== password) {

      const error = new Error('Credenciais inválidas.');
      (error as any).statusCode = 401;
      throw error;
    }

    return {
      accessToken: `fake-token-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      user: userEntry.user,
    };
  },
};