
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
import { Moon, Sun, Palette } from 'lucide-react';
import { Language } from '@/lib/i18n';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

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

// --- Helper Functions for Color Conversion ---
function hexToHsl(hex: string): string {
    // Remove #
    hex = hex.startsWith('#') ? hex.slice(1) : hex;

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
}


function hslStringToHex(hsl: string): string {
    const [h, s, l] = hsl.split(' ').map(val => parseFloat(val.replace('%', '')));
    const sDecimal = s / 100;
    const lDecimal = l / 100;

    const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lDecimal - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
        [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
        [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
        [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
        [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
        [r, g, b] = [x, 0, c];
    } else if (h >= 300 && h < 360) {
        [r, g, b] = [c, 0, x];
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    const toHex = (c: number) => ('0' + c.toString(16)).slice(-2);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


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
                        <div className="space-y-2">
                            <Label>Primary</Label>
                            <div className="flex flex-wrap items-center gap-2">
                                {colorPresets.primary.map((color) => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${colors.primary === color ? 'border-ring scale-110' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: `hsl(${color})` }}
                                        onClick={() => setColors({ ...colors, primary: color })}
                                    />
                                ))}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button 
                                            className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center"
                                            style={{ backgroundColor: `hsl(${colors.primary})` }}
                                            aria-label="Pick custom primary color"
                                        >
                                            <Palette className="w-4 h-4 text-primary-foreground" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-2">
                                        <div className="flex items-center gap-2">
                                             <input
                                                type="color"
                                                value={hslStringToHex(colors.primary)}
                                                onChange={(e) => setColors({ ...colors, primary: hexToHsl(e.target.value) })}
                                                className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
                                            />
                                            <span className="text-sm">{hslStringToHex(colors.primary)}</span>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Accent</Label>
                            <div className="flex flex-wrap items-center gap-2">
                                {colorPresets.accent.map((color) => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${colors.accent === color ? 'border-ring scale-110' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: `hsl(${color})` }}
                                        onClick={() => setColors({ ...colors, accent: color })}
                                    />
                                ))}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button 
                                            className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center"
                                            style={{ backgroundColor: `hsl(${colors.accent})` }}
                                            aria-label="Pick custom accent color"
                                        >
                                            <Palette className="w-4 h-4 text-accent-foreground" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-2">
                                        <div className="flex items-center gap-2">
                                             <input
                                                type="color"
                                                value={hslStringToHex(colors.accent)}
                                                onChange={(e) => setColors({ ...colors, accent: hexToHsl(e.target.value) })}
                                                className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
                                            />
                                            <span className="text-sm">{hslStringToHex(colors.accent)}</span>
                                        </div>
                                    </PopoverContent>
                                </Popover>
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
