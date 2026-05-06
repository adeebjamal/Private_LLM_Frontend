import { Moon, Sparkles, Sun, Zap } from 'lucide-react';
import React from 'react';

interface Props {
  theme: 'light' | 'dark' | 'cyberpunk' | 'anime';
  toggleTheme: () => void;
}

const NEXT_THEME_LABEL: Record<Props['theme'], string> = {
  light: 'Switch to dark theme',
  dark: 'Switch to Cyberpunk 2077 theme',
  cyberpunk: 'Switch to anime theme',
  anime: 'Switch to light theme',
};

export const ThemeToggle: React.FC<Props> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--text-tertiary)',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        transition: 'color 0.15s ease, background 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--sidebar-hover)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--text-tertiary)';
      }}
      aria-label={NEXT_THEME_LABEL[theme]}
      title={NEXT_THEME_LABEL[theme]}
    >
      {theme === 'light' && <Moon size={16} strokeWidth={1.8} />}
      {theme === 'dark' && <Zap size={16} strokeWidth={1.8} />}
      {theme === 'cyberpunk' && <Sparkles size={16} strokeWidth={1.8} />}
      {theme === 'anime' && <Sun size={16} strokeWidth={1.8} />}
    </button>
  );
};
