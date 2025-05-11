

import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Define proper types for the Together.ai API response
interface TogetherAIResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason: string;
  }[];
  id: string;
  object: string;
  created: number;
  model: string;
}

type Bindings = {
  TOGETHER_API_KEY: string; // For Together.ai API
  AI: any; // Keeping the AI type for other functions
}

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '/*',
  cors({
    origin: '*',
    allowHeaders: ['X-Custum-Header', 'Upgrade-Insecure-Requests', 'Content-Type'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  })
);

app.post('/chatToDocument', async (c) => {
  const { documentData, question } = await c.req.json();

  // Better handling of document data
  const documentText = typeof documentData === 'string'
    ? documentData
    : JSON.stringify(documentData);

  try {
    // Together.ai API endpoint
    const togetherEndpoint = 'https://api.together.xyz/v1/chat/completions';
    
    // Make request to Together.ai API
    const response = await fetch(togetherEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // Free model on Together.ai
        messages: [
          {
            role: 'system',
            content: 'You are an assistant helping the user to chat with a document. Answer the user\'s question based on the document content provided.',
          },
          {
            role: 'user',
            content: `Document content: ${documentText}\n\nQuestion: ${question}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Together.ai API error:', errorData);
      return c.json({ message: 'Error processing your request with the AI model' }, 500);
    }

    // Properly cast the response to the correct type and handle potential undefined values
    const responseData = await response.json() as TogetherAIResponse;
    const message = responseData?.choices?.[0]?.message?.content || 
                    'Sorry, I couldn\'t generate a response for your question.';

    return c.json({ message });
  } catch (error) {
    console.error('Error in chatToDocument:', error);
    return c.json({ 
      message: 'An error occurred while processing your request. Please try again later.'
    }, 500);
  }
});
app.post('/translateDocument', async (c) => {
	const { documentData, targetLang } = await c.req.json();

	//Generate the summary of the document
	const summaryResponse = await c.env.AI.run('@cf/facebook/bart-large-cnn', {
		input_text: documentData,
		max_length: 1000,
	});

	//translate the summary into another language
	const response = await c.env.AI.run('@cf/meta/m2m100-1.2b', {
		text: summaryResponse.summary,
		source_lang: 'english',
		target_lang: targetLang,
	})

	return new Response(JSON.stringify(response));
})

export default app;
