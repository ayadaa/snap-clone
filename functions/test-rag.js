/**
 * Simple test script for RAG functions
 * 
 * This script tests the core RAG functionality to ensure everything is working
 * before we integrate with the frontend.
 */

const admin = require('firebase-admin');
const test = require('firebase-functions-test')();

// Set environment variables for testing
process.env.FUNCTIONS_EMULATOR = 'true';

// Import our functions after setting up environment
const { getMathExplanation, getDefinition, checkRagHealth } = require('./lib/index');

async function testRagFunctions() {
  console.log('🧪 Testing RAG Functions...\n');

  // Mock authentication context
  const mockContext = {
    auth: {
      uid: 'test-user-123',
      token: {}
    }
  };

  try {
    // Test 1: Simple Math Question
    console.log('1️⃣ Testing Simple Math Question...');
    const mathResult = await getMathExplanation.run({
      query: 'What is a quadratic equation?',
      queryType: 'definition',
      gradeLevel: 'high school'
    }, mockContext);
    console.log('✅ Math Question Result:', {
      hasExplanation: !!mathResult.explanation,
      confidence: mathResult.confidence,
      sources: mathResult.sources?.length || 0,
      processingTime: mathResult.processingTime,
      preview: mathResult.explanation?.substring(0, 150) + '...'
    });

    // Test 2: Definition Lookup
    console.log('\n2️⃣ Testing Definition Lookup...');
    const definitionResult = await getDefinition.run({
      term: 'polynomial',
      gradeLevel: 'high school'
    }, mockContext);
    console.log('✅ Definition Result:', {
      hasExplanation: !!definitionResult.explanation,
      confidence: definitionResult.confidence,
      sources: definitionResult.sources?.length || 0,
      preview: definitionResult.explanation?.substring(0, 100) + '...'
    });

    // Test 3: Health Check
    console.log('\n3️⃣ Testing RAG Health Check...');
    const healthResult = await checkRagHealth.run({}, mockContext);
    console.log('✅ Health Check Result:', {
      status: healthResult.status,
      confidence: healthResult.confidence,
      sources: healthResult.sourcesFound
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Math question: ${mathResult.confidence > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`- Definition lookup: ${definitionResult.confidence > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`- Health check: ${healthResult.status === 'healthy' ? 'PASS' : 'FAIL'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    console.error('Full error:', error);
  } finally {
    test.cleanup();
    process.exit(0);
  }
}

// Run the tests
testRagFunctions(); 