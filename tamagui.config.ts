import { createTamagui } from 'tamagui';
import { config as defaultConfig } from '@tamagui/config/v3';

const config = createTamagui({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    color: {
      ...defaultConfig.tokens.color,
      white: '#FFFFFF',
      backgroundLight: '#F9FAFC',
      borderColor: '#E5E5E5',
    },
  },
});

export default config;

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}