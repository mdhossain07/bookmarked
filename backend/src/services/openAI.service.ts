import { config } from "../config/environment";
import OpenAI from "openai";

interface OpenAIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenAIService {
  #openai: OpenAI;
  #model = "gpt-4o";

  constructor() {
    if (!config.openAI.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    this.#openai = new OpenAI({
      apiKey: config.openAI.apiKey,
    });
  }

  /**
   * Generate a creative story based on a prompt
   */
  async generateStory(prompt: string): Promise<OpenAIResponse> {
    try {
      const response = await this.#openai.chat.completions.create({
        model: this.#model,
        messages: [
          {
            role: "system",
            content:
              "You are a creative storyteller. Generate engaging, well-written stories based on the user's prompt.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content || "";

      const result: OpenAIResponse = {
        content,
      };

      if (response.usage) {
        result.usage = {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        };
      }

      return result;
    } catch (error) {
      console.error("OpenAI generateStory error:", error);
      throw new Error("Failed to generate story");
    }
  }

  /**
   * Search for latest updates about books and movies
   */
  async searchBooksAndMovies(prompt: string): Promise<OpenAIResponse> {
    try {
      const systemPrompt = `You are an expert assistant specializing in books and movies.
      Provide helpful, accurate, and engaging information about:
      - Book recommendations and reviews
      - Movie recommendations and reviews
      - Author and director information
      - Genre analysis and comparisons
      - Latest releases and trending content
      - Plot summaries and character analysis

      Always provide well-structured, informative responses that help users discover new content or learn more about books and movies they're interested in.`;

      const response = await this.#openai.chat.completions.create({
        model: this.#model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || "";

      const result: OpenAIResponse = {
        content,
      };

      if (response.usage) {
        result.usage = {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        };
      }

      return result;
    } catch (error) {
      console.error("OpenAI searchBooksAndMovies error:", error);
      throw new Error("Failed to search books and movies");
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use searchBooksAndMovies instead
   */
  async getLatestUpdate(prompt: string): Promise<OpenAIResponse> {
    return this.searchBooksAndMovies(prompt);
  }
}

export const openaiService = new OpenAIService();
