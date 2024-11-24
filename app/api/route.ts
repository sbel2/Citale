import { HfInference } from '@huggingface/inference'
import { HuggingFaceStream, StreamingTextResponse } from 'ai'
import { experimental_buildOpenAssistantPrompt } from 'ai/prompts'

// Create a new HuggingFace Inference instance
const Hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY)
console.log(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY)
// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

function buildPrompt(
  messages: { content: string; role: 'system' | 'user' | 'assistant' }[]
) {
  return (
    messages
      .map(({ content, role }) => {
        if (role === 'user') {
          return `<|prompter|>${content}<|endoftext|>`
        } else {
          return `<|assistant|>${content}<|endoftext|>`
        }
      })
      .join('') + '<|assistant|>'
  )
}

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  let { messages } = await req.json()

  const promptEngineering = "Act as a top social media manager. You are an expert on growing the social media accounts of people. If someone asks you something totally unrelated to social media, you will respond with a generic text saying you are only trained to respond to social media-related queries. But if it touches social media, then you should respond. The message is this: "

  messages = messages.map((message: { content: string; role: 'system' | 'user' | 'assistant' }) => {
    if (message.role === 'user') {
      return { ...message, content: `${promptEngineering} ${message.content}` };
    } else {
      return message;
    }
  });

  try {
    const response = Hf.textGenerationStream({
      model: 'gpt2',
      inputs: buildPrompt(messages),
      parameters: {
        max_new_tokens: 200,
        typical_p: 0.2,
        repetition_penalty: 1,
        truncate: 1000,
        return_full_text: false,
      },
    });
  
    const stream = HuggingFaceStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error with Hugging Face API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}