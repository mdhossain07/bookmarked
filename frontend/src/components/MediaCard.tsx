import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Edit, Eye, Clock, BookOpen } from "lucide-react";
import { format } from "date-fns";

interface MediaCardProps {
  title: string;
  creator: string; // director for movies, author for books
  status:
    | "watched"
    | "watching"
    | "to watch"
    | "read"
    | "reading"
    | "will read";
  rating?: number | undefined;
  notes?: string | undefined;
  dateAdded: Date;
  dateFinished?: Date | undefined;
  genre?: string[] | undefined;
  coverUrl?: string | undefined;
  onEdit: () => void;
  onDelete: () => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "watched":
    case "read":
      return {
        label: status === "watched" ? "Watched" : "Read",
        variant: "default" as const,
        icon: Eye,
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      };
    case "watching":
    case "reading":
      return {
        label: status === "watching" ? "Watching" : "Reading",
        variant: "secondary" as const,
        icon: status === "watching" ? Eye : BookOpen,
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      };
    case "to watch":
    case "will read":
      return {
        label: status === "to watch" ? "Want to Watch" : "Will Read",
        variant: "outline" as const,
        icon: Clock,
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      };
    default:
      return {
        label: status,
        variant: "outline" as const,
        icon: Clock,
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
  }
};

export function MediaCard({
  title,
  creator,
  status,
  rating,
  notes,
  dateAdded,
  dateFinished,
  genre,
  coverUrl,
  onEdit,
  onDelete,
}: MediaCardProps) {
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {creator}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge className={statusConfig.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {rating}/5
            </span>
          </div>
        )}

        {/* Genres */}
        {genre && genre.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genre.slice(0, 3).map((g, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {g}
              </Badge>
            ))}
            {genre.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{genre.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            onClick={onEdit}
            variant="outline"
            className="w-full"
          >
            Edit
          </Button>

          <Button
            size="sm"
            onClick={onDelete}
            variant="destructive"
            className="w-full"
          >
            Delete
          </Button>
        </div>

        {/* Notes Preview */}
        {/* {notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {notes}
          </p>
        )} */}

        {/* Dates */}
        {/* <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Added {format(dateAdded, "MMM d, yyyy")}</span>
          </div>
          {dateFinished && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Finished {format(dateFinished, "MMM d, yyyy")}</span>
            </div>
          )}
        </div> */}
      </CardContent>
    </Card>
  );
}
