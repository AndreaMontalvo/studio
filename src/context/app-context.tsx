
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
    };
    language: Language;
}

interface AppContextType extends AppState {
    setAppName: (name: string) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    setColors: (colors: { primary: string; accent: string }) => void;
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
    },
    language: 'en',
};

function getInitialState(): AppState {
    if (typeof window === 'undefined') {
        return defaultState;
    }
    try {
        const item = window.localStorage.getItem('appSettings');
        return item ? JSON.parse(item) : defaultState;
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

    }, [state]);


    const setAppName = (appName: string) => setState(s => ({ ...s, appName }));
    const setTheme = (theme: 'light' | 'dark') => setState(s => ({ ...s, theme }));
    const setColors = (colors: { primary: string; accent: string }) => setState(s => ({ ...s, colors }));
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
