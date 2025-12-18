import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { openaiService } from "../services/openAI.service.js";
import { ApiResponse, HttpStatus } from "bookmarked-types";

class OpenAIController {
  generateStory = asyncHandler(async (req: Request, res: Response) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      const response: ApiResponse = {
        success: false,
        message: "Prompt is required and must be a string",
        timestamp: new Date().toISOString(),
      };
      return res.status(HttpStatus.BAD_REQUEST).json(response);
    }

    const aiResponse = await openaiService.generateStory(prompt);

    const response: ApiResponse = {
      success: true,
      message: "Story generated successfully",
      data: aiResponse,
      timestamp: new Date().toISOString(),
    };

    return res.status(HttpStatus.OK).json(response);
  });

  searchBooksAndMovies = asyncHandler(async (req: Request, res: Response) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      const response: ApiResponse = {
        success: false,
        message: "Search prompt is required and must be a string",
        timestamp: new Date().toISOString(),
      };
      return res.status(HttpStatus.BAD_REQUEST).json(response);
    }

    const aiResponse = await openaiService.searchBooksAndMovies(prompt);

    const response: ApiResponse = {
      success: true,
      message: "Search completed successfully",
      data: aiResponse,
      timestamp: new Date().toISOString(),
    };

    return res.status(HttpStatus.OK).json(response);
  });

  // Legacy endpoint for backward compatibility
  getLatestUpdate = asyncHandler(async (req: Request, res: Response) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      const response: ApiResponse = {
        success: false,
        message: "Prompt is required and must be a string",
        timestamp: new Date().toISOString(),
      };
      return res.status(HttpStatus.BAD_REQUEST).json(response);
    }

    const aiResponse = await openaiService.getLatestUpdate(prompt);

    const response: ApiResponse = {
      success: true,
      message: "Latest update retrieved successfully",
      data: aiResponse,
      timestamp: new Date().toISOString(),
    };

    return res.status(HttpStatus.OK).json(response);
  });
}

export const openaiController = new OpenAIController();
