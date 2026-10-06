"use client";

import { useState, type CSSProperties } from "react";
import { BookOpen, CheckCircle2, Clock, Film, Pencil, PlayCircle, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MediaStatus = "read" | "reading" | "will read" | "watched" | "watching" | "to watch";

interface MediaCardProps {
  kind: "book" | "movie";
  title: string;
  creator?: string;
  status: MediaStatus;
  rating?: number;
  genres?: string[];
  coverUrl?: string;
  /** Position in the grid; the first 10 cards enter 30 ms apart. */
  index?: number;
  onEdit: () => void;
  onDelete: () => void;
}

// The badge sits on the cover, so it keeps an opaque card background and only the text is colored.
const STAGES = {
  done: { icon: CheckCircle2, text: "text-books" },
  progress: { icon: PlayCircle, text: "text-brass-text" },
  planned: { icon: Clock, text: "text-muted-foreground" },
} as const;

const STATUS: Record<MediaStatus, { label: string; stage: keyof typeof STAGES }> = {
  read: { label: "Read", stage: "done" },
  watched: { label: "Watched", stage: "done" },
  reading: { label: "Reading", stage: "progress" },
  watching: { label: "Watching", stage: "progress" },
  "will read": { label: "Will read", stage: "planned" },
  "to watch": { label: "To watch", stage: "planned" },
};

export function MediaCard({
  kind,
  title,
  creator,
  status,
  rating,
  genres = [],
  coverUrl,
  index = 0,
  onEdit,
  onDelete,
}: MediaCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const { label, stage } = STATUS[status];
  const StatusIcon = STAGES[stage].icon;
  const KindIcon = kind === "book" ? BookOpen : Film;
  const enterDelay: CSSProperties = index < 10 ? { animationDelay: `${index * 30}ms` } : {};

  return (
    <article
      className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-card transition duration-150 hover:shadow-card-hover motion-safe:animate-enter motion-safe:hover:-translate-y-0.5"
      style={enterDelay}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-card">
        {coverUrl && !coverFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- covers come from any host the user pastes
          <img
            src={coverUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setCoverFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center",
              kind === "book" ? "bg-books/15 text-books" : "bg-movies/15 text-movies"
            )}
          >
            <KindIcon className="h-8 w-8" aria-hidden />
            <span className="line-clamp-3 font-display text-lg font-semibold leading-tight text-foreground">
              {title}
            </span>
          </div>
        )}
        <Badge
          className={cn("absolute left-2 top-2 gap-1 border-0 bg-card shadow-card hover:bg-card", STAGES[stage].text)}
        >
          <StatusIcon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{title}</h3>
        {creator && <p className="truncate text-sm text-muted-foreground">{creator}</p>}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {rating ? (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-brass text-brass" aria-hidden />
              <span>
                {rating}
                <span className="sr-only"> out of 5</span>
                <span aria-hidden>/5</span>
              </span>
            </span>
          ) : null}
          {genres.length > 0 && (
            <span className="truncate">
              {genres.slice(0, 2).join(" · ")}
              {genres.length > 2 && ` +${genres.length - 2}`}
            </span>
          )}
        </div>

        <div className="mt-auto flex gap-1 pt-4">
          <Button size="sm" variant="outline" onClick={onEdit} className="flex-1">
            <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            aria-label={`Delete ${title}`}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}
