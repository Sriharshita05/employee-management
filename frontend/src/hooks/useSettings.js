import { useEffect, useState } from 'react';
import { getSettings, updateSettings, resetSettings, subscribeSettings } from '../utils/settingsStore';

export function useSettings() {
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => subscribeSettings(setSettings), []);

  // Keep the <html> element's data-theme attribute in sync with settings
  // wherever useSettings is mounted, so the whole app repaints on change.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme === 'dark' ? 'dark' : 'light');
  }, [settings.theme]);

  const setTheme = (theme) => updateSettings({ theme });
  const toggleTheme = () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });

  return { settings, updateSettings, resetSettings, setTheme, toggleTheme };
}
