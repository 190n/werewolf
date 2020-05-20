type ColorMode = 'light' | 'dark';
type ThemeSetting = ColorMode | 'system';

export interface UseColorModeConfig {
    defaultTheme: ThemeSetting;
    noPreference: ColorMode;
    localStorageKey: string;
}

export type UseColorModeReturn = [ColorMode, (newTheme: ThemeSetting) => void];

export default function useColorMode({ defaultTheme = 'system', noPreference = 'light', localStorageKey = 'colorMode' }: UseColorModeConfig): UseColorModeReturn {
    const [themeSetting, setThemeSetting] = useState<ThemeSetting>(window.localStorage.getItem(localStorageKey) ?? defaultTheme);
    useEffect(() => {
        window.localStorage.setItem(localStorageKey, themeSetting);
    }, [themeSetting]);
}
