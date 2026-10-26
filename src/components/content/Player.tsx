'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, Volume1,
  SkipBack, SkipForward, Fullscreen, Minimize,
  Settings, X, ChevronDown, ChevronUp, Subtitles,
  PictureInPicture2, RotateCcw, RotateCw, Clock
} from 'lucide-react';
import type { MediaItem, Episode } from '@/lib/types';
import { cn, formatDuration } from '@/lib/utils';
import { saveContinueWatching, getContinueWatching } from '@/lib/progress';
import { saveSyncedMovies, setSyncedSignature } from '@/lib/synced-catalog';

interface PlayerProps {
  media: MediaItem;
  episode?: Episode;
  onClose: () => void;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  autoPlay?: boolean;
}

export function Player({ media, episode, onClose, onNextEpisode, onPreviousEpisode, autoPlay = true }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('Auto');
  /** Índice de la pista de subtítulos activa; -1 = desactivados. */
  const [activeSubtitle, setActiveSubtitle] = useState(-1);
  /**
   * URL corregida tras volver a importar el catálogo. La URL guardada puede
   * apuntar a un túnel antiguo; cuando falla, se pide el catálogo otra vez y se
   * reproduce con la dirección buena sin recargar la página.
   */
  const [srcOverride, setSrcOverride] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  /** true si el vídeo lleva demasiado tiempo sin dar señal de vida. */
  const [takingTooLong, setTakingTooLong] = useState(false);
  const [repairing, setRepairing] = useState(false);
  /** Cambiarlo remonta el <video> y fuerza una carga limpia. */
  const [reloadKey, setReloadKey] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const videoSrc = srcOverride ?? episode?.videoUrl ?? media.videoUrl;

  const subtitleTracks = episode?.subtitles ?? media.subtitles ?? [];

  // Guardar progreso en localStorage periódicamente
  useEffect(() => {
    if (duration > 0 && currentTime > 10) {
      saveContinueWatching({
        mediaId: media.id,
        profileId: 'default',
        progress: Math.round((currentTime / duration) * 100),
        currentEpisode: episode || undefined,
        timestamp: Date.now(),
      });
    }
  }, [currentTime, duration, media.id, episode]);

  // Leer progreso guardado al montar
  useEffect(() => {
    const progress = getContinueWatching();
    const saved = progress.find(p => p.mediaId === media.id);
    if (saved && saved.progress > 5 && saved.progress < 95 && videoRef.current) {
      const applySavedTime = () => {
        if (videoRef.current && duration > 0) {
          videoRef.current.currentTime = (saved.progress / 100) * duration;
          setCurrentTime(videoRef.current.currentTime);
        }
        videoRef.current?.removeEventListener('loadedmetadata', applySavedTime);
      };
      videoRef.current.addEventListener('loadedmetadata', applySavedTime);
      if (videoRef.current.readyState >= 2 && duration > 0) {
        videoRef.current.currentTime = (saved.progress / 100) * duration;
        setCurrentTime((saved.progress / 100) * duration);
      }
    }
  }, [media.id]);

  // Hide controls after inactivity
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    containerRef.current?.addEventListener('mousemove', resetControlsTimeout);
    containerRef.current?.addEventListener('mouseleave', () => {
      if (isPlaying) setShowControls(false);
    });
    return () => {
      containerRef.current?.removeEventListener('mousemove', resetControlsTimeout);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout, isPlaying]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
    setVideoError(null);
    setTakingTooLong(false);

    // Elige subtítulo automáticamente: español si existe; si solo hay una
    // pista, esa; si hay varias sin español, se quedan apagados.
    setActiveSubtitle((current) => {
      if (current >= 0) return current;
      if (subtitleTracks.length === 0) return -1;
      const spanish = subtitleTracks.findIndex((track) =>
        /^(spa|es|es-|es_)/i.test(track.language)
      );
      if (spanish >= 0) return spanish;
      return subtitleTracks.length === 1 ? 0 : -1;
    });
  };

  // Aplica la pista elegida al elemento <video>.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = i === activeSubtitle ? 'showing' : 'disabled';
    }
  }, [activeSubtitle, subtitleTracks.length, episode?.id, media.id]);

  // Al cambiar de título/episodio, vuelve a elegir (normalmente español).
  useEffect(() => {
    setActiveSubtitle(-1);
  }, [episode?.id, media.id]);

  // Al cambiar de título, se parte de la URL tal cual viene del catálogo.
  useEffect(() => {
    setSrcOverride(null);
    setVideoError(null);
    setTakingTooLong(false);
    setReloadKey(0);
  }, [episode?.id, media.id]);

  /**
   * Vigila que el vídeo empiece. Si en 20 s no ha llegado ni los metadatos,
   * se muestra un aviso con botón en vez de un giro infinito.
   */
  useEffect(() => {
    if (!videoSrc) return;
    setTakingTooLong(false);
    const timer = setTimeout(() => {
      const video = videoRef.current;
      if (video && video.readyState < 1) setTakingTooLong(true);
    }, 20000);
    return () => clearTimeout(timer);
  }, [videoSrc, reloadKey]);

  /** Mensaje entendible a partir del error real del <video>. */
  const describeVideoError = (video: HTMLVideoElement | null): string => {
    switch (video?.error?.code) {
      case 1:
        return 'La carga del vídeo se canceló.';
      case 2:
        return 'Error de red: no se pudo descargar el vídeo desde tu servidor.';
      case 3:
        return 'El archivo está dañado o usa un códec que este navegador no puede decodificar.';
      case 4:
        return 'No se puede reproducir: el servidor de vídeo no responde o el formato no es compatible con este navegador.';
      default:
        return 'No se pudo reproducir el vídeo.';
    }
  };

  /**
   * Reintento inteligente: vuelve a importar el catálogo (por si el túnel cambió
   * de dirección) y reproduce con la URL nueva. También arregla el catálogo
   * guardado en este navegador, así que el resto de la app se corrige igual.
   */
  const repairPlayback = useCallback(async () => {
    setRepairing(true);
    setVideoError(null);
    setTakingTooLong(false);
    try {
      const infoResponse = await fetch('/api/jellyfin/sync', { cache: 'no-store' });
      const info = await infoResponse.json();
      const syncResponse = await fetch('/api/jellyfin/sync', { method: 'POST' });
      const payload = await syncResponse.json();

      if (payload?.success && Array.isArray(payload.movies)) {
        saveSyncedMovies(payload.movies, 'replace');
        if (info?.success && info.signature) setSyncedSignature(info.signature);

        const fresh = (payload.movies as MediaItem[]).find((item) => item.id === media.id);
        const url = episode
          ? fresh?.episodes?.find((item) => item.id === episode.id)?.videoUrl
          : fresh?.videoUrl;
        if (url) setSrcOverride(url);
      }
    } catch {
      /* Sin red o servidor caído: se reintenta con lo que haya. */
    } finally {
      setRepairing(false);
      setReloadKey((key) => key + 1);
    }
  }, [media.id, episode]);

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onNextEpisode?.();
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) toggleFullscreen();
          if (showSettings) setShowSettings(false);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, duration, isFullscreen, showSettings]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-netflix-black flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`Reproductor: ${episode?.title || media.title}`}
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
    >
      {/* Video Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <video
          key={reloadKey}
          ref={videoRef}
          className="w-full h-full object-contain"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={() => setVideoError(describeVideoError(videoRef.current))}
          onClick={handlePlayPause}
          onDoubleClick={toggleFullscreen}
          playsInline
          autoPlay={autoPlay}
          src={videoSrc}
        >
          {subtitleTracks.map((track, index) => (
            <track
              key={`${track.index}-${track.language}`}
              kind="subtitles"
              src={track.url}
              srcLang={track.language || 'und'}
              label={track.label}
              default={index === activeSubtitle}
            />
          ))}
        </video>
        
        {/* Carga, error y reintento */}
        {(!duration || videoError || takingTooLong) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-netflix-black px-6 text-center">
            {videoError || takingTooLong ? (
              <>
                <p className="max-w-md text-sm text-netflix-lightGray">
                  {videoError ??
                    'Tu servidor de vídeo está tardando en responder. Puede que el túnel haya cambiado de dirección.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={repairPlayback}
                    disabled={repairing}
                    className="btn-primary disabled:opacity-60"
                  >
                    {repairing ? 'Reconectando…' : 'Reintentar'}
                  </button>
                  <button type="button" onClick={onClose} className="btn-secondary">
                    Cerrar
                  </button>
                </div>
              </>
            ) : (
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-netflix-gray border-t-netflix-red" />
            )}
          </div>
        )}

        {/* Top Bar */}
        <AnimatePresence mode="wait">
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-netflix-black/90 to-transparent z-10"
            >
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-netflix-card/80 backdrop-blur-sm text-netflix-white hover:bg-netflix-cardHover transition-colors"
                aria-label="Cerrar reproductor"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex-1 text-center">
                <h2 className="font-bold text-netflix-white truncate max-w-md mx-auto">
                  {episode?.title || media.title}
                </h2>
                {episode && (
                  <p className="text-sm text-netflix-gray">
                    Temporada {episode.season} • Episodio {episode.episode}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-netflix-card/80 backdrop-blur-sm text-netflix-white hover:bg-netflix-cardHover transition-colors"
                  aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Fullscreen className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => videoRef.current?.requestPictureInPicture?.()}
                  className="p-2 rounded-lg bg-netflix-card/80 backdrop-blur-sm text-netflix-white hover:bg-netflix-cardHover transition-colors"
                  aria-label="Picture in Picture"
                >
                  <PictureInPicture2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Controls */}
        <AnimatePresence mode="wait">
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-netflix-black/95 to-transparent z-10"
            >
              {/* Progress Bar */}
              <div
                ref={progressRef}
                className="relative h-1 bg-netflix-gray/30 rounded-full cursor-pointer mb-4 group"
                onClick={handleSeek}
                onMouseMove={(e) => {
                  if (progressRef.current && duration) {
                    const rect = progressRef.current.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    // Could show preview tooltip here
                  }
                }}
                role="slider"
                aria-label="Progreso de reproducción"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={duration > 0 ? Math.round((currentTime / duration) * 100) : 0}
                tabIndex={0}
              >
                <motion.div
                  className="absolute top-0 left-0 h-full bg-netflix-red rounded-full"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  animate={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  transition={{ duration: 0.1 }}
                />
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-0 left-0 w-3 h-3 bg-netflix-red rounded-full -translate-x-1/2 -translate-y-1/2 transform" 
                       style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center justify-between text-sm text-netflix-lightGray mb-3">
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                <span className="text-xs bg-netflix-card/50 px-2 py-1 rounded">{formatDuration(playbackRate)}x</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                {/* Left controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => videoRef.current && (videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10))}
                    className="p-2 rounded-lg text-netflix-white hover:bg-netflix-card transition-colors"
                    aria-label="Retroceder 10 segundos"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onPreviousEpisode}
                    disabled={!onPreviousEpisode}
                    className="p-2 rounded-lg text-netflix-white hover:bg-netflix-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Episodio anterior"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="p-3 rounded-xl bg-netflix-white text-netflix-black hover:bg-netflix-offWhite transition-colors"
                    aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={onNextEpisode}
                    disabled={!onNextEpisode}
                    className="p-2 rounded-lg text-netflix-white hover:bg-netflix-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Siguiente episodio"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => videoRef.current && (videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10))}
                    className="p-2 rounded-lg text-netflix-white hover:bg-netflix-card transition-colors"
                    aria-label="Adelantar 10 segundos"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                </div>

                {/* Center - Volume */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg text-netflix-white hover:bg-netflix-card transition-colors"
                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : volume < 0.5 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-netflix-gray/30 rounded-full appearance-none cursor-pointer accent-netflix-red"
                    aria-label="Volumen"
                  />
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  {/* Subtitles */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 rounded-lg text-netflix-white hover:bg-netflix-card transition-colors flex items-center gap-1"
                      aria-label="Configuración de subtítulos"
                      aria-expanded={showSettings}
                    >
                      <Subtitles className="w-5 h-5" />
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full right-0 mb-2 glass-strong rounded-xl p-2 min-w-[160px] shadow-netflix-lg"
                        >
                          <p className="px-3 py-2 text-xs font-medium text-netflix-gray uppercase">Subtítulos</p>
                          <button
                            onClick={() => setActiveSubtitle(-1)}
                            className={cn(
                              'w-full px-3 py-2 text-left text-sm rounded-lg transition-colors',
                              activeSubtitle === -1 ? 'bg-netflix-red/20 text-netflix-red' : 'text-netflix-white hover:bg-netflix-gray/10'
                            )}
                          >
                            Apagado
                          </button>
                          {subtitleTracks.map((track, index) => (
                            <button
                              key={`${track.index}-${track.language}`}
                              onClick={() => setActiveSubtitle(index)}
                              className={cn(
                                'w-full px-3 py-2 text-left text-sm rounded-lg transition-colors',
                                activeSubtitle === index ? 'bg-netflix-red/20 text-netflix-red' : 'text-netflix-white hover:bg-netflix-gray/10'
                              )}
                            >
                              {track.label}
                            </button>
                          ))}
                          {subtitleTracks.length === 0 && (
                            <p className="px-3 pb-2 text-xs text-netflix-gray">
                              Este título no tiene subtítulos. Añádelos en Jellyfin (o instala un
                              proveedor como OpenSubtitles) y se importarán solos.
                            </p>
                          )}
                          <hr className="my-1 border-netflix-gray/20" />
                          <p className="px-3 py-2 text-xs font-medium text-netflix-gray uppercase">Velocidad</p>
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                            <button
                              key={rate}
                              onClick={() => { setPlaybackRate(rate); if (videoRef.current) videoRef.current.playbackRate = rate; }}
                              className={cn(
                                'w-full px-3 py-2 text-left text-sm rounded-lg transition-colors',
                                playbackRate === rate ? 'bg-netflix-red/20 text-netflix-red' : 'text-netflix-white hover:bg-netflix-gray/10'
                              )}
                            >
                              {rate}x
                            </button>
                          ))}
                          <hr className="my-1 border-netflix-gray/20" />
                          <p className="px-3 py-2 text-xs font-medium text-netflix-gray uppercase">Calidad</p>
                          {['Auto', '1080p', '720p', '480p'].map(q => (
                            <button
                              key={q}
                              onClick={() => setQuality(q)}
                              className={cn(
                                'w-full px-3 py-2 text-left text-sm rounded-lg transition-colors',
                                quality === q ? 'bg-netflix-red/20 text-netflix-red' : 'text-netflix-white hover:bg-netflix-gray/10'
                              )}
                            >
                              {q}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Settings */}
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-lg text-netflix-white hover:bg-netflix-card transition-colors"
                    aria-label="Configuración"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Episode Countdown */}
        <AnimatePresence>
          {!isPlaying && duration > 0 && currentTime >= duration - 1 && onNextEpisode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 glass-strong rounded-2xl p-6 max-w-md text-center shadow-netflix-lg z-20"
            >
              <p className="text-netflix-lightGray mb-2">Siguiente episodio en</p>
              <p className="text-3xl font-bold text-netflix-red mb-4" id="countdown">5</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => { onNextEpisode?.(); setIsPlaying(true); }}
                  className="btn-primary"
                >
                  Reproducir ahora
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}