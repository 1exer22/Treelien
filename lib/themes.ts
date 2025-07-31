export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  font: string;
  backgroundType: 'gradient' | 'solid' | 'image';
  buttonStyle: 'rounded' | 'square' | 'pill';
  cardStyle: 'elevated' | 'outlined' | 'filled';
}

export const defaultThemes: Record<string, CustomTheme> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB'
    },
    font: 'inter',
    backgroundType: 'gradient',
    buttonStyle: 'rounded',
    cardStyle: 'elevated'
  },
  colorful: {
    id: 'colorful',
    name: 'Coloré',
    colors: {
      primary: '#EC4899',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      background: '#FDF2F8',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#F3E8FF'
    },
    font: 'inter',
    backgroundType: 'gradient',
    buttonStyle: 'rounded',
    cardStyle: 'elevated'
  },
  elegant: {
    id: 'elegant',
    name: 'Élégant',
    colors: {
      primary: '#10B981',
      secondary: '#6366F1',
      accent: '#F59E0B',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      border: '#334155'
    },
    font: 'inter',
    backgroundType: 'solid',
    buttonStyle: 'rounded',
    cardStyle: 'elevated'
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#60A5FA',
      secondary: '#A78BFA',
      accent: '#34D399',
      background: '#000000',
      surface: '#111827',
      text: '#FFFFFF',
      textSecondary: '#9CA3AF',
      border: '#374151'
    },
    font: 'inter',
    backgroundType: 'solid',
    buttonStyle: 'square',
    cardStyle: 'outlined'
  }
};

export const fontOptions = [
  { value: 'inter', label: 'Inter', className: 'font-sans' },
  { value: 'poppins', label: 'Poppins', className: 'font-sans' },
  { value: 'roboto', label: 'Roboto', className: 'font-sans' },
  { value: 'playfair', label: 'Playfair Display', className: 'font-serif' },
  { value: 'montserrat', label: 'Montserrat', className: 'font-sans' },
  { value: 'opensans', label: 'Open Sans', className: 'font-sans' }
];

export const backgroundOptions = [
  { value: 'gradient', label: 'Dégradé' },
  { value: 'solid', label: 'Couleur unie' },
  { value: 'image', label: 'Image (Premium)' }
];

export const buttonStyleOptions = [
  { value: 'rounded', label: 'Arrondi' },
  { value: 'square', label: 'Carré' },
  { value: 'pill', label: 'Pilule' }
];

export const cardStyleOptions = [
  { value: 'elevated', label: 'Élevé' },
  { value: 'outlined', label: 'Contour' },
  { value: 'filled', label: 'Rempli' }
];

export function generateThemeCSS(theme: CustomTheme): string {
  const { colors } = theme;
  
  return `
    :root {
      --theme-primary: ${colors.primary};
      --theme-secondary: ${colors.secondary};
      --theme-accent: ${colors.accent};
      --theme-background: ${colors.background};
      --theme-surface: ${colors.surface};
      --theme-text: ${colors.text};
      --theme-text-secondary: ${colors.textSecondary};
      --theme-border: ${colors.border};
    }
  `;
}

export function getThemeClasses(theme: CustomTheme): Record<string, string> {
  const { colors, backgroundType, buttonStyle, cardStyle } = theme;
  
  const backgroundClass = backgroundType === 'gradient' 
    ? `bg-gradient-to-br from-[${colors.background}] to-[${colors.surface}]`
    : `bg-[${colors.background}]`;
    
  const buttonClasses = {
    rounded: 'rounded-lg',
    square: 'rounded-none',
    pill: 'rounded-full'
  };
  
  const cardClasses = {
    elevated: 'shadow-lg border-0',
    outlined: `border-2 border-[${colors.border}] shadow-none`,
    filled: `bg-[${colors.surface}] border-0 shadow-sm`
  };
  
  return {
    background: backgroundClass,
    surface: `bg-[${colors.surface}]`,
    text: `text-[${colors.text}]`,
    textSecondary: `text-[${colors.textSecondary}]`,
    primary: `text-[${colors.primary}]`,
    secondary: `text-[${colors.secondary}]`,
    accent: `text-[${colors.accent}]`,
    border: `border-[${colors.border}]`,
    button: `${buttonClasses[buttonStyle]} bg-[${colors.primary}] text-white hover:opacity-90`,
    card: `${cardClasses[cardStyle]} bg-[${colors.surface}]`
  };
}