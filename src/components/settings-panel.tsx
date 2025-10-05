
'use client';

import { useAppComponent } from '@/context/app-context';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from './ui/button';
import { Moon, Sun } from 'lucide-react';
import { Language } from '@/lib/i18n';

const colorPresets = {
    primary: [
        '275 80% 60%', // Indigo
        '347 77% 50%', // Pink
        '142 76% 36%', // Green
        '221 83% 53%', // Blue
        '36 93% 53%', // Orange
    ],
    accent: [
        '180 80% 50%', // Teal
        '24 9.8% 10%',   // Gray
        '330 80% 55%', // Rose
        '197 71% 73%', // Sky
        '96 78% 62%', // Lime
    ],
};


export function SettingsPanel() {
    const {
        appName,
        setAppName,
        theme,
        setTheme,
        colors,
        setColors,
        language,
        setLanguage,
        t,
    } = useAppComponent();

    return (
        <div className="p-4 space-y-6 h-full flex flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('appName')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            placeholder={t('appNamePlaceholder')}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('theme')}</CardTitle>
                        <CardDescription>{t('themeDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline'}
                                onClick={() => setTheme('light')}
                            >
                                <Sun className="mr-2 h-4 w-4" />
                                {t('light')}
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                onClick={() => setTheme('dark')}
                            >
                                <Moon className="mr-2 h-4 w-4" />
                                {t('dark')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('colorScheme')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="mb-2 block">Primary</Label>
                            <div className="flex flex-wrap gap-2">
                                {colorPresets.primary.map((color) => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full border-2 ${colors.primary === color ? 'border-ring' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: `hsl(${color})` }}
                                        onClick={() => setColors({ ...colors, primary: color })}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2 block">Accent</Label>
                            <div className="flex flex-wrap gap-2">
                                {colorPresets.accent.map((color) => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full border-2 ${colors.accent === color ? 'border-ring' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: `hsl(${color})` }}
                                        onClick={() => setColors({ ...colors, accent: color })}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('language')}</CardTitle>
                        <CardDescription>{t('languageDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select
                            value={language}
                            onValueChange={(value) => setLanguage(value as Language)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">{t('english')}</SelectItem>
                                <SelectItem value="es">{t('spanish')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
