import { AudioTrack, AudioFormat } from '../types';

/**
 * Parses ID3v2 tags (MP3/WAV/AAC) and FLAC Vorbis comments directly using DataView & ArrayBuffer.
 */
export async function parseAudioFile(file: File): Promise<AudioTrack> {
  const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
  const ext = file.name.split('.').pop()?.toUpperCase() || '';

  let format: AudioFormat = 'MP3';
  if (ext === 'FLAC') format = 'FLAC';
  else if (ext === 'WAV') format = 'WAV';
  else if (ext === 'OGG') format = 'OGG';
  else if (ext === 'M4A' || ext === 'AAC') format = 'AAC';

  // Read Audio Duration
  const duration = await getAudioDuration(file);

  // Default title and artist from filename (e.g. "Daft Punk - One More Time")
  let title = fileNameWithoutExt;
  let artist = 'Artiste inconnu';
  let album = 'Album inconnu';
  let year: string | undefined;
  let genre: string | undefined;
  let coverUrl: string | undefined;

  if (fileNameWithoutExt.includes(' - ')) {
    const parts = fileNameWithoutExt.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  }

  // Parse ID3v2 or FLAC header from file ArrayBuffer
  try {
    const buffer = await readFileSlice(file, 0, Math.min(file.size, 512 * 1024)); // Read first 512KB
    const view = new DataView(buffer);

    // Check ID3v2 header: "ID3"
    if (view.getUint8(0) === 0x49 && view.getUint8(1) === 0x44 && view.getUint8(2) === 0x33) {
      const id3Data = parseID3v2(view, buffer);
      if (id3Data.title) title = id3Data.title;
      if (id3Data.artist) artist = id3Data.artist;
      if (id3Data.album) album = id3Data.album;
      if (id3Data.year) year = id3Data.year;
      if (id3Data.genre) genre = id3Data.genre;
      if (id3Data.coverUrl) coverUrl = id3Data.coverUrl;
    } 
    // Check FLAC header: "fLaC"
    else if (
      view.getUint8(0) === 0x66 &&
      view.getUint8(1) === 0x4c &&
      view.getUint8(2) === 0x61 &&
      view.getUint8(3) === 0x43
    ) {
      format = 'FLAC';
      const flacData = parseFlacMetadata(view, buffer);
      if (flacData.title) title = flacData.title;
      if (flacData.artist) artist = flacData.artist;
      if (flacData.album) album = flacData.album;
      if (flacData.coverUrl) coverUrl = flacData.coverUrl;
    }
  } catch (err) {
    console.warn('Metadata binary parse fallback:', err);
  }

  // Calculate bitrate estimation
  let bitrate = format === 'FLAC' ? 'FLAC Lossless HD' : '320 kbps HQ';
  if (file.size && duration > 0) {
    const calculatedKbps = Math.round(((file.size * 8) / duration) / 1000);
    if (format !== 'FLAC') {
      bitrate = `${calculatedKbps} kbps`;
    } else {
      bitrate = `FLAC Lossless (${calculatedKbps} kbps)`;
    }
  }

  const src = URL.createObjectURL(file);

  return {
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    artist,
    album,
    duration,
    coverUrl,
    src,
    source: 'local',
    format,
    bitrate,
    fileSize: file.size,
    addedAt: Date.now(),
    genre,
    year,
    blob: file,
  };
}

function readFileSlice(file: File, start: number, end: number): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file.slice(start, end));
  });
}

function parseID3v2(view: DataView, buffer: ArrayBuffer) {
  const result: any = {};
  const tagSize = readSynchsafeInt(view, 6);
  let offset = 10; // Past 10-byte ID3 header

  const decoder = new TextDecoder('utf-8');

  while (offset < tagSize + 10 && offset < view.byteLength - 10) {
    const frameId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );

    const frameSize = view.getUint32(offset + 4);
    if (frameSize <= 0 || offset + 10 + frameSize > view.byteLength) break;

    const frameDataOffset = offset + 10;

    if (frameId === 'TIT2') {
      result.title = decodeTextFrame(view, frameDataOffset, frameSize);
    } else if (frameId === 'TPE1') {
      result.artist = decodeTextFrame(view, frameDataOffset, frameSize);
    } else if (frameId === 'TALB') {
      result.album = decodeTextFrame(view, frameDataOffset, frameSize);
    } else if (frameId === 'TYER' || frameId === 'TDRC') {
      result.year = decodeTextFrame(view, frameDataOffset, frameSize);
    } else if (frameId === 'TCON') {
      result.genre = decodeTextFrame(view, frameDataOffset, frameSize);
    } else if (frameId === 'APIC') {
      // Attached Picture
      const picData = parseAPICFrame(view, frameDataOffset, frameSize);
      if (picData) result.coverUrl = picData;
    }

    offset += 10 + frameSize;
  }

  return result;
}

function parseFlacMetadata(view: DataView, buffer: ArrayBuffer) {
  const result: any = {};
  let offset = 4; // Past "fLaC"

  while (offset < view.byteLength - 4) {
    const header = view.getUint8(offset);
    const isLast = (header & 0x80) !== 0;
    const blockType = header & 0x7f;
    const length =
      (view.getUint8(offset + 1) << 16) |
      (view.getUint8(offset + 2) << 8) |
      view.getUint8(offset + 3);

    offset += 4;

    if (blockType === 4) {
      // Vorbis Comment Block
      const comments = parseVorbisComment(view, offset, length);
      if (comments.title) result.title = comments.title;
      if (comments.artist) result.artist = comments.artist;
      if (comments.album) result.album = comments.album;
    } else if (blockType === 6) {
      // Picture Block
      const mimeLength = view.getUint32(offset + 4);
      const mime = new TextDecoder().decode(
        new Uint8Array(buffer, offset + 8, mimeLength)
      );
      const descLength = view.getUint32(offset + 8 + mimeLength);
      const dataLength = view.getUint32(offset + 28 + mimeLength + descLength);
      const picOffset = offset + 32 + mimeLength + descLength;

      if (picOffset + dataLength <= view.byteLength) {
        const bytes = new Uint8Array(buffer, picOffset, dataLength);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        result.coverUrl = `data:${mime};base64,${btoa(binary)}`;
      }
    }

    offset += length;
    if (isLast) break;
  }

  return result;
}

function parseVorbisComment(view: DataView, offset: number, length: number) {
  const result: any = {};
  const decoder = new TextDecoder('utf-8');

  let cur = offset;
  const vendorLen = view.getUint32(cur, true);
  cur += 4 + vendorLen;

  const commentCount = view.getUint32(cur, true);
  cur += 4;

  for (let i = 0; i < commentCount && cur < offset + length; i++) {
    const commentLen = view.getUint32(cur, true);
    cur += 4;

    const str = decoder.decode(new Uint8Array(view.buffer, cur, commentLen));
    cur += commentLen;

    const parts = str.split('=');
    if (parts.length >= 2) {
      const key = parts[0].toUpperCase();
      const val = parts.slice(1).join('=');
      if (key === 'TITLE') result.title = val;
      if (key === 'ARTIST') result.artist = val;
      if (key === 'ALBUM') result.album = val;
    }
  }

  return result;
}

function decodeTextFrame(view: DataView, offset: number, length: number): string {
  if (length <= 1) return '';
  const encoding = view.getUint8(offset);
  const bytes = new Uint8Array(view.buffer, offset + 1, length - 1);

  if (encoding === 0 || encoding === 3) {
    // UTF-8 or ISO-8859-1
    return new TextDecoder('utf-8').decode(bytes).replace(/\0/g, '').trim();
  } else if (encoding === 1 || encoding === 2) {
    // UTF-16
    return new TextDecoder('utf-16').decode(bytes).replace(/\0/g, '').trim();
  }
  return new TextDecoder('utf-8').decode(bytes).replace(/\0/g, '').trim();
}

function parseAPICFrame(view: DataView, offset: number, length: number): string | null {
  let cur = offset + 1; // skip encoding byte
  // find MIME type
  let mime = '';
  while (cur < offset + length) {
    const b = view.getUint8(cur++);
    if (b === 0) break;
    mime += String.fromCharCode(b);
  }
  if (!mime) mime = 'image/jpeg';

  cur++; // skip picture type byte
  // find description null terminator
  while (cur < offset + length) {
    if (view.getUint8(cur++) === 0) break;
  }

  const imageLength = offset + length - cur;
  if (imageLength <= 0) return null;

  const bytes = new Uint8Array(view.buffer, cur, imageLength);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${mime};base64,${btoa(binary)}`;
}

function readSynchsafeInt(view: DataView, offset: number): number {
  const b1 = view.getUint8(offset);
  const b2 = view.getUint8(offset + 1);
  const b3 = view.getUint8(offset + 2);
  const b4 = view.getUint8(offset + 3);
  return (b1 << 21) | (b2 << 14) | (b3 << 7) | b4;
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.src = url;

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(audio.duration) || 0);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(180);
    };
  });
}
