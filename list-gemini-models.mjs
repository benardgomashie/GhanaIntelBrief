import { config } from 'dotenv';
config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
  }

  console.log('🔍 Fetching available Gemini models...\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Error:', errorData);
      process.exit(1);
    }

    const data = await response.json();
    console.log('✅ Available Models:\n');
    
    data.models.forEach((model) => {
      if (model.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`📦 ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Methods: ${model.supportedGenerationMethods.join(', ')}`);
        console.log('');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listModels();
