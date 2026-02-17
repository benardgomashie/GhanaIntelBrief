import { config } from 'dotenv';
config();

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    console.log('❌ OpenAI API key not configured\n');
    return;
  }

  console.log('✅ OpenAI API Key found:', apiKey.substring(0, 10) + '...');
  console.log('🔍 Testing OpenAI API...\n');

  const prompt = `Analyze this Ghana news article and return ONLY a JSON object:
Article: Ghana's government announced new economic policies today.

Return format:
{
  "summary": "5 bullet points separated by newlines",
  "whyThisMattersExplanation": "2-3 sentences",
  "isRelevantMoney": true/false,
  "isRelevantPolicy": true/false,
  "isRelevantOpportunity": true/false,
  "isRelevantGrowth": true/false
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    console.log('📊 Response Status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ OpenAI Error:', JSON.stringify(error, null, 2));
      return;
    }

    const data = await response.json();
    console.log('✅ OpenAI Response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testHuggingFace() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey || apiKey === 'your_huggingface_api_key_here') {
    console.log('❌ Hugging Face API key not configured\n');
    return;
  }

  console.log('\n\n✅ Hugging Face API Key found:', apiKey.substring(0, 10) + '...');
  console.log('🔍 Testing Hugging Face API...\n');

  const prompt = `Analyze this Ghana news article and return JSON:
Article: Ghana's government announced new economic policies today.`;

  try {
    const response = await fetch(
      'https://router.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
          },
        }),
      }
    );

    console.log('📊 Response Status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Hugging Face Error:', error);
      return;
    }

    const data = await response.json();
    console.log('✅ Hugging Face Response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function run() {
  await testOpenAI();
  await testHuggingFace();
}

run();
