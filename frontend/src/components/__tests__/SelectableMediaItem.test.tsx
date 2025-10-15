import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

// Mock the UI components to avoid import issues
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, variant }: any) =>
    React.createElement(
      "span",
      { className: `badge ${className} ${variant}` },
      children
    ),
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, className }: any) =>
    React.createElement("input", {
      type: "checkbox",
      checked: checked,
      onChange: (e: any) => onCheckedChange?.(e.target.checked),
      className: className,
    }),
}));

vi.mock("lucide-react", () => ({
  AlertTriangle: ({ className }: any) =>
    React.createElement("div", {
      className: `lucide-alert-triangle ${className}`,
    }),
  BookOpen: ({ className }: any) =>
    React.createElement("div", { className: `lucide-book-open ${className}` }),
  Film: ({ className }: any) =>
    React.createElement("div", { className: `lucide-film ${className}` }),
}));

// Import after mocking
import { render, screen, fireEvent } from "@testing-library/react";
import { SelectableMediaItem } from "../SelectableMediaItem";
import type { ParsedMediaItem } from "bookmarked-types";

// Mock data for testing
const mockBookItem: ParsedMediaItem = {
  type: "book",
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  genre: ["Fiction", "Classic", "American Literature"],
  description: "A classic American novel about the Jazz Age",
  confidence: 0.9,
};

const mockMovieItem: ParsedMediaItem = {
  type: "movie",
  title: "Inception",
  director: "Christopher Nolan",
  genre: ["Sci-Fi", "Thriller", "Action"],
  description: "A mind-bending thriller about dreams within dreams",
  confidence: 0.85,
};

const mockBookItemMinimal: ParsedMediaItem = {
  type: "book",
  title: "Simple Book",
  confidence: 0.3,
};

describe("SelectableMediaItem", () => {
  const mockOnSelectionChange = vi.fn();

  beforeEach(() => {
    mockOnSelectionChange.mockClear();
  });

  describe("Component Logic", () => {
    it("should render without crashing with book item", () => {
      expect(() => {
        render(
          <SelectableMediaItem
            item={mockBookItem}
            isSelected={false}
            onSelectionChange={mockOnSelectionChange}
          />
        );
      }).not.toThrow();
    });

    it("should render without crashing with movie item", () => {
      expect(() => {
        render(
          <SelectableMediaItem
            item={mockMovieItem}
            isSelected={false}
            onSelectionChange={mockOnSelectionChange}
          />
        );
      }).not.toThrow();
    });

    it("should render without crashing with minimal data", () => {
      expect(() => {
        render(
          <SelectableMediaItem
            item={mockBookItemMinimal}
            isSelected={false}
            onSelectionChange={mockOnSelectionChange}
          />
        );
      }).not.toThrow();
    });
  });

  describe("Content Display", () => {
    it("should display book title and author", () => {
      render(
        <SelectableMediaItem
          item={mockBookItem}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText("The Great Gatsby")).toBeInTheDocument();
      expect(screen.getByText("by F. Scott Fitzgerald")).toBeInTheDocument();
    });

    it("should display movie title and director", () => {
      render(
        <SelectableMediaItem
          item={mockMovieItem}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText("Inception")).toBeInTheDocument();
      expect(screen.getByText("by Christopher Nolan")).toBeInTheDocument();
    });

    it("should display description when provided", () => {
      render(
        <SelectableMediaItem
          item={mockBookItem}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(
        screen.getByText("A classic American novel about the Jazz Age")
      ).toBeInTheDocument();
    });

    it("should display genres when provided", () => {
      render(
        <SelectableMediaItem
          item={mockBookItem}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText("Fiction")).toBeInTheDocument();
      expect(screen.getByText("Classic")).toBeInTheDocument();
      expect(screen.getByText("American Literature")).toBeInTheDocument();
    });
  });

  describe("Confidence Display", () => {
    it("should display High confidence for scores >= 0.8", () => {
      render(
        <SelectableMediaItem
          item={mockBookItem}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("should display Medium confidence for scores >= 0.6 and < 0.8", () => {
      const mediumConfidenceItem = { ...mockBookItem, confidence: 0.7 };
      render(
        <SelectableMediaItem
          item={mediumConfidenceItem}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText("Medium")).toBeInTheDocument();
    });

    it("should display Low confidence for scores < 0.6", () => {
      render(
        <SelectableMediaItem
          item={mockBookItemMinimal}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText("Low")).toBeInTheDocument();
    });
  });

  describe("Selection Behavior", () => {
    it("should call onSelectionChange when checkbox is clicked", () => {
      render(
        <SelectableMediaItem
          item={mockBookItem}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockOnSelectionChange).toHaveBeenCalledWith(true);
    });

    it("should display checked state when isSelected is true", () => {
      render(
        <SelectableMediaItem
          item={mockBookItem}
          isSelected={true}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("should display unchecked state when isSelected is false", () => {
      render(
        <SelectableMediaItem
          item={mockBookItem}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("Duplicate Warning", () => {
    it("should show duplicate warning when isDuplicate is true", () => {
      render(
        <SelectableMediaItem
          item={mockBookItem}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
          isDuplicate={true}
        />
      );

      expect(
        screen.getByText("This item may already exist in your collection")
      ).toBeInTheDocument();
    });

    it("should not show duplicate warning when isDuplicate is false", () => {
      render(
        <SelectableMediaItem
          item={mockBookItem}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
          isDuplicate={false}
        />
      );

      expect(
        screen.queryByText("This item may already exist in your collection")
      ).not.toBeInTheDocument();
    });
  });

  describe("Genre Display Logic", () => {
    it("should show +N indicator when more than 3 genres", () => {
      const itemWithManyGenres = {
        ...mockBookItem,
        genre: ["Fiction", "Classic", "Drama", "Romance", "Historical"],
      };
      render(
        <SelectableMediaItem
          item={itemWithManyGenres}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText("Fiction")).toBeInTheDocument();
      expect(screen.getByText("Classic")).toBeInTheDocument();
      expect(screen.getByText("Drama")).toBeInTheDocument();
      expect(screen.getByText("+2")).toBeInTheDocument();
      expect(screen.queryByText("Romance")).not.toBeInTheDocument();
      expect(screen.queryByText("Historical")).not.toBeInTheDocument();
    });

    it("should not display genre section when no genres", () => {
      const itemWithoutGenres = { ...mockBookItem, genre: undefined };
      render(
        <SelectableMediaItem
          item={itemWithoutGenres}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      // Should still show confidence but no genre badges
      expect(screen.getByText("High")).toBeInTheDocument();
      expect(screen.queryByText("Fiction")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty title gracefully", () => {
      const itemWithEmptyTitle = { ...mockBookItem, title: "" };
      render(
        <SelectableMediaItem
          item={itemWithEmptyTitle}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      // Should still render the component structure
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should handle confidence score edge values", () => {
      const itemWithZeroConfidence = { ...mockBookItem, confidence: 0 };
      render(
        <SelectableMediaItem
          item={itemWithZeroConfidence}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      expect(screen.getByText("Low")).toBeInTheDocument();
    });

    it("should handle empty genre array", () => {
      const itemWithEmptyGenres = { ...mockBookItem, genre: [] };
      render(
        <SelectableMediaItem
          item={itemWithEmptyGenres}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      // Should not display any genre badges
      expect(screen.queryByText("Fiction")).not.toBeInTheDocument();
      expect(screen.getByText("High")).toBeInTheDocument(); // Confidence should still show
    });
  });

  describe("Accessibility", () => {
    it("should have proper checkbox role", () => {
      render(
        <SelectableMediaItem
          item={mockBookItem}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("should handle keyboard interaction on checkbox", () => {
      render(
        <SelectableMediaItem
          item={mockBookItem}
          isSelected={false}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();
      fireEvent.keyDown(checkbox, { key: " ", code: "Space" });

      expect(mockOnSelectionChange).toHaveBeenCalledWith(true);
    });
  });
});
