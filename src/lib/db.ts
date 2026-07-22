import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { AudioTrack, Playlist } from '../types';

interface AudioAppDB extends DBSchema {
  tracks: {
    key: string;
    value: AudioTrack;
    indexes: { 'by-source': string; 'by-title': string };
  };
  playlists: {
    key: string;
    value: Playlist;
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = '21audio_database';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AudioAppDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<AudioAppDB>(DB_NAME, DB_VERSION, {
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
export async function saveTrack(track: AudioTrack): Promise<void> {
  const db = await getDB();
  await db.put('tracks', track);
}

export async function saveTracksBatch(tracks: AudioTrack[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tracks', 'readwrite');
  for (const t of tracks) {
    await tx.store.put(t);
  }
  await tx.done;
}

export async function getAllTracksFromDB(): Promise<AudioTrack[]> {
  const db = await getDB();
  return db.getAll('tracks');
}

export async function deleteTrackFromDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tracks', id);
}

// Playlist operations
export async function savePlaylistDB(playlist: Playlist): Promise<void> {
  const db = await getDB();
  await db.put('playlists', playlist);
}

export async function getAllPlaylistsDB(): Promise<Playlist[]> {
  const db = await getDB();
  return db.getAll('playlists');
}

export async function deletePlaylistDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('playlists', id);
}

// Settings operations
export async function saveSettingDB(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put('settings', value, key);
}

export async function getSettingDB(key: string, defaultValue?: any): Promise<any> {
  const db = await getDB();
  const val = await db.get('settings', key);
  return val !== undefined ? val : defaultValue;
}
