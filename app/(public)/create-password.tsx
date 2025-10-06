import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { YStack, H2, Label, Input, Button, Text, Progress } from 'tamagui';
import { useAuthStore } from '../../src/features/auth/store/auth.store';
import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, "A senha deve ter no mínimo 8 caracteres.")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número.");

interface CreatePasswordForm {
  cpfOrEmail: string;
  password: string;
  confirmPassword: string;
}

export default function CreatePasswordScreen() {
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);
  const authError = useAuthStore((state) => state.error);
  const isLoadingAuth = useAuthStore((state) => state.isLoading);

  const [form, setForm] = useState<CreatePasswordForm>({
    cpfOrEmail: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<CreatePasswordForm & { general?: string }>>({});
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-100

  const handleInputChange = (field: keyof CreatePasswordForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const handleSubmit = async () => {
    setErrors({}); 
    const newErrors: typeof errors = {};

    if (!form.cpfOrEmail) newErrors.cpfOrEmail = 'CPF/E-mail é obrigatório.';

    try {
      passwordSchema.parse(form.password);
    } catch (e: any) {
      newErrors.password = e.errors[0].message;
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = await signUp(form.cpfOrEmail, form.password);
    if (!success) {
      newErrors.general = authError || 'Erro desconhecido ao criar senha.';
      setErrors(newErrors);
    } else {
      router.replace('/(app)/home');
    }
  };

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor="$backgroundLight">
      <Stack.Screen options={{ title: 'Criar Senha', headerShown: false }} />
      
      <YStack width="100%" maxWidth={400} space="$4" padding="$4" borderRadius="$2" backgroundColor="$white" borderWidth="$0.5" borderColor="$borderColor">
        <H2 textAlign="center">Primeiro Acesso</H2>

        {errors.general && <Text color="red" fontSize="$1">{errors.general}</Text>}

        <YStack space="$2">
          <Label htmlFor="cpfOrEmail">CPF/E-mail</Label>
          <Input
            id="cpfOrEmail"
            placeholder="Seu CPF ou E-mail"
            value={form.cpfOrEmail}
            onChangeText={(text) => handleInputChange('cpfOrEmail', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            fontSize="$3" // <-- ADICIONE ESTA LINHA
          />
          {errors.cpfOrEmail && <Text color="red" fontSize="$1">{errors.cpfOrEmail}</Text>}
        </YStack>

        <YStack space="$2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            placeholder="Sua nova senha"
            value={form.password}
            onChangeText={(text) => handleInputChange('password', text)}
            secureTextEntry
            fontSize="$3"
          />
          {errors.password && <Text color="red" fontSize="$1">{errors.password}</Text>}
          <YStack space="$1">
            <Text fontSize="$1">Força da Senha:</Text>
            <Progress value={passwordStrength} size="$1" backgroundColor="$gray5">
              <Progress.Indicator backgroundColor={
                passwordStrength < 50 ? "$red8" : passwordStrength < 75 ? "$orange8" : "$green8"
              } />
            </Progress>
          </YStack>
        </YStack>

        <YStack space="$2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <Input
            id="confirmPassword"
            placeholder="Confirme sua nova senha"
            value={form.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
            secureTextEntry
            fontSize="$3"
          />
          {errors.confirmPassword && <Text color="red" fontSize="$1">{errors.confirmPassword}</Text>}
        </YStack>

        <Button onPress={handleSubmit} disabled={isLoadingAuth}>
          {isLoadingAuth ? 'Criando...' : 'Criar Senha e Entrar'}
        </Button>

        <Button variant="outlined" onPress={() => router.push('/(public)/login')}>
          Já tenho conta
        </Button>
      </YStack>
    </YStack>
  );
}