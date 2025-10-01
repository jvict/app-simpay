// tamagui.config.ts
import { createTamagui } from 'tamagui';
import { shorthands } from '@tamagui/shorthands';
import { themes } from '@tamagui/themes';
// Defina seus tokens de cores, spacing, etc.
const tokens = {
  color: {
    white: '#FFFFFF',
    black: '#000000',
    backgroundLight: '#F9FAFC',
    borderColor: '#E5E5E5',
    // ... adicione suas outras cores
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    // ... adicione seus espaçamentos
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    // ... adicione seus tamanhos
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    // ... adicione seus raios de borda
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    // ... adicione seus zIndex
  },
};

const config = createTamagui({
  themes: {
    light: {
      ...themes.light, // Inclua os temas padrão do Tamagui
    },
    // Você pode definir um tema escuro também
  },
  tokens,
  shorthands,
  // Para fontes personalizadas
  // fonts: {
  //   heading: headingFont,
  //   body: bodyFont,
  // },
  // ... outras configurações
});

export type AppConfig = typeof config;
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
export default config;