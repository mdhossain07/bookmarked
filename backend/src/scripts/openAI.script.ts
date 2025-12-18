import { config } from "../config/environment.js";

import OpenAI from "openai";
const client = new OpenAI({
  apiKey: config.openAI.apiKey,
});

const generateStory = async () => {
  const response = await client.responses.create({
    model: "gpt-4o",
    input: "Write a 100 word story about a cow",
  });

  console.log(response);
};

generateStory();
