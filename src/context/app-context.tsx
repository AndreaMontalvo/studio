
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Language, TranslationKey } from '@/lib/i18n';
import { translations } from '@/lib/i18n';

interface AppState {
    appName: string;
    theme: 'light' | 'dark';
    colors: {
        primary: string;
        accent: string;
        logo: string;
        bold: string;
    };
    language: Language;
}

interface AppContextType extends AppState {
    setAppName: (name: string) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    setColors: (colors: AppState['colors']) => void;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultState: AppState = {
    appName: 'ChatForge',
    theme: 'dark',
    colors: {
        primary: '275 80% 60%',
        accent: '180 80% 50%',
        logo: '275 80% 60%',
        bold: '0 0% 98%', // Default for dark theme (white)
    },
    language: 'en',
};

function getInitialState(): AppState {
    if (typeof window === 'undefined') {
        return defaultState;
    }
    try {
        const item = window.localStorage.getItem('appSettings');
        const storedState = item ? JSON.parse(item) : {};
        // Merge stored state with default state to ensure all keys are present
        return {
            ...defaultState,
            ...storedState,
            colors: {
                ...defaultState.colors,
                ...(storedState.colors || {}),
            }
        };
    } catch (error) {
        console.warn('Error reading localStorage, using default state:', error);
        return defaultState;
    }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AppState>(getInitialState);

    useEffect(() => {
        try {
            window.localStorage.setItem('appSettings', JSON.stringify(state));
        } catch (error) {
            console.warn('Error saving to localStorage:', error);
        }

        // Apply theme and colors
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(state.theme);
        root.style.setProperty('--primary', state.colors.primary);
        root.style.setProperty('--accent', state.colors.accent);
        root.style.setProperty('--ring', state.colors.accent);
        root.style.setProperty('--logo', state.colors.logo);
        root.style.setProperty('--bold', state.colors.bold);

    }, [state]);


    const setAppName = (appName: string) => setState(s => ({ ...s, appName }));
    const setTheme = (theme: 'light' | 'dark') => {
        setState(s => {
            const newTheme = theme;
            // Adjust bold color for theme change if it's the default
            const isDefaultBold = s.colors.bold === '0 0% 98%' || s.colors.bold === '240 10% 3.9%';
            const newBoldColor = isDefaultBold 
                ? (newTheme === 'dark' ? '0 0% 98%' : '240 10% 3.9%')
                : s.colors.bold;

            return { ...s, theme: newTheme, colors: { ...s.colors, bold: newBoldColor } };
        });
    };
    const setColors = (colors: AppState['colors']) => setState(s => ({ ...s, colors }));
    const setLanguage = (language: Language) => setState(s => ({ ...s, language }));
    
    const t = useMemo(() => {
        const currentTranslations = translations[state.language] || translations.en;
        return (key: TranslationKey, params?: Record<string, string>): string => {
            let translation = currentTranslations[key] || translations.en[key];
            if (params) {
                Object.entries(params).forEach(([paramKey, paramValue]) => {
                    translation = translation.replace(`{${paramKey}}`, paramValue);
                });
            }
            return translation;
        };
    }, [state.language]);

    const value = {
        ...state,
        setAppName,
        setTheme,
        setColors,
        setLanguage,
        t,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppComponent() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppComponent must be used within an AppProvider');
    }
    return context;
}
