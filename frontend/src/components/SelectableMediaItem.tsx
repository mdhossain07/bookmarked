import React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, BookOpen, Film } from "lucide-react";
import type { ParsedMediaItem } from "bookmarked-types";

interface SelectableMediaItemProps {
  item: ParsedMediaItem;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
  isDuplicate?: boolean;
}

export const SelectableMediaItem: React.FC<SelectableMediaItemProps> = ({
  item,
  isSelected,
  onSelectionChange,
  isDuplicate = false,
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <div
      className={`p-4 border rounded-lg transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      } ${isDuplicate ? "border-orange-300 bg-orange-50" : ""}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectionChange}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            {item.type === "book" ? (
              <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            ) : (
              <Film className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {item.title}
              </h3>

              {(item.author || item.director) && (
                <p className="text-sm text-gray-600 truncate">
                  by {item.author || item.director}
                </p>
              )}
            </div>

            {isDuplicate && (
              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
            )}
          </div>

          {item.description && (
            <p className="text-sm text-gray-700 mb-2 line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {item.genre && item.genre.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {item.genre.slice(0, 3).map((genre, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
                {item.genre.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{item.genre.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs text-gray-500">Confidence:</span>
              <span
                className={`text-xs font-medium ${getConfidenceColor(
                  item.confidence
                )}`}
              >
                {getConfidenceText(item.confidence)}
              </span>
            </div>
          </div>

          {isDuplicate && (
            <div className="mt-2 p-2 bg-orange-100 rounded text-xs text-orange-800">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              This item may already exist in your collection
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectableMediaItem;
