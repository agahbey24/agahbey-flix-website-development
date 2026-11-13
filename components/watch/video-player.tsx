'use client'

import {
  DownloadIcon,
  MaximizeIcon,
  MinimizeIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const mm = h ? String(m).padStart(2, '0') : String(m)
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`
}

export function VideoPlayer({
  src,
  title,
  poster,
  downloadUrl,
}: {
  src: string
  title: string
  poster?: string
  downloadUrl?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const showControls = () => {
    setControlsVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false)
    }, 2800)
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => setError(true))
    else v.pause()
  }

  const seekBy = (delta: number) => {
    const v = videoRef.current
    if (v) v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration || 0)
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const toggleFullscreen = async () => {
    const el = containerRef.current
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (!el) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else if (el.requestFullscreen) {
      await el.requestFullscreen().catch(() => v?.webkitEnterFullscreen?.())
    } else {
      v?.webkitEnterFullscreen?.()
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return
    const key = e.key.toLowerCase()
    if (key === ' ' || key === 'k') { e.preventDefault(); togglePlay() }
    else if (key === 'arrowright' || key === 'l') seekBy(10)
    else if (key === 'arrowleft' || key === 'j') seekBy(-10)
    else if (key === 'm') toggleMute()
    else if (key === 'f') toggleFullscreen()
    showControls()
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseMove={showControls}
      onTouchStart={showControls}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        'group relative aspect-video w-full overflow-hidden bg-black outline-none focus-visible:ring-2 focus-visible:ring-brand',
        fullscreen ? 'rounded-none' : 'rounded-lg',
        !controlsVisible && playing && 'cursor-none',
      )}
      aria-label={`${title} video player`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        className="size-full"
        onClick={togglePlay}
        onPlay={() => { setPlaying(true); showControls() }}
        onPause={() => { setPlaying(false); setControlsVisible(true) }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onProgress={(e) => {
          const v = e.currentTarget
          if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1))
        }}
        onError={() => setError(true)}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-sm text-foreground/80">
          This video could not be loaded. Please refresh the page or contact support.
        </div>
      )}

      {!playing && !error && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand/90 text-white shadow-2xl transition-transform hover:scale-110"
          aria-label="Play"
        >
          <PlayIcon className="ml-1 size-9 fill-current" aria-hidden="true" />
        </button>
      )}

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pt-10 pb-3 transition-opacity duration-300 md:px-5',
          controlsVisible || !playing ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <div className="relative flex h-4 items-center">
          <div className="absolute inset-x-0 h-1 rounded-full bg-white/20" aria-hidden="true">
            <div className="h-full rounded-full bg-white/30" style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={(e) => {
              const v = videoRef.current
              if (v) v.currentTime = Number(e.target.value)
            }}
            aria-label="Seek"
            className="relative h-1 w-full cursor-pointer appearance-none bg-transparent accent-brand [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand"
            style={{
              background: `linear-gradient(to right, var(--brand) ${duration ? (current / duration) * 100 : 0}%, transparent 0)`,
              borderRadius: 9999,
            }}
          />
        </div>

        <div className="flex items-center gap-1 text-white md:gap-2">
          <button type="button" onClick={togglePlay} className="flex size-10 items-center justify-center rounded-md hover:bg-white/10" aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <PauseIcon className="size-6 fill-current" /> : <PlayIcon className="size-6 fill-current" />}
          </button>
          <button type="button" onClick={() => seekBy(-10)} className="flex size-10 items-center justify-center rounded-md hover:bg-white/10" aria-label="Back 10 seconds">
            <RotateCcwIcon className="size-5" />
          </button>
          <button type="button" onClick={() => seekBy(10)} className="flex size-10 items-center justify-center rounded-md hover:bg-white/10" aria-label="Forward 10 seconds">
            <RotateCwIcon className="size-5" />
          </button>
          <div className="group/vol flex items-center">
            <button type="button" onClick={toggleMute} className="flex size-10 items-center justify-center rounded-md hover:bg-white/10" aria-label={muted || volume === 0 ? 'Unmute' : 'Mute'}>
              {muted || volume === 0 ? <VolumeXIcon className="size-5" /> : <Volume2Icon className="size-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const v = videoRef.current
                const next = Number(e.target.value)
                setVolume(next)
                if (v) { v.volume = next; v.muted = next === 0; setMuted(next === 0) }
              }}
              aria-label="Volume"
              className="hidden w-20 accent-brand sm:block"
            />
          </div>
          <span className="ml-1 text-xs tabular-nums text-white/85 md:text-sm">
            {formatTime(current)} / {formatTime(duration)}
          </span>
          <span className="ml-auto hidden truncate px-2 text-sm font-medium text-white/85 md:block">{title}</span>
          {downloadUrl && (
            <a href={downloadUrl} className="ml-auto flex size-10 items-center justify-center rounded-md hover:bg-white/10 md:ml-0" aria-label="Download">
              <DownloadIcon className="size-5" />
            </a>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={cn('flex size-10 items-center justify-center rounded-md hover:bg-white/10', !downloadUrl && 'ml-auto md:ml-0')}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <MinimizeIcon className="size-5" /> : <MaximizeIcon className="size-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
