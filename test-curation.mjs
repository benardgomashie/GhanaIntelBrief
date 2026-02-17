// Test script to manually trigger article curation
// Run with: node test-curation.mjs

const CRON_SECRET = 'a_very_secret_and_random_string_for_cron';
const API_URL = 'http://localhost:9002/api/curate';

async function testCuration() {
  console.log('🔍 Triggering article curation...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
      },
    });

    const data = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ Success!', data.message);
    } else {
      console.log('\n❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testCuration();
