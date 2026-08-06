/**
 * Helper to extract YouTube Video ID from various URL formats or raw ID.
 */
export function extractYouTubeId(urlOrId) {
  if (!urlOrId) return null;
  const clean = urlOrId.trim();
  
  // Standard YouTube, Youtu.be, Shorts, Music YouTube URLs
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (match && match[1]) return match[1];

  // If it's already an 11-character video ID
  if (/^[\w-]{11}$/.test(clean)) return clean;

  return null;
}

/**
 * Fetch video metadata via YouTube oEmbed / noembed (No API Key needed)
 */
export async function fetchYouTubeVideoDetails(videoId) {
  if (!videoId) return null;

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`);
    if (!res.ok) throw new Error('Failed to fetch oembed');
    const data = await res.json();

    if (data && data.title) {
      return {
        id: `yt-${videoId}`,
        youtubeId: videoId,
        title: data.title || 'Vidéo YouTube',
        artist: data.author_name || 'YouTube',
        album: 'YouTube Stream',
        coverUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        src: `https://www.youtube.com/watch?v=${videoId}`,
        source: 'youtube',
        format: 'YouTube HD',
        bitrate: 'Streaming HQ',
        duration: 0, // Duration determined dynamically by YouTube player
        addedAt: Date.now(),
        genre: 'Streaming',
        isFavorite: false,
      };
    }
  } catch (err) {
    console.warn('oEmbed fetch error:', err);
  }

  // Fallback metadata
  return {
    id: `yt-${videoId}`,
    youtubeId: videoId,
    title: `Vidéo YouTube (${videoId})`,
    artist: 'YouTube Music',
    album: 'YouTube Stream',
    coverUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    src: `https://www.youtube.com/watch?v=${videoId}`,
    source: 'youtube',
    format: 'YouTube HD',
    bitrate: 'Streaming HQ',
    duration: 0,
    addedAt: Date.now(),
    genre: 'Streaming',
    isFavorite: false,
  };
}

/**
 * Curated list of popular YouTube live radios, chill music streams & hits
 */
export const CURATED_YOUTUBE_STREAMS = [];

/**
 * Search YouTube tracks using backend YouTube scraper endpoint with fallbacks
 */
export async function searchYouTubeTracks(query) {
  if (!query || !query.trim()) {
    return CURATED_YOUTUBE_STREAMS;
  }

  const q = query.trim();

  // If user pasted a YouTube link directly, resolve it
  const directId = extractYouTubeId(q);
  if (directId) {
    const directTrack = await fetchYouTubeVideoDetails(directId);
    if (directTrack) {
      return [directTrack];
    }
  }

  // Primary Method: Server-side YouTube Search Endpoint
  try {
    const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend YouTube search endpoint error:', err);
  }

  // Fallback Method 1: iTunes Search API mapped to YouTube
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=15`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const tracks = await Promise.all(
          data.results.map(async (item) => {
            const trackTitle = `${item.artistName} - ${item.trackName}`;
            return {
              id: `itunes-${item.trackId}`,
              title: item.trackName,
              artist: item.artistName,
              album: item.collectionName || 'YouTube Stream',
              coverUrl: item.artworkUrl100?.replace('100x100bb', '500x500bb') || item.artworkUrl100,
              src: `https://www.youtube.com/watch?v=search`,
              searchQuery: trackTitle,
              source: 'youtube',
              format: 'YouTube HD',
              bitrate: 'Streaming HQ',
              duration: Math.round((item.trackTimeMillis || 0) / 1000),
              addedAt: Date.now(),
              genre: item.primaryGenreName || 'Musique',
              isFavorite: false,
            };
          })
        );
        return tracks;
      }
    }
  } catch (err) {
    console.warn('iTunes API fallback error:', err);
  }

  // Fallback Method 2: Invidious public nodes list
  const invidiousInstances = [
    'https://invidious.privacydev.net',
    'https://inv.tux.pizza',
    'https://invidious.nerdvpn.de',
    'https://invidious.io.lol',
  ];

  for (const instance of invidiousInstances) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(
        `${instance}/api/v1/search?q=${encodeURIComponent(q)}&type=video`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.slice(0, 15).map((item) => ({
          id: `yt-${item.videoId}`,
          youtubeId: item.videoId,
          title: item.title,
          artist: item.author || 'YouTube',
          album: 'YouTube Stream',
          coverUrl:
            item.videoThumbnails?.find((t) => t.quality === 'medium')?.url ||
            `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
          src: `https://www.youtube.com/watch?v=${item.videoId}`,
          source: 'youtube',
          format: 'YouTube HD',
          bitrate: item.liveNow ? 'Live Audio 24/7' : 'Audio Stream',
          isLive: !!item.liveNow,
          duration: item.lengthSeconds || 0,
          addedAt: Date.now(),
          genre: 'Streaming',
          isFavorite: false,
        }));
      }
    } catch (e) {
      // try next instance
    }
  }

  return [];
}
