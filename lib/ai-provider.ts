/**
 * AI provider used by the Study Coach.
 * Uses OpenAI when OPENAI_API_KEY is set, otherwise the mock provider.
 */
import { mockAiProvider } from "@/lib/mock-ai";
import { OpenAiProvider, isOpenAiConfigured } from "@/lib/openai-provider";

export const aiProvider = isOpenAiConfigured() ? new OpenAiProvider() : mockAiProvider;
export { isOpenAiConfigured } from "@/lib/openai-provider";
