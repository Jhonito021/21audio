import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import https from 'https';
import {defineConfig} from 'vite';

function searchYouTubeServer(query) {
  return new Promise((resolve) => {
    const searchUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
    const req = https.get(
      searchUrl,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          const match = data.match(/var ytInitialData = ({.*?});<\/script>/);
          if (!match) return resolve([]);
          try {
            const parsed = JSON.parse(match[1]);
            const contents =
              parsed.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
                ?.itemSectionRenderer?.contents || [];
            const results = [];
            for (const item of contents) {
              if (item.videoRenderer) {
                const v = item.videoRenderer;
                const videoId = v.videoId;
                const title = v.title?.runs?.[0]?.text || 'Titre inconnu';
                const artist = v.ownerText?.runs?.[0]?.text || 'YouTube';
                const durationText = v.lengthText?.simpleText || '';
                const thumb =
                  v.thumbnail?.thumbnails?.pop()?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

                let durationSecs = 0;
                if (durationText) {
                  const parts = durationText.split(':').map(Number);
                  if (parts.length === 2) durationSecs = parts[0] * 60 + parts[1];
                  else if (parts.length === 3) durationSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];
                }

                results.push({
                  id: `yt-${videoId}`,
                  youtubeId: videoId,
                  title,
                  artist,
                  album: 'YouTube Stream',
                  coverUrl: thumb,
                  src: `https://www.youtube.com/watch?v=${videoId}`,
                  source: 'youtube',
                  format: 'YouTube HD',
                  bitrate: 'Streaming HQ',
                  isLive: !durationText,
                  duration: durationSecs,
                  addedAt: Date.now(),
                  genre: 'YouTube',
                  isFavorite: false,
                });
              }
            }
            resolve(results);
          } catch (e) {
            resolve([]);
          }
        });
      }
    );
    req.on('error', () => resolve([]));
  });
}

function youtubeSearchPlugin() {
  return {
    name: 'youtube-search-plugin',
    configureServer(server) {
      server.middlewares.use('/api/youtube/search', async (req, res) => {
        const urlParams = new URL(req.url, 'http://localhost');
        const query = urlParams.searchParams.get('q');
        if (!query) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify([]));
          return;
        }
        try {
          const results = await searchYouTubeServer(query);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(results));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), youtubeSearchPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
