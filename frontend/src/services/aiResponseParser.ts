/**
 * AI Response Parser Service
 *
 * Extracts book and movie information from AI-generated text responses.
 * Provides confidence scoring and handles various text formats.
 */

export interface ParsedMediaItem {
  type: "book" | "movie";
  title: string;
  author?: string;
  director?: string;
  genre?: string[];
  description?: string;
  confidence: number; // 0-1 score for extraction confidence
}

export interface ParsedResponse {
  books: ParsedMediaItem[];
  movies: ParsedMediaItem[];
  hasBooks: boolean;
  hasMovies: boolean;
}

export class AIResponseParser {
  // Common patterns for identifying books and movies
  private static readonly BOOK_INDICATORS = [
    "book",
    "novel",
    "author",
    "written by",
    "by ",
    "read",
    "reading",
    "literature",
    "fiction",
    "non-fiction",
    "memoir",
    "biography",
    "published",
    "bestseller",
    "page-turner",
  ];

  private static readonly MOVIE_INDICATORS = [
    "movie",
    "film",
    "directed by",
    "director",
    "watch",
    "watching",
    "cinema",
    "screenplay",
    "starring",
    "cast",
    "released",
    "blockbuster",
    "documentary",
    "thriller",
    "comedy",
    "drama",
  ];

  // Genre patterns
  private static readonly GENRE_PATTERNS = [
    "science fiction",
    "sci-fi",
    "fantasy",
    "mystery",
    "thriller",
    "romance",
    "horror",
    "comedy",
    "drama",
    "action",
    "adventure",
    "biography",
    "memoir",
    "non-fiction",
    "fiction",
    "historical",
    "contemporary",
    "young adult",
    "ya",
    "children",
    "self-help",
    "business",
    "philosophy",
    "psychology",
    "true crime",
    "documentary",
    "animated",
    "musical",
  ];

  /**
   * Main parsing method that analyzes AI response content
   */
  static parseResponse(content: string): ParsedResponse {
    if (!content || content.trim().length === 0) {
      return {
        books: [],
        movies: [],
        hasBooks: false,
        hasMovies: false,
      };
    }

    const books = this.extractBooks(content);
    const movies = this.extractMovies(content);

    return {
      books,
      movies,
      hasBooks: books.length > 0,
      hasMovies: movies.length > 0,
    };
  }

  /**
   * Extract book information from text content
   */
  private static extractBooks(content: string): ParsedMediaItem[] {
    const books: ParsedMediaItem[] = [];
    const processedTitles = new Set<string>();

    // Pattern 1: Structured lists with bullets or numbers
    const listMatches = this.extractFromLists(content, "book");
    listMatches.forEach((item) => {
      const normalizedTitle = this.normalizeTitle(item.title);
      if (!processedTitles.has(normalizedTitle)) {
        books.push(item);
        processedTitles.add(normalizedTitle);
      }
    });

    // Pattern 2: Quoted titles with "by" author pattern
    const quotedPattern =
      /"([^"]+)"\s+by\s+([^,.\n!?]+?)(?=\s*(?:and|,|\.|$|\n))/gi;
    let match;
    while ((match = quotedPattern.exec(content)) !== null) {
      const title = this.cleanTitle(match[1]);
      const author = this.cleanAuthorDirector(match[2]);
      const normalizedTitle = this.normalizeTitle(title);

      if (title && author && !processedTitles.has(normalizedTitle)) {
        const confidence = this.calculateBookConfidence(content, title, author);
        books.push({
          type: "book",
          title,
          author,
          genre: this.extractGenres(
            content.substring(
              Math.max(0, match.index - 50),
              match.index + match[0].length + 50
            )
          ),
          confidence,
        });
        processedTitles.add(normalizedTitle);
      }
    }

    // Pattern 3: Title by Author pattern (without quotes)
    const titleByPattern =
      /(?:^|\n|\.)\s*([A-Z][A-Za-z\s':-]{2,50}?)\s+by\s+([A-Z][A-Za-z\s.'-]{2,50}?)(?=\s*(?:and|,|\.|$|\n))/gm;
    while ((match = titleByPattern.exec(content)) !== null) {
      const title = this.cleanTitle(match[1]);
      const author = this.cleanAuthorDirector(match[2]);
      const normalizedTitle = this.normalizeTitle(title);

      if (title && author && !processedTitles.has(normalizedTitle)) {
        const confidence = this.calculateBookConfidence(content, title, author);
        if (confidence > 0.3) {
          books.push({
            type: "book",
            title,
            author,
            genre: this.extractGenres(
              content.substring(
                Math.max(0, match.index - 50),
                match.index + match[0].length + 50
              )
            ),
            confidence,
          });
          processedTitles.add(normalizedTitle);
        }
      }
    }

    // Pattern 4: Books mentioned in context - only quoted titles
    const contextPattern =
      /(?:book|novel|read|reading)\s+(?:called\s+|titled\s+)?["']([^"'\n,]{3,50})["']/gi;
    while ((match = contextPattern.exec(content)) !== null) {
      const title = this.cleanTitle(match[1]);
      const normalizedTitle = this.normalizeTitle(title);

      if (title && !processedTitles.has(normalizedTitle)) {
        const confidence = this.calculateBookConfidence(content, title);
        if (confidence > 0.5) {
          books.push({
            type: "book",
            title,
            genre: this.extractGenres(
              content.substring(
                Math.max(0, match.index - 50),
                match.index + match[0].length + 50
              )
            ),
            confidence,
          });
          processedTitles.add(normalizedTitle);
        }
      }
    }

    return books.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Extract movie information from text content
   */
  private static extractMovies(content: string): ParsedMediaItem[] {
    const movies: ParsedMediaItem[] = [];
    const processedTitles = new Set<string>();

    // Pattern 1: Structured lists
    const listMatches = this.extractFromLists(content, "movie");
    listMatches.forEach((item) => {
      const normalizedTitle = this.normalizeTitle(item.title);
      if (!processedTitles.has(normalizedTitle)) {
        movies.push(item);
        processedTitles.add(normalizedTitle);
      }
    });

    // Pattern 2: "Title" directed by Director
    const directedByPattern =
      /"([^"]+)"\s+directed\s+by\s+([^,.\n!?]+?)(?=\s*(?:and|,|\.|$|\n))/gi;
    let match;
    while ((match = directedByPattern.exec(content)) !== null) {
      const title = this.cleanTitle(match[1]);
      const director = this.cleanAuthorDirector(match[2]);
      const normalizedTitle = this.normalizeTitle(title);

      if (title && director && !processedTitles.has(normalizedTitle)) {
        const confidence = this.calculateMovieConfidence(
          content,
          title,
          director
        );
        movies.push({
          type: "movie",
          title,
          director,
          genre: this.extractGenres(
            content.substring(
              Math.max(0, match.index - 50),
              match.index + match[0].length + 50
            )
          ),
          confidence,
        });
        processedTitles.add(normalizedTitle);
      }
    }

    // Pattern 3: Movies mentioned in context - only quoted titles
    const movieContextPattern =
      /(?:movie|film|watch|watching)\s+(?:called\s+|titled\s+)?["']([^"'\n,]{3,50})["']/gi;
    while ((match = movieContextPattern.exec(content)) !== null) {
      const title = this.cleanTitle(match[1]);
      const normalizedTitle = this.normalizeTitle(title);

      if (title && !processedTitles.has(normalizedTitle)) {
        const confidence = this.calculateMovieConfidence(content, title);
        if (confidence > 0.5) {
          movies.push({
            type: "movie",
            title,
            genre: this.extractGenres(
              content.substring(
                Math.max(0, match.index - 50),
                match.index + match[0].length + 50
              )
            ),
            confidence,
          });
          processedTitles.add(normalizedTitle);
        }
      }
    }

    // Pattern 4: Director's films
    const directorFilmPattern =
      /([A-Z][A-Za-z\s.']{2,30})'s\s+(?:film|movie)\s+["']([^"'\n,]{3,50})["']/gi;
    while ((match = directorFilmPattern.exec(content)) !== null) {
      const director = this.cleanAuthorDirector(match[1]);
      const title = this.cleanTitle(match[2]);
      const normalizedTitle = this.normalizeTitle(title);

      if (title && director && !processedTitles.has(normalizedTitle)) {
        const confidence = this.calculateMovieConfidence(
          content,
          title,
          director
        );
        if (confidence > 0.3) {
          movies.push({
            type: "movie",
            title,
            director,
            genre: this.extractGenres(
              content.substring(
                Math.max(0, match.index - 50),
                match.index + match[0].length + 50
              )
            ),
            confidence,
          });
          processedTitles.add(normalizedTitle);
        }
      }
    }

    return movies.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Extract items from structured lists (bullets, numbers)
   */
  private static extractFromLists(
    content: string,
    type: "book" | "movie"
  ): ParsedMediaItem[] {
    const items: ParsedMediaItem[] = [];
    const indicators =
      type === "book" ? this.BOOK_INDICATORS : this.MOVIE_INDICATORS;

    // Match list items (bullets, numbers, dashes)
    const listPattern = /(?:^|\n)\s*(?:[-*•]|\d+\.)\s*(.+?)(?=\n|$)/gm;
    let match;

    while ((match = listPattern.exec(content)) !== null) {
      const listItem = match[1].trim();

      // Check if this list item contains indicators for the media type
      const hasIndicators = indicators.some((indicator) =>
        listItem.toLowerCase().includes(indicator.toLowerCase())
      );

      if (hasIndicators) {
        const parsed = this.parseListItem(listItem, type);
        if (parsed) {
          items.push(parsed);
        }
      }
    }

    return items;
  }

  /**
   * Parse individual list item to extract title and author/director
   */
  private static parseListItem(
    item: string,
    type: "book" | "movie"
  ): ParsedMediaItem | null {
    // Remove common prefixes
    let cleanItem = item.replace(/^(?:read|watch|check out|try)\s+/i, "");

    // Pattern: "Title" by Author/Director
    let match = cleanItem.match(/"([^"]+)"\s+by\s+([^,\n]+)/i);
    if (match) {
      const title = this.cleanTitle(match[1]);
      const authorDirector = this.cleanAuthorDirector(match[2]);
      if (title) {
        return {
          type,
          title,
          ...(type === "book"
            ? { author: authorDirector }
            : { director: authorDirector }),
          genre: this.extractGenres(item),
          confidence: 0.8,
        };
      }
    }

    // Pattern: "Title" directed by Director (for movies)
    if (type === "movie") {
      match = cleanItem.match(/"([^"]+)"\s+directed\s+by\s+([^,\n]+)/i);
      if (match) {
        const title = this.cleanTitle(match[1]);
        const director = this.cleanAuthorDirector(match[2]);
        if (title) {
          return {
            type,
            title,
            director,
            genre: this.extractGenres(item),
            confidence: 0.8,
          };
        }
      }
    }

    // Pattern: Title by Author/Director (no quotes)
    match = cleanItem.match(/^([^,\n-]+?)\s+by\s+([^,\n]+)/i);
    if (match) {
      const title = this.cleanTitle(match[1]);
      const authorDirector = this.cleanAuthorDirector(match[2]);
      if (title && authorDirector) {
        return {
          type,
          title,
          ...(type === "book"
            ? { author: authorDirector }
            : { director: authorDirector }),
          genre: this.extractGenres(item),
          confidence: 0.7,
        };
      }
    }

    // Pattern: Title directed by Director (no quotes, for movies)
    if (type === "movie") {
      match = cleanItem.match(/^([^,\n-]+?)\s+directed\s+by\s+([^,\n]+)/i);
      if (match) {
        const title = this.cleanTitle(match[1]);
        const director = this.cleanAuthorDirector(match[2]);
        if (title && director) {
          return {
            type,
            title,
            director,
            genre: this.extractGenres(item),
            confidence: 0.7,
          };
        }
      }
    }

    // Pattern: Just title with context
    match = cleanItem.match(/^([^,\n-]{3,50})/);
    if (match) {
      const title = this.cleanTitle(match[1]);
      if (title && title.length > 2) {
        const confidence =
          type === "book"
            ? this.calculateBookConfidence(item, title)
            : this.calculateMovieConfidence(item, title);

        if (confidence > 0.5) {
          return {
            type,
            title,
            genre: this.extractGenres(item),
            confidence,
          };
        }
      }
    }

    return null;
  }

  /**
   * Calculate confidence score for book extraction
   */
  private static calculateBookConfidence(
    context: string,
    title: string,
    author?: string
  ): number {
    let confidence = 0.3; // Base confidence

    const lowerContext = context.toLowerCase();

    // Boost confidence based on book indicators
    this.BOOK_INDICATORS.forEach((indicator) => {
      if (lowerContext.includes(indicator)) {
        confidence += 0.1;
      }
    });

    // Author presence boosts confidence
    if (author && author.length > 2) {
      confidence += 0.2;
    }

    // Title characteristics
    if (title.length > 5 && title.length < 100) {
      confidence += 0.1;
    }

    // Quoted titles are more likely to be actual titles
    if (context.includes(`"${title}"`)) {
      confidence += 0.2;
    }

    // Penalize very short or very long titles
    if (title.length < 3 || title.length > 80) {
      confidence -= 0.3;
    }

    // Penalize titles that look like sentences
    if (title.split(" ").length > 8) {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate confidence score for movie extraction
   */
  private static calculateMovieConfidence(
    context: string,
    title: string,
    director?: string
  ): number {
    let confidence = 0.3; // Base confidence

    const lowerContext = context.toLowerCase();

    // Boost confidence based on movie indicators
    this.MOVIE_INDICATORS.forEach((indicator) => {
      if (lowerContext.includes(indicator)) {
        confidence += 0.1;
      }
    });

    // Director presence boosts confidence
    if (director && director.length > 2) {
      confidence += 0.2;
    }

    // Title characteristics
    if (title.length > 3 && title.length < 80) {
      confidence += 0.1;
    }

    // Quoted titles are more likely to be actual titles
    if (context.includes(`"${title}"`)) {
      confidence += 0.2;
    }

    // Penalize very short or very long titles
    if (title.length < 2 || title.length > 60) {
      confidence -= 0.3;
    }

    // Penalize titles that look like sentences
    if (title.split(" ").length > 6) {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Extract genres from text context
   */
  private static extractGenres(text: string): string[] {
    const genres: string[] = [];
    const lowerText = text.toLowerCase();

    this.GENRE_PATTERNS.forEach((genre) => {
      if (lowerText.includes(genre.toLowerCase())) {
        // Capitalize first letter of each word
        const capitalizedGenre = genre
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        if (!genres.includes(capitalizedGenre)) {
          genres.push(capitalizedGenre);
        }
      }
    });

    return genres;
  }

  /**
   * Clean and normalize title text
   */
  private static cleanTitle(title: string): string {
    if (!title) return "";

    return title
      .trim()
      .replace(/^["']|["']$/g, "") // Remove surrounding quotes
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  /**
   * Clean author/director names
   */
  private static cleanAuthorDirector(name: string): string {
    if (!name) return "";

    return name
      .trim()
      .replace(/^["']|["']$/g, "") // Remove surrounding quotes
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  /**
   * Normalize title for duplicate detection
   */
  private static normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove all punctuation
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }
}
