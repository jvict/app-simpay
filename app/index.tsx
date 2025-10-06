import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/features/auth/store/auth.store';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/home" />;
  } else {
    return <Redirect href="/(public)/login" />;
  }
}