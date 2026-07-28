import { openDB } from 'idb';

const DB_NAME = '21audio_database';
const DB_VERSION = 1;

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Tracks store
        if (!db.objectStoreNames.contains('tracks')) {
          const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
          trackStore.createIndex('by-source', 'source');
          trackStore.createIndex('by-title', 'title');
        }

        // Playlists store
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

// Track operations
export async function saveTrack(track) {
  const db = await getDB();
  await db.put('tracks', track);
}

export async function saveTracksBatch(tracks) {
  const db = await getDB();
  const tx = db.transaction('tracks', 'readwrite');
  for (const t of tracks) {
    await tx.store.put(t);
  }
  await tx.done;
}

export async function getAllTracksFromDB() {
  const db = await getDB();
  return db.getAll('tracks');
}

export async function deleteTrackFromDB(id) {
  const db = await getDB();
  await db.delete('tracks', id);
}

// Playlist operations
export async function savePlaylistDB(playlist) {
  const db = await getDB();
  await db.put('playlists', playlist);
}

export async function getAllPlaylistsDB() {
  const db = await getDB();
  return db.getAll('playlists');
}

export async function deletePlaylistDB(id) {
  const db = await getDB();
  await db.delete('playlists', id);
}

// Settings operations
export async function saveSettingDB(key, value) {
  const db = await getDB();
  await db.put('settings', value, key);
}

export async function getSettingDB(key, defaultValue) {
  const db = await getDB();
  const val = await db.get('settings', key);
  return val !== undefined ? val : defaultValue;
}
