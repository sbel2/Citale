import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

const aiModel = createOpenAI({
  name: 'perplexity',
  apiKey: process.env.PERPLEXITY_API_KEY ?? '',
  baseURL: 'https://api.perplexity.ai/',
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid input: Messages must be a non-empty array.' }, { status: 400 });
    }

    // Generate text using the configured AI model
    const textResponse = await generateText({
      model: aiModel('llama-3.1-sonar-large-128k-online'),
      messages: [
        {
          role: "system",
          content: "You are an friendly and upbeat AI assistant specializing in exclusively Boston recommendations for things to do on the weekend, providing inspiration about coffee shops, restaurants, seasonal events and markets, and activities in the greater Boston area. Please show me 5 options, each with a brief description along with the address, no links needed. All responses should be things based in Boston with physical addresses and is current to the season. Only give me recommendations when prompted for it, otherwise, please just chat with me. Like, if I say hi or hello or any greeting, just say hi back. For unexpected requests or inputs, please respond with a short concise reply and divert the person back to the topic of recommendations."
        },
        ...messages
      ]
    });

    return NextResponse.json({ generatedText: textResponse.text });
  } catch (error) {
    console.error('Error generating text:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
