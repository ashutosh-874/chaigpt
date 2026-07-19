import { tavily } from "@tavily/core";
import { tool } from "ai";
import { z } from "zod";

const client = tavily({ apiKey: process.env.TAVILY_API_KEY });

/** Searches the web via Tavily; the model decides when to call this. */
export const webSearchTool = tool({
    description:
        "Search the web for current information, news, facts, or anything the model doesn't already know or needs to verify.",
    inputSchema: z.object({
        query: z.string().describe("The search query"),
    }),
    execute: async ({ query }) => {
        if (!process.env.TAVILY_API_KEY) {
            throw new Error("Web search is not configured (missing TAVILY_API_KEY).");
        }

        const response = await client.search(query, {
            searchDepth: "basic",
            maxResults: 5,
            includeAnswer: false,
        });

        return {
            query: response.query,
            results: response.results.map((result) => ({
                title: result.title,
                url: result.url,
                content: result.content,
                publishedDate: result.publishedDate,
            })),
        };
    },
});
