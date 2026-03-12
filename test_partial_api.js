/**
 * Test Partial Admission API
 */

require('dotenv').config();
const fetch = require('node-fetch').default || require('node-fetch');

async function testPartialAdmission() {
  console.log('🎯 Testing Partial Admission API\n');

  try {
    // Test 1: Get partial admissions (should be empty)
    console.log('📋 Step 1: Get Partial Admissions');
    const getResponse = await fetch('http://localhost:5000/api/v1/admission/partial', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    const getResult = await getResponse.json();
    console.log('GET Response:', JSON.stringify(getResult, null, 2));

    // Test 2: Create partial admission
    console.log('\n➕ Step 2: Create Partial Admission');
    const createData = {
      firstName: 'Test',
      lastName: 'Student',
      gender: 'Male',
      dateOfBirth: '2015-01-01',
      email: 'test@student.com',
      phone: '1234567890'
    };

    const createResponse = await fetch('http://localhost:5000/api/v1/admission/partial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(createData)
    });

    const createResult = await createResponse.json();
    console.log('POST Response:', JSON.stringify(createResult, null, 2));

    // Test 3: Get partial admissions again (should show 1)
    console.log('\n📋 Step 3: Get Partial Admissions Again');
    const getResponse2 = await fetch('http://localhost:5000/api/v1/admission/partial', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    const getResult2 = await getResponse2.json();
    console.log('GET Response 2:', JSON.stringify(getResult2, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPartialAdmission();
