/**
 * DeepSeek AI client — OpenAI-compatible API.
 *
 * DeepSeek V3: $0.27/1M input, $1.10/1M output tokens.
 * Base URL: https://api.deepseek.com/v1
 *
 * For batch processing, use DeepSeek's batch API for 50% discount.
 */

import OpenAI from "openai";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-placeholder",
  baseURL: DEEPSEEK_BASE_URL,
});

export const DEEPSEEK_MODEL = "deepseek-chat"; // DeepSeek V3

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chat(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }
): Promise<string> {
  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2000,
    stream: false,
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function chatStream(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
) {
  return deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2000,
    stream: true,
  });
}

/**
 * Generate structured JSON output from DeepSeek.
 * DeepSeek supports JSON mode natively.
 */
export async function chatJSON<T>(
  messages: ChatMessage[],
  options?: { temperature?: number }
): Promise<T> {
  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages: [
      ...messages,
      {
        role: "system",
        content: "You MUST respond with valid JSON only. No other text.",
      },
    ],
    temperature: options?.temperature ?? 0.3,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(text) as T;
}

export default deepseek;
