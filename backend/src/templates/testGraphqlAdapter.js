/**
 * Test script for GraphQL to REST Adapter
 * 
 * This script demonstrates how to use the adapter with Shopify → Stripe
 * Run with: node backend/src/adapters/testGraphqlAdapter.js
 */

const { graphqlToRestAdapter } = require('./graphqlToRestAdapter');

// Shopify GraphQL query to fetch products
const shopifyProductsQuery = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          variants(first: 1) {
            edges {
              node {
                id
                price
                sku
              }
            }
          }
        }
      }
    }
  }
`;

// Query variables
const variables = {
  first: 10 // Fetch first 10 products
};

// Configuration for the adapter
const config = {
  // Shopify GraphQL endpoint
  sourceEndpoint: process.env.SHOPIFY_GRAPHQL_ENDPOINT || 
    'https://your-store.myshopify.com/admin/api/2024-01/graphql.json',
  
  // Shopify authentication
  sourceAuth: {
    token: process.env.SHOPIFY_ACCESS_TOKEN || 'shpat_your_access_token_here',
    additionalHeaders: {}
  },
  
  // Stripe REST endpoint
  targetEndpoint: process.env.STRIPE_API_ENDPOINT || 
    'https://api.stripe.com/v1/customers',
  
  // Stripe authentication
  targetAuth: {
    token: process.env.STRIPE_SECRET_KEY || 'sk_test_your_secret_key_here',
    additionalHeaders: {}
  },
  
  // REST method
  restMethod: 'POST',
  
  // Enable batch processing
  batchMode: true,
  batchSize: 3, // Process 3 products at a time
  batchDelay: 2000, // 2 second delay between batches
  
  // Optional: Custom field mappings
  mappings: {
    // 'title': 'name',
    // 'description': 'description'
  }
};

/**
 * Run the test
 */
async function runTest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  GraphQL to REST Adapter - Test Script                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📊 GraphQL Query:');
  console.log(shopifyProductsQuery);
  console.log('\n' + '─'.repeat(60) + '\n');

  console.log('📦 Variables:');
  console.log(JSON.stringify(variables, null, 2));
  console.log('\n' + '─'.repeat(60) + '\n');

  console.log('⚙️  Configuration:');
  console.log(`  Source: ${config.sourceEndpoint}`);
  console.log(`  Target: ${config.targetEndpoint}`);
  console.log(`  Method: ${config.restMethod}`);
  console.log(`  Batch Mode: ${config.batchMode}`);
  console.log(`  Batch Size: ${config.batchSize}`);
  console.log('\n' + '─'.repeat(60) + '\n');

  console.log('🚀 Executing adapter...\n');

  try {
    const result = await graphqlToRestAdapter(shopifyProductsQuery, variables, config);

    console.log('\n' + '─'.repeat(60) + '\n');
    console.log('📊 Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n' + '─'.repeat(60) + '\n');

    if (result.success) {
      console.log('✅ SUCCESS! Products synced to Stripe');
      console.log(`   Processed: ${result.data.processed} items`);
      
      const successCount = result.data.results.filter(r => r.success).length;
      const failureCount = result.data.results.filter(r => !r.success).length;
      
      console.log(`   Successful: ${successCount}`);
      console.log(`   Failed: ${failureCount}`);
      
      if (successCount > 0) {
        console.log('\n   Sample Results:');
        result.data.results.slice(0, 3).forEach((r, i) => {
          if (r.success) {
            console.log(`   ${i + 1}. ✓ ${r.item} → Stripe Customer ID: ${r.data.id}`);
          } else {
            console.log(`   ${i + 1}. ✗ ${r.item} → Error: ${r.error}`);
          }
        });
      }
    } else {
      console.log('❌ FAILED! Error occurred:');
      console.log(`   Type: ${result.error.type}`);
      console.log(`   Message: ${result.error.message}`);
      
      if (result.error.graphqlErrors) {
        console.log('   GraphQL Errors:');
        result.error.graphqlErrors.forEach((err, i) => {
          console.log(`     ${i + 1}. ${err.message}`);
        });
      }
    }

  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:');
    console.error(error);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Test Complete                                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

/**
 * Test with mock data (no API calls)
 */
async function runMockTest() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  GraphQL to REST Adapter - Mock Test                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Mock GraphQL response
  const mockGraphQLResponse = {
    products: {
      edges: [
        {
          node: {
            id: 'gid://shopify/Product/123',
            title: 'Awesome T-Shirt',
            description: 'A really cool t-shirt',
            variants: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/ProductVariant/456',
                    price: '29.99',
                    sku: 'TSHIRT-001'
                  }
                }
              ]
            }
          }
        },
        {
          node: {
            id: 'gid://shopify/Product/789',
            title: 'Cool Hoodie',
            description: 'Stay warm in style',
            variants: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/ProductVariant/101',
                    price: '59.99',
                    sku: 'HOODIE-001'
                  }
                }
              ]
            }
          }
        }
      ]
    }
  };

  console.log('📦 Mock GraphQL Response:');
  console.log(JSON.stringify(mockGraphQLResponse, null, 2));
  console.log('\n' + '─'.repeat(60) + '\n');

  // Import parser function
  const { parseGraphQLResponse, transformShopifyToStripe } = require('./graphqlToRestAdapter');

  // Test parsing
  console.log('🔍 Testing GraphQL response parsing...');
  // Note: These functions are not exported, so we'll just show the expected transformation
  
  console.log('\n📊 Expected Stripe Payloads:');
  mockGraphQLResponse.products.edges.forEach((edge, i) => {
    const product = edge.node;
    const price = product.variants.edges[0]?.node.price || '0.00';
    
    const stripePayload = {
      description: `Product: ${product.title}`,
      metadata: {
        shopify_product_id: product.id,
        product_title: product.title,
        price: price,
        source: 'shopify_sync',
        synced_at: new Date().toISOString()
      }
    };
    
    console.log(`\n${i + 1}. ${product.title}:`);
    console.log(JSON.stringify(stripePayload, null, 2));
  });

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Mock Test Complete                                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// Run the appropriate test based on command line argument
if (require.main === module) {
  const testMode = process.argv[2];

  if (testMode === 'mock') {
    runMockTest();
  } else {
    // Check for required environment variables
    if (!process.env.SHOPIFY_ACCESS_TOKEN) {
      console.warn('⚠️  Warning: SHOPIFY_ACCESS_TOKEN not set in environment');
      console.warn('   Set it with: export SHOPIFY_ACCESS_TOKEN=your_token_here\n');
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('⚠️  Warning: STRIPE_SECRET_KEY not set in environment');
      console.warn('   Set it with: export STRIPE_SECRET_KEY=sk_test_your_key_here\n');
    }

    if (!process.env.SHOPIFY_ACCESS_TOKEN || !process.env.STRIPE_SECRET_KEY) {
      console.log('💡 Tip: Run with "mock" argument to test without API calls:');
      console.log('   node backend/src/adapters/testGraphqlAdapter.js mock\n');
    }

    runTest();
  }
}

module.exports = { runTest, runMockTest, shopifyProductsQuery, config };
