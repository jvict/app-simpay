import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { YStack, H2, Label, Input, Button, Text } from 'tamagui';
import { useAuthStore } from '../../src/features/auth/store/auth.store';
import { z } from 'zod';

const loginSchema = z.object({
  cpfOrEmail: z.string().min(1, "CPF/E-mail é obrigatório."),
  password: z.string().min(1, "Senha é obrigatória."),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const authError = useAuthStore((state) => state.error);
  const isLoadingAuth = useAuthStore((state) => state.isLoading);
  const setError = useAuthStore((state) => state.setError); 

  const [form, setForm] = useState<LoginForm>({
    cpfOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginForm & { general?: string }>>({});

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) { 
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        setError(null); 
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    setError(null); 

    try {
      loginSchema.parse(form); 
    } catch (e: any) {
      const newErrors: Partial<LoginForm> = {};
      e.errors.forEach((err: any) => {
        newErrors[err.path[0] as keyof LoginForm] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    const success = await signIn(form.cpfOrEmail, form.password);
    if (!success) {
      setErrors((prev) => ({ ...prev, general: authError || 'Erro desconhecido ao logar.' }));
    } else {
      router.replace('/(app)/home'); 
    }
  };

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" backgroundColor="$backgroundLight">
      <Stack.Screen options={{ title: 'Login', headerShown: false }} />

      <YStack width="100%" maxWidth={400} space="$4" padding="$4" borderRadius="$2" backgroundColor="$white" borderWidth="$0.5" borderColor="$borderColor">
        <H2 textAlign="center">Login</H2>

        {errors.general && <Text color="red">{errors.general}</Text>}
        
        <YStack space="$2">
          <Label htmlFor="cpfOrEmail">CPF/E-mail</Label>
          <Input
            id="cpfOrEmail"
            placeholder="Seu CPF ou E-mail"
            value={form.cpfOrEmail}
            onChangeText={(text : any) => handleInputChange('cpfOrEmail', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.cpfOrEmail && <Text color="red" fontSize="$1">{errors.cpfOrEmail}</Text>}
        </YStack>

        <YStack space="$2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            placeholder="Sua senha"
            value={form.password}
            onChangeText={(text : any) => handleInputChange('password', text)}
            secureTextEntry
          />
          {errors.password && <Text color="red" fontSize="$1">{errors.password}</Text>}
        </YStack>

        <Button onPress={handleSubmit} disabled={isLoadingAuth}>
          {isLoadingAuth ? 'Entrando...' : 'Entrar'}
        </Button>

        <Button variant="outlined" onPress={() => router.push('/(public)/create-password')}>
          Criar Senha (Primeiro Acesso)
        </Button>
      </YStack>
    </YStack>
  );
}