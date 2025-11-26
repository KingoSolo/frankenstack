/**
 * Test script for REST to GraphQL Adapter
 * 
 * This script demonstrates how to use the adapter with sample data
 * Run with: node backend/src/adapters/testAdapter.js
 */

const { restToGraphQLAdapter } = require('./restToGraphQLAdapter');

// Sample Stripe payment_intent.succeeded webhook payload
const sampleStripeWebhook = {
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_3ABC123def456GHI',
      amount: 5000, // $50.00 in cents
      currency: 'usd',
      customer: {
        email: 'john.doe@example.com',
        name: 'John Doe'
      },
      metadata: {
        product_id: 'gid://shopify/ProductVariant/123456789',
        quantity: 2
      },
      status: 'succeeded',
      created: Math.floor(Date.now() / 1000)
    }
  }
};

// Configuration for the adapter
const config = {
  // Replace with your actual Shopify store URL
  targetEndpoint: process.env.SHOPIFY_GRAPHQL_ENDPOINT || 
    'https://your-store.myshopify.com/admin/api/2024-01/graphql.json',
  
  // Replace with your actual Shopify access token
  authentication: {
    token: process.env.SHOPIFY_ACCESS_TOKEN || 'shpat_your_access_token_here',
    additionalHeaders: {}
  },
  
  // Optional: Custom field mappings
  mappings: {},
  
  // Optional: Validation schema
  sourceSchema: null
};

/**
 * Run the test
 */
async function runTest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  REST to GraphQL Adapter - Test Script                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📦 Sample Stripe Webhook Payload:');
  console.log(JSON.stringify(sampleStripeWebhook, null, 2));
  console.log('\n' + '─'.repeat(60) + '\n');

  console.log('⚙️  Configuration:');
  console.log(`  Target: ${config.targetEndpoint}`);
  console.log(`  Auth Token: ${config.authentication.token.substring(0, 15)}...`);
  console.log('\n' + '─'.repeat(60) + '\n');

  console.log('🚀 Executing adapter...\n');

  try {
    const result = await restToGraphQLAdapter(sampleStripeWebhook, config);

    console.log('\n' + '─'.repeat(60) + '\n');
    console.log('📊 Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n' + '─'.repeat(60) + '\n');

    if (result.success) {
      console.log('✅ SUCCESS! Order created in Shopify');
      console.log(`   Order ID: ${result.data?.orderCreate?.order?.id || 'N/A'}`);
      console.log(`   Order Name: ${result.data?.orderCreate?.order?.name || 'N/A'}`);
      console.log(`   Customer: ${result.data?.orderCreate?.order?.email || 'N/A'}`);
    } else {
      console.log('❌ FAILED! Error occurred:');
      console.log(`   Type: ${result.error.type}`);
      console.log(`   Message: ${result.error.message}`);
    }

  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:');
    console.error(error);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Test Complete                                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// Run the test if this file is executed directly
if (require.main === module) {
  // Check for required environment variables
  if (!process.env.SHOPIFY_ACCESS_TOKEN) {
    console.warn('⚠️  Warning: SHOPIFY_ACCESS_TOKEN not set in environment');
    console.warn('   Set it with: export SHOPIFY_ACCESS_TOKEN=your_token_here\n');
  }

  if (!process.env.SHOPIFY_GRAPHQL_ENDPOINT) {
    console.warn('⚠️  Warning: SHOPIFY_GRAPHQL_ENDPOINT not set in environment');
    console.warn('   Set it with: export SHOPIFY_GRAPHQL_ENDPOINT=https://your-store.myshopify.com/admin/api/2024-01/graphql.json\n');
  }

  runTest();
}

module.exports = { runTest, sampleStripeWebhook, config };
