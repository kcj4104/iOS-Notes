import test from 'node:test';
import assert from 'node:assert/strict';
import { extractTitle, filterNotes, saveNotes, loadNotes } from '../src/notes.js';

test('extractTitle returns first non-empty line', () => {
  assert.equal(extractTitle('\n\nHello world\nBody'), 'Hello world');
  assert.equal(extractTitle(''), 'New Note');
});

test('filterNotes searches body and title and sorts by updatedAt desc', () => {
  const notes = [
    { id: '1', title: 'Alpha', body: 'One', updatedAt: '2024-01-01T10:00:00.000Z' },
    { id: '2', title: 'Bravo', body: 'Target phrase', updatedAt: '2024-01-03T10:00:00.000Z' },
    { id: '3', title: 'Target', body: 'Other', updatedAt: '2024-01-02T10:00:00.000Z' }
  ];
  const result = filterNotes(notes, 'target');
  assert.deepEqual(result.map((n) => n.id), ['2', '3']);
});

test('saveNotes/loadNotes round trip', () => {
  const store = new Map();
  const storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value)
  };

  const payload = [{ id: 'x', title: 'X', body: '', updatedAt: new Date().toISOString() }];
  saveNotes(payload, storage);
  const loaded = loadNotes(storage);
  assert.equal(loaded[0].id, 'x');
});
