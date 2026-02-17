import { config } from 'dotenv';
config();

async function testModel(modelName) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  console.log(`\n🔍 Testing: ${modelName}`);

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'Test prompt: What is Ghana?',
          parameters: { max_new_tokens: 50 },
        }),
      }
    );

    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Working! Response:`, JSON.stringify(data).substring(0, 100) + '...');
    } else {
      const error = await response.text();
      console.log(`   ❌ Error:`, error.substring(0, 100));
    }

  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
  }
}

async function run() {
  console.log('🔍 Testing free Hugging Face models...\n');
  
  // Try different free models
  await testModel('gpt2');
  await testModel('facebook/opt-350m');
  await testModel('google/flan-t5-base');
  await testModel('mistralai/Mistral-7B-Instruct-v0.1');
  await testModel('microsoft/phi-2');
}

run();
