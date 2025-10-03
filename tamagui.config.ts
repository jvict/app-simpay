import { createTamagui } from 'tamagui';
import { shorthands } from '@tamagui/shorthands';
import { themes } from '@tamagui/themes';

const tokens = {
  color: {
    white: '#FFFFFF',
    black: '#000000',
    backgroundLight: '#F9FAFC',
    borderColor: '#E5E5E5',
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
  },
};

const config = createTamagui({
  themes: {
    light: {
      ...themes.light, 
    },

  },
  tokens,
  shorthands,
});

export type AppConfig = typeof config;
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
export default config;
