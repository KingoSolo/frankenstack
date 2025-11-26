/**
 * Webhook Routes
 * Handles incoming webhooks and routes them through the appropriate adapters
 * 
 * @module routes/webhooks
 */

const express = require('express');
const router = express.Router();
const { restToGraphQLAdapter } = require('../adapters/restToGraphQLAdapter');

/**
 * POST /webhooks/stripe-to-shopify
 * 
 * Receives Stripe payment webhooks and creates orders in Shopify
 * 
 * Example request body (Stripe payment_intent.succeeded):
 * {
 *   "type": "payment_intent.succeeded",
 *   "data": {
 *     "object": {
 *       "id": "pi_123",
 *       "amount": 5000,
 *       "currency": "usd",
 *       "customer": {
 *         "email": "customer@example.com",
 *         "name": "John Doe"
 *       },
 *       "metadata": {
 *         "product_id": "gid://shopify/ProductVariant/123456",
 *         "quantity": 2
 *       }
 *     }
 *   }
 * }
 */
router.post('/stripe-to-shopify', async (req, res) => {
  console.log('\n=== Stripe → Shopify Webhook Received ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    // Get the Stripe webhook payload
    const stripePayload = req.body;

    // Configuration for the adapter
    const config = {
      // Shopify GraphQL endpoint (replace with your store)
      targetEndpoint: process.env.SHOPIFY_GRAPHQL_ENDPOINT || 
        'https://your-store.myshopify.com/admin/api/2024-01/graphql.json',
      
      // Authentication for Shopify
      authentication: {
        token: process.env.SHOPIFY_ACCESS_TOKEN || '',
        additionalHeaders: {
          'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN || ''
        }
      },
      
      // Optional: Custom field mappings (uses defaults if not provided)
      mappings: {},
      
      // Optional: Validation schema
      sourceSchema: null
    };

    // Validate environment variables
    if (!config.authentication.token) {
      throw new Error('SHOPIFY_ACCESS_TOKEN environment variable is not set');
    }

    // Execute the adapter
    const result = await restToGraphQLAdapter(stripePayload, config);

    // Return the result
    if (result.success) {
      console.log('✓ Order created successfully');
      console.log('Order ID:', result.data?.orderCreate?.order?.id);
      
      res.status(200).json({
        success: true,
        message: 'Order created in Shopify',
        orderId: result.data?.orderCreate?.order?.id,
        orderName: result.data?.orderCreate?.order?.name,
        data: result.data,
        metadata: result.metadata
      });
    } else {
      console.error('✗ Adapter execution failed');
      console.error('Error:', result.error);
      
      res.status(400).json({
        success: false,
        message: 'Failed to create order',
        error: result.error,
        metadata: result.metadata
      });
    }

  } catch (error) {
    console.error('✗ Unexpected error:', error.message);
    console.error(error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        type: error.name,
        message: error.message
      }
    });
  }
});

/**
 * GET /webhooks/health
 * 
 * Health check endpoint for the webhook service
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'webhook-adapter',
    timestamp: new Date().toISOString(),
    adapters: {
      'stripe-to-shopify': 'available'
    }
  });
});

module.exports = router;
