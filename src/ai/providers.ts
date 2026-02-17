'use server';

import { AIProvider, AIResponse, QuotaExceededError, isQuotaError } from './types';

// Primary: Gemini via Direct API
export async function callGemini(articleContent: string): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const prompt = `You are an expert analyst for news related to Ghana.
Analyze this article and return ONLY a valid JSON object with these fields:
- summary: A concise, 5-bullet point summary (string with bullet points separated by newlines)
- whyThisMattersExplanation: 2-3 sentences explaining significance for Ghana
- isRelevantMoney: boolean
- isRelevantPolicy: boolean  
- isRelevantOpportunity: boolean
- isRelevantGrowth: boolean

Article: ${articleContent.substring(0, 10000)}

Return ONLY the JSON object, no other text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429 || isQuotaError(errorData)) {
        throw new QuotaExceededError('gemini');
      }
      throw new Error(`Gemini API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      throw new Error('No content in Gemini response');
    }

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');  
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...parsed,
      provider: 'gemini',
    };
  } catch (error: any) {
    if (isQuotaError(error)) {
      throw new QuotaExceededError('gemini', error);
    }
    throw error;
  }
}

// Secondary: OpenAI
export async function callOpenAI(articleContent: string): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert analyst for news related to Ghana. Return only valid JSON.',
          },
          {
            role: 'user',
            content: `Analyze this article and return a JSON object with: summary (5-bullet points), whyThisMattersExplanation (2-3 sentences), isRelevantMoney (boolean), isRelevantPolicy (boolean), isRelevantOpportunity (boolean), isRelevantGrowth (boolean).

Article: ${articleContent}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429 || isQuotaError(errorData)) {
        throw new QuotaExceededError('openai');
      }
      throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const parsed = JSON.parse(content);
    return {
      ...parsed,
      provider: 'openai',
    };
  } catch (error: any) {
    if (isQuotaError(error)) {
      throw new QuotaExceededError('openai', error);
    }
    throw error;
  }
}

// Tertiary: Hugging Face
export async function callHuggingFace(articleContent: string): Promise<AIResponse> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey || apiKey === 'your_huggingface_api_key_here') {
    throw new Error('Hugging Face API key not configured');
  }

  try {
    const prompt = `<s>[INST] You are an expert analyst for news related to Ghana. Analyze the article and return ONLY a valid JSON object (no other text) with these fields: summary (string with 5 bullet points), whyThisMattersExplanation (2-3 sentences), isRelevantMoney (boolean), isRelevantPolicy (boolean), isRelevantOpportunity (boolean), isRelevantGrowth (boolean).

Article: ${articleContent.substring(0, 2000)} [/INST]`;

    const response = await fetch(
      'https://router.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429 || isQuotaError(errorData)) {
        throw new QuotaExceededError('huggingface');
      }
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data[0]?.generated_text || '';
    
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Hugging Face response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: parsed.summary || 'Summary not available',
      whyThisMattersExplanation: parsed.whyThisMattersExplanation || 'Analysis not available',
      isRelevantMoney: parsed.isRelevantMoney || false,
      isRelevantPolicy: parsed.isRelevantPolicy || false,
      isRelevantOpportunity: parsed.isRelevantOpportunity || false,
      isRelevantGrowth: parsed.isRelevantGrowth || false,
      provider: 'huggingface',
    };
  } catch (error: any) {
    if (isQuotaError(error)) {
      throw new QuotaExceededError('huggingface', error);
    }
    throw error;
  }
}

// Fallback: Store raw text only (async to comply with 'use server')
export async function createFallbackResponse(articleContent: string): Promise<AIResponse> {
  // Split into sentences and take first few
  const sentences = articleContent
    .substring(0, 800)
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 0)
    .slice(0, 3)
    .map(s => s.trim());
  
  // Format as bullet points
  const summary = sentences.map(s => `- ${s}`).join('\n');
  
  return {
    summary: summary || '- Article content will be available soon',
    whyThisMattersExplanation:
      'This article covers important developments in Ghana\'s business and policy landscape. Check back for detailed AI analysis.',
    isRelevantMoney: false,
    isRelevantPolicy: false,
    isRelevantOpportunity: false,
    isRelevantGrowth: false,
    provider: 'fallback',
  };
}
