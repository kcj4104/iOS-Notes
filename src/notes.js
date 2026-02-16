export const STORAGE_KEY = 'ios-notes-v1';

export function extractTitle(body) {
  const firstLine = body.split('\n').find((line) => line.trim().length > 0);
  return firstLine ? firstLine.slice(0, 70) : 'New Note';
}

export function formatPreviewDate(isoDate) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(isoDate));
}

export function createNote() {
  const now = new Date().toISOString();
  return {
    id: `note-${crypto.randomUUID()}`,
    title: 'New Note',
    body: '',
    createdAt: now,
    updatedAt: now,
    pinned: false
  };
}

export function sortByRecent(notes) {
  return [...notes].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function filterNotes(notes, query) {
  const lowered = query.trim().toLowerCase();
  return sortByRecent(
    lowered
      ? notes.filter((note) => `${note.title} ${note.body}`.toLowerCase().includes(lowered))
      : notes
  );
}

export function seedNotes() {
  const now = new Date().toISOString();
  return [
    {
      id: '1',
      title: 'Welcome to Notes',
      body: 'Capture ideas, checklists, and plans.\n\nThis v1 prototype mimics iOS Notes core flow.',
      createdAt: now,
      updatedAt: now,
      pinned: true
    },
    {
      id: '2',
      title: 'Groceries',
      body: '• Apples\n• Greek yogurt\n• Olive oil',
      createdAt: now,
      updatedAt: now,
      pinned: false
    }
  ];
}

export function loadNotes(storage = localStorage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return seedNotes();
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : seedNotes();
  } catch {
    return seedNotes();
  }
}

export function saveNotes(notes, storage = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
