import { config } from 'dotenv';
config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  console.log('🔍 Testing Gemini API...\n');

  const prompt = `You are an expert analyst for news related to Ghana.
Analyze this article and return ONLY a valid JSON object with these fields:
- summary: A concise, 5-bullet point summary (string with bullet points separated by newlines)
- whyThisMattersExplanation: 2-3 sentences explaining significance for Ghana
- isRelevantMoney: boolean
- isRelevantPolicy: boolean  
- isRelevantOpportunity: boolean
- isRelevantGrowth: boolean

Article: Ghana's government announced new economic policies today.

Return ONLY the JSON object, no other text.`;

  try {
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

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ API Error Response:', errorData);
      process.exit(1);
    }

    const data = await response.json();
    console.log('\n✅ API Response:', JSON.stringify(data, null, 2));
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('\n📝 Generated Text:', text);
    
    // Try to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('\n✅ Parsed JSON:', JSON.stringify(parsed, null, 2));
    } else {
      console.error('❌ No JSON found in response');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testGemini();
