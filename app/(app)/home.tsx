import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { YStack, XStack, H2, H3, Text, Button, Card, Spinner, ScrollView } from 'tamagui';
import { useAuthStore } from '../../src/features/auth/store/auth.store';
import { useHomeStore } from '../../src/features/home/store/home.store';
import { format } from 'date-fns'; 
import { ptBR } from 'date-fns/locale'; 

const SkeletonCard = () => (
  <Card width="100%" height={100} backgroundColor="$gray3" borderRadius="$2" overflow="hidden">
    <YStack padding="$3" space="$2">
      <YStack backgroundColor="$gray5" height={20} width="80%" borderRadius="$1" />
      <YStack backgroundColor="$gray5" height={15} width="60%" borderRadius="$1" />
      <YStack backgroundColor="$gray5" height={15} width="90%" borderRadius="$1" />
    </YStack>
  </Card>
);

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const { feed, isLoadingFeed, hasOfflineData, error, fetchFeed } = useHomeStore();

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(public)/login');
  };

  return (
    <YStack flex={1} backgroundColor="$backgroundLight">
      <Stack.Screen options={{ title: 'Home', headerShown: false }} />

      <XStack justifyContent="space-between" alignItems="center" paddingTop="$6" paddingHorizontal="$4" paddingBottom="$2">
        <H2>Olá, {user?.name || user?.cpfOrEmail || 'Usuário'}!</H2>
        <Button size="$3" variant="outlined" onPress={handleSignOut}>
          Sair
        </Button>
      </XStack>
      
      <ScrollView 
        flex={1} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <YStack >
          {hasOfflineData && (
            <Text color="$orange8" textAlign="center" fontSize="$2">
              Você está offline. Exibindo dados cacheados.
            </Text>
          )}

          {error && (
            <Text color="$red8" textAlign="center" fontSize="$2">
              {error}
            </Text>
          )}

          <H3>Seu Feed</H3>

          {isLoadingFeed && feed.length === 0 ? (
            <YStack >
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </YStack>
          ) : (
            <YStack >
              {feed.map((item) => (
                <Card key={item.id} width="100%" backgroundColor="$white" borderRadius="$2" borderWidth="$0.5" borderColor="$borderColor">
                  <Card.Header padded>
                    <H3>{item.title}</H3>
                    <Text color="$gray10">{item.subtitle}</Text>
                  </Card.Header>
                  <Card.Footer padded>
                    <Text fontSize="$1" color="$gray9">
                      {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })} (UTC-3)
                    </Text>
                  </Card.Footer>
                </Card>
              ))}
              {feed.length === 0 && !isLoadingFeed && (
                <Text textAlign="center" color="$gray9">Nenhum item no feed.</Text>
              )}
              {isLoadingFeed && feed.length > 0 && (
                <XStack justifyContent="center" alignItems="center" space="$2">
                  <Spinner size="small" color="$blue8" />
                  <Text>Atualizando...</Text>
                </XStack>
              )}
            </YStack>
          )}
          
          <YStack >
            <H3>Informações Rápidas</H3>
            <XStack  flexWrap="wrap">
              <Card width="48%" backgroundColor="$white" borderRadius="$2" borderWidth="$0.5" borderColor="$borderColor">
                <Card.Header padded>
                  <H3>Saldo</H3>
                  <Text fontSize="$5">R$ 1.234,56</Text>
                </Card.Header>
              </Card>
              <Card width="48%" backgroundColor="$white" borderRadius="$2" borderWidth="$0.5" borderColor="$borderColor">
                <Card.Header padded>
                  <H3>Notificações</H3>
                  <Text fontSize="$5">3 Novas</Text>
                </Card.Header>
              </Card>
            </XStack>
          </YStack>
          <YStack height="$4" />
        </YStack>
      </ScrollView>
    </YStack>
  );
}