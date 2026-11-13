function youtubeEmbed(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null
}

export function Trailer({ url, title }: { url: string; title: string }) {
  const embed = youtubeEmbed(url)
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
      {embed ? (
        <iframe
          src={embed}
          title={`${title} trailer`}
          className="size-full"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          className="size-full"
          aria-label={`${title} trailer`}
        />
      )}
    </div>
  )
}
