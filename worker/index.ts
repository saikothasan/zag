import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToCoreMessages } from "ai";
import { z } from "zod";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Only handle the /api/chat endpoint
    if (url.pathname === "/api/chat" && request.method === "POST") {
      const { messages } = await request.json() as { messages: any[] };

      // Configure Cloudflare AI Gateway / Workers AI
      const openai = createOpenAI({
        apiKey: "unused", 
        baseURL: "https://api.cloudflare.com/client/v4/accounts/unused/ai/v1", // Replace 'unused' with actual ID if using Gateway
        fetch: async (_url, options) => {
            // Bridge Vercel SDK to Cloudflare Workers AI Binding
            const body = JSON.parse(options?.body as string);
            
            // We'll use Llama 3 for the chat
            const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
                messages: body.messages,
                tools: body.tools, // Pass tools if the model supports them
                stream: true,
            });

            return new Response(response as any, {
                headers: { "content-type": "text/event-stream" }
            });
        }
      });

      // Stream the text response
      const result = await streamText({
        model: openai("llama-3-8b"),
        messages: convertToCoreMessages(messages),
        system: "You are a helpful AI assistant built with Cloudflare Workers and AI Elements.",
        // Example tool definition
        tools: {
          getWeather: {
            description: "Get the weather for a location",
            parameters: z.object({
              location: z.string().describe("The city and state"),
            }),
            execute: async ({ location }) => {
              return { temp: 72, condition: "Sunny", location };
            },
          },
        },
      });

      return result.toDataStreamResponse();
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
