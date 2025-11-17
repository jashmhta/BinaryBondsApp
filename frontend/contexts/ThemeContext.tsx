import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryLight: string;
    success: string;
    error: string;
    border: string;
    shadow: string;
    overlay: string;
  };
}

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#000000',
    surface: '#1A1A1A',
    card: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    primary: '#D4AF37',
    primaryLight: '#F5E6C3',
    success: '#4CAF50',
    error: '#FF5252',
    border: '#3A3A3A',
    shadow: 'rgba(212, 175, 55, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)'
  }
};

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#F5F5F5',
    surface: '#FFFFFF',
    card: '#FAFAFA',
    text: '#1A1A1A',
    textSecondary: '#666666',
    primary: '#D4AF37',
    primaryLight: '#F5E6C3',
    success: '#4CAF50',
    error: '#FF5252',
    border: '#E0E0E0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(255, 255, 255, 0.9)'
  }
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(darkTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme === 'light') {
        setTheme(lightTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme.isDark ? lightTheme : darkTheme;
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme.isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};