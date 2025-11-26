/**
 * REST to GraphQL Adapter
 * Transforms Stripe payment webhooks into Shopify GraphQL orderCreate mutations
 * 
 * @module restToGraphQLAdapter
 * @version 1.0.0
 */

const fetch = require('node-fetch');

/**
 * Custom error class for GraphQL-specific errors
 */
class GraphQLError extends Error {
  constructor(errors) {
    super('GraphQL execution failed');
    this.name = 'GraphQLError';
    this.graphqlErrors = errors;
  }
}

/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Main adapter function that transforms REST payload to GraphQL mutation
 * 
 * @param {Object} restPayload - The incoming REST/JSON payload (e.g., Stripe webhook)
 * @param {Object} config - Configuration object
 * @param {string} config.targetEndpoint - GraphQL API endpoint URL
 * @param {Object} config.authentication - Auth configuration
 * @param {string} config.authentication.token - Bearer token or API key
 * @param {Object} config.authentication.additionalHeaders - Extra headers (optional)
 * @param {Object} config.mappings - Field mappings from REST to GraphQL (optional)
 * @param {Object} config.sourceSchema - Validation schema for REST payload (optional)
 * @returns {Promise<Object>} Response object with success status and data
 */
async function restToGraphQLAdapter(restPayload, config) {
  try {
    console.log('[Adapter] Starting REST to GraphQL transformation');
    console.log('[Adapter] Source: Stripe webhook');
    console.log('[Adapter] Target: Shopify GraphQL API');

    // Step 1: Validate the incoming REST payload
    validatePayload(restPayload, config.sourceSchema);
    console.log('[Adapter] ✓ Payload validation passed');

    // Step 2: Transform REST data to GraphQL variables
    const graphqlVariables = transformStripeToShopify(restPayload, config.mappings);
    console.log('[Adapter] ✓ Data transformation complete');
    console.log('[Adapter] Variables:', JSON.stringify(graphqlVariables, null, 2));

    // Step 3: Build the GraphQL mutation
    const graphqlMutation = buildShopifyOrderMutation();
    console.log('[Adapter] ✓ GraphQL mutation built');

    // Step 4: Execute the GraphQL request
    const result = await executeGraphQL(
      config.targetEndpoint,
      graphqlMutation,
      graphqlVariables,
      config.authentication
    );
    console.log('[Adapter] ✓ GraphQL execution successful');

    // Step 5: Return formatted response
    return {
      success: true,
      data: result,
      metadata: {
        sourceProtocol: 'REST',
        targetProtocol: 'GraphQL',
        timestamp: new Date().toISOString(),
        adapter: 'Stripe → Shopify'
      }
    };
  } catch (error) {
    console.error('[Adapter] ✗ Error occurred:', error.message);
    return handleError(error);
  }
}

/**
 * Validates the incoming REST payload structure
 * 
 * @param {Object} payload - REST payload to validate
 * @param {Object} schema - Optional validation schema
 * @throws {ValidationError} If payload is invalid
 */
function validatePayload(payload, schema) {
  // Check if payload exists
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('Payload must be a valid object', 'payload');
  }

  // Validate Stripe webhook structure
  if (!payload.type) {
    throw new ValidationError('Missing required field: type', 'type');
  }

  if (!payload.data || !payload.data.object) {
    throw new ValidationError('Missing required field: data.object', 'data.object');
  }

  // Validate payment_intent.succeeded event
  if (payload.type !== 'payment_intent.succeeded') {
    throw new ValidationError(
      `Unsupported event type: ${payload.type}. Expected: payment_intent.succeeded`,
      'type'
    );
  }

  const paymentIntent = payload.data.object;

  // Validate required fields for Shopify order creation
  if (!paymentIntent.amount) {
    throw new ValidationError('Missing required field: data.object.amount', 'amount');
  }

  if (!paymentIntent.currency) {
    throw new ValidationError('Missing required field: data.object.currency', 'currency');
  }

  // Customer information is required for Shopify
  if (!paymentIntent.customer || !paymentIntent.customer.email) {
    throw new ValidationError('Missing required field: data.object.customer.email', 'customer.email');
  }

  console.log('[Validator] All required fields present');
}

/**
 * Transforms Stripe payment webhook data to Shopify GraphQL variables
 * 
 * @param {Object} stripePayload - Stripe webhook payload
 * @param {Object} customMappings - Optional custom field mappings
 * @returns {Object} GraphQL variables object
 */
function transformStripeToShopify(stripePayload, customMappings = {}) {
  const paymentIntent = stripePayload.data.object;
  
  // Default field mappings (can be overridden by customMappings)
  const defaultMappings = {
    'data.object.customer.email': 'email',
    'data.object.customer.name': 'customerName',
    'data.object.amount': 'totalPrice',
    'data.object.currency': 'currency',
    'data.object.metadata.product_id': 'productId',
    'data.object.metadata.quantity': 'quantity'
  };

  const mappings = { ...defaultMappings, ...customMappings };

  // Extract values using the mappings
  const variables = {};

  // Map customer email
  variables.email = getNestedValue(stripePayload, 'data.object.customer.email') || '';

  // Map customer name (split into first and last name for Shopify)
  const fullName = getNestedValue(stripePayload, 'data.object.customer.name') || 'Customer';
  const nameParts = fullName.split(' ');
  variables.firstName = nameParts[0] || 'Customer';
  variables.lastName = nameParts.slice(1).join(' ') || '';

  // Map amount (Stripe uses cents, convert to dollars for Shopify)
  const amountInCents = getNestedValue(stripePayload, 'data.object.amount') || 0;
  variables.totalPrice = (amountInCents / 100).toFixed(2);

  // Map currency
  variables.currency = (getNestedValue(stripePayload, 'data.object.currency') || 'USD').toUpperCase();

  // Map product details from metadata
  variables.productId = getNestedValue(stripePayload, 'data.object.metadata.product_id') || '';
  variables.quantity = parseInt(getNestedValue(stripePayload, 'data.object.metadata.quantity') || '1', 10);

  // Add Stripe payment ID for reference
  variables.stripePaymentId = paymentIntent.id || '';

  console.log('[Transformer] Mapped fields:');
  console.log(`  - Email: ${variables.email}`);
  console.log(`  - Name: ${variables.firstName} ${variables.lastName}`);
  console.log(`  - Total: ${variables.currency} ${variables.totalPrice}`);
  console.log(`  - Product: ${variables.productId} (qty: ${variables.quantity})`);

  return variables;
}

/**
 * Builds the Shopify orderCreate GraphQL mutation
 * 
 * @returns {string} GraphQL mutation string
 */
function buildShopifyOrderMutation() {
  return `
    mutation CreateOrderFromStripe(
      $email: String!
      $firstName: String!
      $lastName: String
      $totalPrice: String!
      $currency: CurrencyCode!
      $productId: ID!
      $quantity: Int!
      $stripePaymentId: String
    ) {
      orderCreate(input: {
        email: $email
        customer: {
          firstName: $firstName
          lastName: $lastName
        }
        lineItems: [{
          variantId: $productId
          quantity: $quantity
        }]
        financialStatus: PAID
        transactions: [{
          kind: SALE
          status: SUCCESS
          amount: $totalPrice
          gateway: "Stripe"
        }]
        note: $stripePaymentId
        tags: ["stripe", "automated"]
      }) {
        order {
          id
          name
          email
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          lineItems(first: 10) {
            edges {
              node {
                id
                title
                quantity
              }
            }
          }
          customer {
            id
            firstName
            lastName
            email
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
}

/**
 * Executes a GraphQL request against the target endpoint
 * 
 * @param {string} endpoint - GraphQL API endpoint URL
 * @param {string} query - GraphQL query or mutation string
 * @param {Object} variables - Variables for the GraphQL operation
 * @param {Object} auth - Authentication configuration
 * @param {string} auth.token - Bearer token or API key
 * @param {Object} auth.additionalHeaders - Additional headers (optional)
 * @returns {Promise<Object>} GraphQL response data
 * @throws {GraphQLError} If GraphQL execution fails
 */
async function executeGraphQL(endpoint, query, variables, auth) {
  console.log('[GraphQL] Executing request to:', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': auth.token,
        ...(auth.additionalHeaders || {})
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    // Check HTTP response status
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      console.error('[GraphQL] Errors:', JSON.stringify(result.errors, null, 2));
      throw new GraphQLError(result.errors);
    }

    // Check for Shopify-specific userErrors
    if (result.data && result.data.orderCreate && result.data.orderCreate.userErrors) {
      const userErrors = result.data.orderCreate.userErrors;
      if (userErrors.length > 0) {
        console.error('[GraphQL] User errors:', JSON.stringify(userErrors, null, 2));
        throw new GraphQLError(userErrors);
      }
    }

    console.log('[GraphQL] ✓ Request successful');
    return result.data;

  } catch (error) {
    if (error instanceof GraphQLError) {
      throw error;
    }
    
    // Network or other errors
    console.error('[GraphQL] Network error:', error.message);
    throw new Error(`GraphQL request failed: ${error.message}`);
  }
}

/**
 * Gets a nested value from an object using dot notation
 * 
 * @param {Object} obj - Object to extract value from
 * @param {string} path - Dot-notation path (e.g., 'data.object.customer.email')
 * @returns {*} The value at the path, or undefined if not found
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Handles errors and formats them into a consistent response structure
 * 
 * @param {Error} error - The error object
 * @returns {Object} Formatted error response
 */
function handleError(error) {
  const errorResponse = {
    success: false,
    error: {
      type: error.name || 'Error',
      message: error.message,
      timestamp: new Date().toISOString()
    },
    metadata: {
      sourceProtocol: 'REST',
      targetProtocol: 'GraphQL',
      timestamp: new Date().toISOString()
    }
  };

  // Add specific error details based on error type
  if (error instanceof ValidationError) {
    errorResponse.error.field = error.field;
  } else if (error instanceof GraphQLError) {
    errorResponse.error.graphqlErrors = error.graphqlErrors;
  }

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
  }

  return errorResponse;
}

// Export the main adapter function and helper classes
module.exports = {
  restToGraphQLAdapter,
  GraphQLError,
  ValidationError
};
