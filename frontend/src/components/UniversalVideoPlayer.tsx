"use client";

import { useState, useMemo } from "react";

interface Props {
  videoUrl: string | null;
  posterUrl?: string | null;
  title?: string;
  className?: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0`;
  }
  return null;
}

function getVimeoEmbedUrl(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  return null;
}

function isDirectVideo(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.endsWith(".mp4") ||
    u.endsWith(".webm") ||
    u.endsWith(".ogg") ||
    u.endsWith(".mov") ||
    u.includes("/uploads/videos/")
  );
}

export default function UniversalVideoPlayer({
  videoUrl,
  posterUrl,
  title,
  className = "",
}: Props) {
  const [error, setError] = useState<string | null>(null);

  const { type, src } = useMemo(() => {
    if (!videoUrl?.trim()) return { type: "none" as const, src: null };
    const url = videoUrl.trim();
    const yt = getYouTubeEmbedUrl(url);
    if (yt) return { type: "youtube" as const, src: yt };
    const vm = getVimeoEmbedUrl(url);
    if (vm) return { type: "vimeo" as const, src: vm };
    if (isDirectVideo(url) || url.startsWith("http") || url.startsWith("/")) {
      return { type: "direct" as const, src: url };
    }
    return { type: "direct" as const, src: url };
  }, [videoUrl]);

  if (!videoUrl?.trim()) {
    return (
      <div
        className={`aspect-video bg-gray-900 flex items-center justify-center text-gray-500 ${className}`}
      >
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-2 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p>Video ma la gelin</p>
        </div>
      </div>
    );
  }

  if (type === "youtube" && src) {
    return (
      <div className={`aspect-video bg-black overflow-hidden rounded-lg ${className}`}>
        <iframe
          src={src}
          title={title ?? "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  if (type === "vimeo" && src) {
    return (
      <div className={`aspect-video bg-black overflow-hidden rounded-lg ${className}`}>
        <iframe
          src={src}
          title={title ?? "Vimeo video"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  if ((type === "direct" || type === "none") && src) {
    return (
      <div className={`aspect-video bg-black overflow-hidden rounded-lg ${className}`}>
        <video
          src={src}
          poster={posterUrl ?? undefined}
          controls
          className="w-full h-full"
          onError={() => setError("Video ma soo bixin karin")}
        >
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-gray-900">
              {error}
            </div>
          )}
        </video>
      </div>
    );
  }

  return (
    <div
      className={`aspect-video bg-gray-900 flex items-center justify-center text-gray-500 ${className}`}
    >
      <p>URL-ka video-ga ma saxna</p>
    </div>
  );
}
