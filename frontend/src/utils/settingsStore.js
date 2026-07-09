const STORAGE_KEY = 'ems_settings';

export const DEFAULT_SETTINGS = {
  profile: {
    name: 'Sri Harshita',
    role: 'HR Administrator',
    email: 'sri.harshita@empmanage.com',
  },
  notificationPrefs: {
    newHires: true,
    attendanceAlerts: true,
    departmentAlerts: true,
  },
  compactMode: false,
  theme: 'light',
};

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function load() {
  if (typeof localStorage === 'undefined') return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : null;
  if (!parsed) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    profile: { ...DEFAULT_SETTINGS.profile, ...(parsed.profile || {}) },
    notificationPrefs: {
      ...DEFAULT_SETTINGS.notificationPrefs,
      ...(parsed.notificationPrefs || {}),
    },
  };
}

let currentSettings = load();
let listeners = [];

function persist() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
  }
  listeners.forEach((fn) => fn(currentSettings));
}

export function getSettings() {
  return currentSettings;
}

export function updateSettings(partial) {
  currentSettings = {
    ...currentSettings,
    ...partial,
    profile: { ...currentSettings.profile, ...(partial.profile || {}) },
    notificationPrefs: {
      ...currentSettings.notificationPrefs,
      ...(partial.notificationPrefs || {}),
    },
  };
  persist();
  return currentSettings;
}

export function resetSettings() {
  currentSettings = DEFAULT_SETTINGS;
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((fn) => fn(currentSettings));
  return currentSettings;
}

export function subscribeSettings(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
