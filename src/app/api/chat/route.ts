import { CoreMessage, generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const { response } = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: 'You are a helpful assistant.',
    messages,
  });


  return Response.json({ messages: response.messages });
}