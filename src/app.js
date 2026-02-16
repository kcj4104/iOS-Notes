import {
  createNote,
  extractTitle,
  filterNotes,
  formatPreviewDate,
  loadNotes,
  saveNotes
} from './notes.js';

const app = document.getElementById('app');
let notes = loadNotes();
let activeNoteId = notes[0]?.id ?? null;
let query = '';

function setActive(noteId) {
  activeNoteId = noteId;
  render();
}

function mutateNotes(updater) {
  notes = updater(notes);
  if (!notes.find((n) => n.id === activeNoteId)) {
    activeNoteId = notes[0]?.id ?? null;
  }
  saveNotes(notes);
  render();
}

function createNewNote() {
  const note = createNote();
  mutateNotes((prev) => [note, ...prev]);
  activeNoteId = note.id;
  render();
}

function deleteActiveNote() {
  if (!activeNoteId) return;
  mutateNotes((prev) => prev.filter((note) => note.id !== activeNoteId));
}

function togglePin() {
  mutateNotes((prev) =>
    prev.map((note) =>
      note.id === activeNoteId
        ? { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() }
        : note
    )
  );
}

function updateBody(body) {
  mutateNotes((prev) =>
    prev.map((note) =>
      note.id === activeNoteId
        ? { ...note, body, title: extractTitle(body), updatedAt: new Date().toISOString() }
        : note
    )
  );
}

function rowMarkup(note, active) {
  return `<button class="note-row ${active ? 'active' : ''}" data-note-id="${note.id}">
    <div class="note-title">${escapeHtml(note.title)}</div>
    <div class="note-preview-date">${formatPreviewDate(note.updatedAt)}</div>
    <div class="note-preview">${escapeHtml(note.body.replace(/\n/g, ' ').slice(0, 90) || 'No additional text')}</div>
  </button>`;
}

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function render() {
  const filtered = filterNotes(notes, query);
  const pinned = filtered.filter((n) => n.pinned);
  const normal = filtered.filter((n) => !n.pinned);
  const active = notes.find((note) => note.id === activeNoteId);

  app.innerHTML = `
    <aside class="sidebar">
      <header class="sidebar-header">
        <h1>Notes</h1>
        <button aria-label="Create note" id="create-note" class="icon-button">＋</button>
      </header>
      <input id="search" class="search" aria-label="Search notes" placeholder="Search" value="${escapeHtml(query)}" />
      <p class="count">${filtered.length} Notes</p>

      ${pinned.length ? `<section><h2 class="section-title">Pinned</h2>${pinned.map((n) => rowMarkup(n, n.id === activeNoteId)).join('')}</section>` : ''}
      <section><h2 class="section-title">Notes</h2>${normal.map((n) => rowMarkup(n, n.id === activeNoteId)).join('')}</section>
    </aside>

    <main class="editor-pane">
      ${
        active
          ? `<header class="editor-header">
               <button class="toolbar-button" id="pin-note">${active.pinned ? 'Unpin' : 'Pin'}</button>
               <button class="toolbar-button danger" id="delete-note">Delete</button>
             </header>
             <div class="editor-meta">${formatPreviewDate(active.updatedAt)}</div>
             <textarea id="editor" class="editor" aria-label="Note body" placeholder="Start writing">${escapeHtml(active.body)}</textarea>`
          : `<div class="empty-state"><h2>No Notes</h2><p>Create a new note to begin.</p></div>`
      }
    </main>
  `;

  app.querySelector('#create-note')?.addEventListener('click', createNewNote);
  app.querySelector('#delete-note')?.addEventListener('click', deleteActiveNote);
  app.querySelector('#pin-note')?.addEventListener('click', togglePin);

  app.querySelector('#search')?.addEventListener('input', (event) => {
    query = event.target.value;
    render();
  });

  app.querySelector('#editor')?.addEventListener('input', (event) => {
    updateBody(event.target.value);
  });

  app.querySelectorAll('[data-note-id]').forEach((el) => {
    el.addEventListener('click', () => setActive(el.getAttribute('data-note-id')));
  });
}

render();
