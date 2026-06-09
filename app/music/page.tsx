'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  RotateCcw,
  Shuffle,
  Music,
  Heart,
  Calendar,
  ListMusic,
  Clock
} from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  audioUrl: string;
  coverUrl?: string;
  duration: number;
}

export default function MusicPlayerPage() {
  const { t } = useLanguage();
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch songs
  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch('/api/songs');
        const data = await res.json();
        if (data.songs) {
          setSongs(data.songs);
        }
      } catch (err) {
        console.error('Error fetching songs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  const currentSong = songs[currentSongIndex];

  // Set audio source when song changes
  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.load();
      // Only autoplay if user already started interacting (isPlaying is true)
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log('Autoplay blocked', e));
      } else {
        setCurrentTime(0);
      }
    }
  }, [currentSongIndex, songs]);

  // Sync isPlaying state with HTML5 audio
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => {
        console.error('Play failed', e);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Sync volume state with HTML5 audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (!currentSong) return;
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    if (isLooping) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    if (songs.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentSongIndex(randomIndex);
    } else {
      setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    }
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (songs.length === 0) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // Restart current song
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    } else {
      setCurrentSongIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) {
      setIsMuted(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSelectSong = (index: number) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 sm:px-6">
      {/* Title block */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Heart className="h-7 w-7 text-pink-600 fill-current animate-pulse" />
          <span>{t('music_title')}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('music_subtitle')}
        </p>
      </div>

      {songs.length === 0 ? (
        <div className="aesthetic-card rounded-3xl p-12 text-center border-dashed border-2 max-w-xl mx-auto space-y-4">
          <Music className="h-16 w-16 text-muted-foreground/60 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">{t('music_empty')}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Active player details & controls */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-gradient-to-b from-card to-secondary/10 border border-border p-6 shadow-xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-10 left-10 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 translate-x-1/2 translate-y-1/2 w-48 h-48 rounded-full bg-pink-600/5 blur-3xl pointer-events-none" />

            {/* Cover art block */}
            <div className="relative z-10 flex flex-col items-center mt-4">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-card/90 transition-transform duration-500 hover:scale-105 group">
                <img
                  src={currentSong?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400'}
                  alt={currentSong?.title}
                  className={`w-full h-full object-cover transition-transform duration-[10s] linear ${isPlaying ? 'scale-110 rotate-3' : ''}`}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Music className="h-10 w-10 text-white animate-bounce" />
                </div>
              </div>

              {/* Title & Artist info */}
              <div className="text-center mt-6 w-full px-4">
                <h2 className="text-xl font-black truncate text-foreground leading-snug">
                  {currentSong?.title}
                </h2>
                <p className="text-xs font-semibold text-primary mt-1 tracking-wider uppercase">
                  {currentSong?.artist}
                </p>
                {currentSong?.album && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate italic">
                    Album: {currentSong.album}
                  </p>
                )}
              </div>

              {/* Equalizer Micro-Animation */}
              <div className="flex items-center gap-1.5 h-8 mt-6">
                {[0.4, 0.8, 0.3, 0.9, 0.5, 0.7, 0.4].map((scale, i) => (
                  <div
                    key={i}
                    style={{
                      animation: isPlaying
                        ? `equalizer 1.2s ease-in-out infinite alternate`
                        : 'none',
                      animationDelay: `${i * 0.15}s`,
                      height: isPlaying ? '24px' : '4px',
                    }}
                    className="w-1 rounded bg-primary/80"
                  />
                ))}
              </div>
            </div>

            {/* Audio controls block */}
            <div className="relative z-10 mt-8 space-y-6">
              {/* Audio Element */}
              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
              />

              {/* Scrubber Timeline */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary border-none"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) ${(currentTime / (duration || 1)) * 100}%, hsl(var(--muted)) ${(currentTime / (duration || 1)) * 100}%)`,
                  }}
                />
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Player buttons */}
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-2 rounded-full transition-all hover:bg-muted ${
                    isShuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Shuffle"
                >
                  <Shuffle className="h-4.5 w-4.5" />
                </button>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrev}
                    className="p-2 rounded-full transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Previous"
                  >
                    <SkipBack className="h-5 w-5 fill-current" />
                  </button>

                  <button
                    onClick={handlePlayPause}
                    className="h-14 w-14 rounded-full bg-primary hover:bg-emerald-500 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 fill-current" />
                    ) : (
                      <Play className="h-6 w-6 fill-current translate-x-0.5" />
                    )}
                  </button>

                  <button
                    onClick={handleNext}
                    className="p-2 rounded-full transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Next"
                  >
                    <SkipForward className="h-5 w-5 fill-current" />
                  </button>
                </div>

                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-2 rounded-full transition-all hover:bg-muted ${
                    isLooping ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Repeat"
                >
                  <RotateCcw className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Volume block */}
              <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-2xl border border-border/40">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4.5 w-4.5 text-accent" />
                  ) : (
                    <Volume2 className="h-4.5 w-4.5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary border-none"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) ${(isMuted ? 0 : volume) * 100}%, hsl(var(--muted)) ${(isMuted ? 0 : volume) * 100}%)`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right panel: Playlist queues */}
          <div className="lg:col-span-7 aesthetic-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3 flex items-center gap-2">
                <ListMusic className="h-4 w-4 text-primary" />
                <span>Playlist ({songs.length} Tracks)</span>
              </h3>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {songs.map((song, idx) => {
                  const isCurrent = idx === currentSongIndex;
                  return (
                    <div
                      key={song.id}
                      onClick={() => handleSelectSong(idx)}
                      className={`flex items-center justify-between rounded-2xl p-3 cursor-pointer transition-all border ${
                        isCurrent
                          ? 'bg-primary/10 border-primary shadow-sm hover:bg-primary/15'
                          : 'border-border/60 hover:bg-muted/40 hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Cover thumbnail or index count */}
                        <div className="relative shrink-0 w-11 h-11 rounded-lg overflow-hidden border border-border/80 flex items-center justify-center bg-muted">
                          {song.coverUrl ? (
                            <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Music className="h-5 w-5 text-muted-foreground/60" />
                          )}
                          
                          {isCurrent && isPlaying && (
                            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title details */}
                        <div className="min-w-0">
                          <h4 className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                            {song.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {song.artist} {song.album ? `• ${song.album}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Track duration */}
                      <div className="flex items-center gap-3 text-muted-foreground text-xs font-semibold shrink-0">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <span>{formatTime(song.duration)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Tribute Bio Link */}
            <div className="mt-6 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground font-bold">
              <span className="uppercase tracking-widest text-primary flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Zubeen Garg Tribute Platform
              </span>
              <a
                href="/tribute"
                className="text-primary hover:underline transition-colors flex items-center gap-0.5"
              >
                Read Zubeen's Environmental Journey →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Styled Keyframes injected via CSS */}
      <style jsx global>{`
        @keyframes equalizer {
          0% {
            height: 4px;
          }
          100% {
            height: 24px;
          }
        }
      `}</style>
    </div>
  );
}
