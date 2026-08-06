import React, { useEffect, useRef, useState } from 'react';

export const YouTubePlayer = ({
  currentTrack,
  isPlaying,
  volume,
  seekTime,
  onTimeUpdate,
  onEnded,
  onStateChange,
  showVideo = false,
}) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [resolvedVideoId, setResolvedVideoId] = useState(currentTrack?.youtubeId || null);

  useEffect(() => {
    let isCancelled = false;
    if (currentTrack?.youtubeId) {
      setResolvedVideoId(currentTrack.youtubeId);
    } else if (currentTrack?.searchQuery) {
      fetch(`/api/youtube/search?q=${encodeURIComponent(currentTrack.searchQuery)}`)
        .then((r) => r.json())
        .then((data) => {
          if (!isCancelled && Array.isArray(data) && data[0]?.youtubeId) {
            setResolvedVideoId(data[0].youtubeId);
          }
        })
        .catch(() => {});
    } else {
      setResolvedVideoId(null);
    }
    return () => {
      isCancelled = true;
    };
  }, [currentTrack]);

  const videoId = resolvedVideoId;

  // Load YouTube IFrame API script dynamically
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        window.isYTReady = true;
      };
    }
  }, []);

  // Initialize or update YouTube Player
  useEffect(() => {
    if (!videoId) return;

    let isSubscribed = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        setTimeout(initPlayer, 200);
        return;
      }

      if (playerRef.current) {
        // Player exists, load new video
        try {
          if (isPlaying) {
            playerRef.current.loadVideoById(videoId);
          } else {
            playerRef.current.cueVideoById(videoId);
          }
        } catch (e) {
          console.warn('YouTube loadVideoById error:', e);
        }
        return;
      }

      // Create new YT Player
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            if (!isSubscribed) return;
            setIsReady(true);
            event.target.setVolume(Math.round((volume ?? 0.85) * 100));
            if (isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            if (!isSubscribed) return;
            const state = event.data;
            // YT.PlayerState: UNSTARTED (-1), ENDED (0), PLAYING (1), PAUSED (2), BUFFERING (3), CUED (5)
            if (state === window.YT.PlayerState.PLAYING) {
              onStateChange?.(true, false);
            } else if (state === window.YT.PlayerState.PAUSED) {
              onStateChange?.(false, false);
            } else if (state === window.YT.PlayerState.BUFFERING) {
              onStateChange?.(isPlaying, true);
            } else if (state === window.YT.PlayerState.ENDED) {
              onStateChange?.(false, false);
              onEnded?.();
            }
          },
        },
      });
    };

    initPlayer();

    return () => {
      isSubscribed = false;
    };
  }, [videoId]);

  // Sync Play / Pause state
  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    try {
      if (isPlaying) {
        playerRef.current.playVideo?.();
      } else {
        playerRef.current.pauseVideo?.();
      }
    } catch (e) {
      console.warn('YouTube play/pause sync error:', e);
    }
  }, [isPlaying, isReady]);

  // Sync Volume
  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    try {
      playerRef.current.setVolume?.(Math.round((volume ?? 0.85) * 100));
    } catch (e) {
      console.warn('YouTube volume sync error:', e);
    }
  }, [volume, isReady]);

  // Sync Seek Time
  useEffect(() => {
    if (seekTime === null || seekTime === undefined || !playerRef.current || !isReady) return;
    try {
      playerRef.current.seekTo?.(seekTime, true);
    } catch (e) {
      console.warn('YouTube seek sync error:', e);
    }
  }, [seekTime, isReady]);

  // Time update polling loop
  useEffect(() => {
    if (!isPlaying || !isReady) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const cur = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || 0;
        onTimeUpdate?.(cur, dur);
      }
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, isReady]);

  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 ${
        showVideo
          ? 'w-full aspect-video rounded-2xl bg-black shadow-2xl border border-neutral-800'
          : 'w-1 h-1 opacity-0 absolute pointer-events-none -left-9999px'
      }`}
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
