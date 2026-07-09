const STORAGE_KEY = 'ems_notifications_read';

let listeners = [];

function loadReadIds() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(ids) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
  listeners.forEach((fn) => fn(ids));
}

export function getReadIds() {
  return loadReadIds();
}

export function markRead(id) {
  const ids = new Set(loadReadIds());
  ids.add(id);
  const next = Array.from(ids);
  persist(next);
  return next;
}

export function markAllRead(allIds) {
  const ids = new Set([...loadReadIds(), ...allIds]);
  const next = Array.from(ids);
  persist(next);
  return next;
}

export function clearReadState() {
  persist([]);
  return [];
}

export function subscribeReadIds(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
