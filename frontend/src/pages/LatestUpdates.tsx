import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MainLayout } from "@/components/layout/MainLayout";
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
import { useOpenAISearch } from "@/hooks/useOpenAI";
import type { OpenAISearchResponse } from "@/services/openaiService";

// Search form validation schema
const SearchSchema = z.object({
  prompt: z
    .string()
    .min(3, "Search query must be at least 3 characters")
    .max(500, "Search query cannot exceed 500 characters")
    .trim(),
});

type SearchFormData = z.infer<typeof SearchSchema>;

const LatestUpdates = () => {
  const [searchResult, setSearchResult] = useState<OpenAISearchResponse | null>(
    null
  );
  const { toast } = useToast();

  const searchMutation = useOpenAISearch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SearchFormData>({
    resolver: zodResolver(SearchSchema),
  });

  const onSubmit = async (data: SearchFormData) => {
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
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Latest Updates
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">
              Discover new books and movies with AI-powered search and
              recommendations.
            </p>
          </div>
        </div>

        {/* Search Interface */}
        <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  What would you like to know about books or movies?
                </label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., 'Recommend some sci-fi books like Dune' or 'What are the best movies from 2023?' or 'Tell me about Christopher Nolan's filmography'"
                  className="min-h-[120px] resize-none border-2 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-200 text-base"
                  {...register("prompt")}
                  disabled={searchMutation.isPending}
                />
                {errors.prompt && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    {errors.prompt.message}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={searchMutation.isPending}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-2.5 transition-all duration-200 transform hover:scale-105"
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
                    className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
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
          <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                AI Search Results
              </CardTitle>
              {searchResult.usage && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-white/80 dark:bg-gray-800/80"
                  >
                    Total Tokens: {searchResult.usage.total_tokens}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-green-200 dark:border-green-800"
                  >
                    Response: {searchResult.usage.completion_tokens}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-200 dark:border-blue-800"
                  >
                    Prompt: {searchResult.usage.prompt_tokens}
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-6 border border-green-200/50 dark:border-green-800/50">
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    {searchResult.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {searchMutation.error && (
          <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xl">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <AlertCircle className="h-5 w-5" />
                </div>
                Search Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-red-200/50 dark:border-red-800/50">
                <p className="text-red-600 dark:text-red-400 text-base">
                  {searchMutation.error.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Example Queries */}
        <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Film className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                  <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Books
                  </h4>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-green-200/50 dark:border-green-800/50">
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      "Best fantasy books like Lord of the Rings"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      "Recent mystery novels with strong female protagonists"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      "Non-fiction books about productivity and habits"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      "What should I read if I loved The Seven Husbands of
                      Evelyn Hugo?"
                    </li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Movies
                  </h4>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-purple-200/50 dark:border-purple-800/50">
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      "Action movies similar to John Wick"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      "Best animated films from Studio Ghibli"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      "Critically acclaimed movies from 2023"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      "Tell me about Christopher Nolan's filmography"
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default LatestUpdates;
