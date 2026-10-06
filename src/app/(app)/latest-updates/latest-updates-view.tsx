"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  Sparkles,
  BookOpen,
  Film,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/media/PageHeader";
import { useAISearch } from "@/hooks/use-ai-search";
import { AISearchSchema, type AISearchRequest, type AISearchResult } from "@/shared";

export function LatestUpdatesView() {
  const [searchResult, setSearchResult] = useState<AISearchResult | null>(
    null
  );
  const { toast } = useToast();

  const searchMutation = useAISearch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AISearchRequest>({
    resolver: zodResolver(AISearchSchema),
  });

  const onSubmit = async (data: AISearchRequest) => {
    try {
      const result = await searchMutation.mutateAsync(data);
      setSearchResult(result);

      toast({
        title: "Search completed!",
        description: "Found some great recommendations for you.",
      });
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "Failed to search. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearResults = () => {
    setSearchResult(null);
    searchMutation.reset();
    reset();
  };

  return (
    <div className="space-y-6">
        <PageHeader
          title="Latest Updates"
          description="Ask about books and movies, and get recommendations from AI."
        />

        {/* Search Interface */}
        <Card className="w-full shadow-lg border-0 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brass/10">
                <Sparkles className="h-5 w-5 text-brass-text" />
              </div>
              AI-Powered Search
            </CardTitle>
            <CardDescription className="text-base">
              Ask about books, movies, authors, directors, genres, or get
              personalized recommendations powered by advanced AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="prompt"
                  className="text-sm font-semibold text-muted-foreground flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  What would you like to know about books or movies?
                </label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., 'Recommend some sci-fi books like Dune' or 'What are the best movies from 2023?' or 'Tell me about Christopher Nolan's filmography'"
                  className="min-h-[120px] resize-none transition-colors duration-200 text-base"
                  {...register("prompt")}
                  disabled={searchMutation.isPending}
                />
                {errors.prompt && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    {errors.prompt.message}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={searchMutation.isPending}
                  className="flex items-center gap-2 font-medium px-6 py-2.5"
                  size="lg"
                >
                  {searchMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {searchMutation.isPending ? "Searching..." : "Search with AI"}
                </Button>

                {(searchResult || searchMutation.error) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearResults}
                    disabled={searchMutation.isPending}
                    className="border-2 hover:bg-accent transition-colors duration-200"
                    size="lg"
                  >
                    Clear Results
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResult && (
          <Card className="w-full shadow-card animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-books/10">
                  <BookOpen className="h-5 w-5 text-books" />
                </div>
                AI Search Results
              </CardTitle>
              {searchResult.usage && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge
                    variant="secondary"
                    className="text-sm bg-card/80"
                  >
                    Total Tokens: {searchResult.usage.total_tokens}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-sm"
                  >
                    Response: {searchResult.usage.completion_tokens}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-sm"
                  >
                    Prompt: {searchResult.usage.prompt_tokens}
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-background p-6 border">
                <div className="max-w-none">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed text-base">
                    {searchResult.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {searchMutation.error && (
          <Card className="w-full border-destructive/30 shadow-card animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertCircle className="h-5 w-5" />
                </div>
                Search Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-destructive text-base">
                  {searchMutation.error.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Example Queries */}
        <Card className="w-full shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted">
                <Film className="h-5 w-5 text-muted-foreground" />
              </div>
              Example Queries
            </CardTitle>
            <CardDescription className="text-base">
              Try these sample searches to get started with AI-powered
              recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-books" />
                  <h4 className="font-semibold text-foreground">
                    Books
                  </h4>
                </div>
                <div className="rounded-lg bg-background p-4 border">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-books mt-1">•</span>
                      "Best fantasy books like Lord of the Rings"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-books mt-1">•</span>
                      "Recent mystery novels with strong female protagonists"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-books mt-1">•</span>
                      "Non-fiction books about productivity and habits"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-books mt-1">•</span>
                      "What should I read if I loved The Seven Husbands of
                      Evelyn Hugo?"
                    </li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-movies" />
                  <h4 className="font-semibold text-foreground">
                    Movies
                  </h4>
                </div>
                <div className="rounded-lg bg-background p-4 border">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-movies mt-1">•</span>
                      "Action movies similar to John Wick"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-movies mt-1">•</span>
                      "Best animated films from Studio Ghibli"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-movies mt-1">•</span>
                      "Critically acclaimed movies from 2023"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-movies mt-1">•</span>
                      "Tell me about Christopher Nolan's filmography"
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
