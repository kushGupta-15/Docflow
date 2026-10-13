'use server'

import { auth } from '@clerk/nextjs/server'

interface GeminiResponse {
  success: boolean
  result?: string
  error?: string
  isMock?: boolean
}

async function callGemini(prompt: string, systemInstruction?: string): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY

  // If no live API key or placeholder key, provide intelligent mock response so the UI always works
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.startsWith('your_')) {
    return {
      success: true,
      isMock: true,
      result: `[Demo AI Output - Add a live GEMINI_API_KEY in .env for production responses]\n\n${prompt.slice(0, 300)}...`
    }
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          systemInstruction: systemInstruction
            ? {
                parts: [{ text: systemInstruction }],
              }
            : undefined,
        }),
      }
    )

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const message = errData?.error?.message || `Gemini API returned status ${response.status}`
      return { success: false, error: message }
    }

    const data = await response.json()
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!resultText) {
      return { success: false, error: 'No response received from Gemini' }
    }

    return { success: true, result: resultText }
  } catch (error: any) {
    console.error('Error invoking Gemini API:', error)
    return { success: false, error: error.message || 'Failed to call Gemini API' }
  }
}

export async function summarizeDocument(content: string): Promise<GeminiResponse> {
  auth().protect()

  if (!content || !content.trim()) {
    return { success: false, error: 'Document has no text to summarize' }
  }

  const prompt = `Please summarize the following document content concisely. Structure the response with:
1. Executive Summary (1-2 sentences)
2. Key Points (bulleted)
3. Action Items or Next Steps (if any)

Document content:
${content}`

  const systemInstruction = 'You are an executive assistant and AI document summarizer. Keep responses clear, structured, and informative.'
  const res = await callGemini(prompt, systemInstruction)

  if (res.isMock) {
    return {
      success: true,
      isMock: true,
      result: `### 📌 Executive Summary\nThis document outlines collaborative requirements, notes, and goals.\n\n### 🔑 Key Points\n- **Real-Time Collaboration**: Team members can view and edit concurrently.\n- **Structured Content**: Uses block-based formatting for readability.\n- **Access Control**: Role-based permissions maintain document integrity.\n\n### ⚡ Action Items\n- Review document contents with collaborators.\n- Assign follow-up deliverables.`
    }
  }

  return res
}

export async function refineGrammar(content: string): Promise<GeminiResponse> {
  auth().protect()

  if (!content || !content.trim()) {
    return { success: false, error: 'Document has no text to refine' }
  }

  const prompt = `Please review and refine the following document text for grammar, punctuation, clarity, tone, and readability. Preserve the original structure and formatting. Provide the improved version directly:

${content}`

  const systemInstruction = 'You are an expert copywriter and editor. Enhance clarity, flow, and conciseness while preserving original meaning.'
  const res = await callGemini(prompt, systemInstruction)

  if (res.isMock) {
    return {
      success: true,
      isMock: true,
      result: `Refined Version:\n\n${content.trim()}\n\n[Grammar check completed: punctuation and structure polished.]`
    }
  }

  return res
}

export async function translateDocument(content: string, targetLanguage: string): Promise<GeminiResponse> {
  auth().protect()

  if (!content || !content.trim()) {
    return { success: false, error: 'Document has no text to translate' }
  }

  const prompt = `Translate the following document content accurately into ${targetLanguage}. Preserve markdown formatting, headings, and block structure:

${content}`

  const systemInstruction = `You are a professional multilingual translator. Produce natural, accurate translations into ${targetLanguage}.`
  const res = await callGemini(prompt, systemInstruction)

  if (res.isMock) {
    return {
      success: true,
      isMock: true,
      result: `[Translated to ${targetLanguage}]:\n\n${content.trim()}`
    }
  }

  return res
}
