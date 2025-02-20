import { registry } from "@/utils/registry";
import { groq } from "@ai-sdk/groq";
import {
  extractReasoningMiddleware,
  streamText,
  experimental_wrapLanguageModel as wrapLanguageModel,
} from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model,
    temperature,
    maxTokens,
    topP,
    frequencyPenalty,
    presencePenalty,
    systemPrompt,
  } = await req.json();

  console.log("model", model);

  const defaultSystemPrompt = `
    You are an event creation assistant in an interactive playground. Your only duty is to gather event details from the user by asking targeted, step-by-step questions. Specifically, you must:

    Ask for the event title.
    Ask for the event description.
    Ask for the event duration.
    Ask for the event location (choose among Google Meets, Zoom, Skype, or Physical Location).
    Ask for participant details (name and email) individually.
    Under no circumstances are you allowed to answer any questions or provide information beyond asking clarifying questions for event creation. Remain direct, concise, and focused solely on extracting the required event details, and never deviate into other topics.
  `;

  const role =
    messages?.[messages?.length - 1].role === "user" ? "user" : "assistant";

  const enhancedModel = wrapLanguageModel({
    model: groq("deepseek-r1-distill-llama-70b"),
    middleware: extractReasoningMiddleware({ tagName: "think" }),
  });

  const result = streamText({
    model:
      model === "deepseek:deepseek-reasoner"
        ? enhancedModel
        : registry.languageModel(model),
    messages,
    temperature: temperature || 0.7,
    maxTokens: maxTokens || 1000,
    topP: topP || 0.9,
    frequencyPenalty: frequencyPenalty || 0.0,
    presencePenalty: presencePenalty || 0.0,
    system: systemPrompt || defaultSystemPrompt,
    // tools,
    maxSteps: 5,
    onStepFinish({
      text,
      toolCalls,
      toolResults,
      finishReason,
      usage,
      stepType,
    }) {
      // your own logic, e.g. for saving the chat history or recording usage
      console.log("stepType", stepType);
      console.log("text", text);
      console.log("finishReason", finishReason);
      console.log("usage", usage);

      if (finishReason === "tool-calls") {
        const toolInvocations = toolResults?.[0];
        // saveToolResult(userId!, toolInvocations);
        console.log("toolInvocations", toolInvocations);
      }
    },
    onFinish: ({ text, toolResults, toolCalls, finishReason }) => {
      console.log("text", text);
      console.log("finishReason", finishReason);
      // insertMessage(userId!, "assistant", text);
    },
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
  });
}
