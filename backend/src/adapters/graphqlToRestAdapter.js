/**
 * GraphQL to REST Adapter
 * Queries Shopify GraphQL API for products and creates Stripe customer records
 * 
 * @module graphqlToRestAdapter
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
 * Custom error class for REST API errors
 */
class RestAPIError extends Error {
  constructor(message, statusCode, response) {
    super(message);
    this.name = 'RestAPIError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Custom error class for rate limiting
 */
class RateLimitError extends Error {
  constructor(retryAfter) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Main adapter function that transforms GraphQL query results to REST API calls
 * 
 * @param {string} graphqlQuery - GraphQL query string
 * @param {Object} variables - GraphQL query variables
 * @param {Object} config - Configuration object
 * @param {string} config.sourceEndpoint - GraphQL API endpoint URL
 * @param {Object} config.sourceAuth - GraphQL authentication
 * @param {string} config.targetEndpoint - REST API endpoint URL
 * @param {Object} config.targetAuth - REST API authentication
 * @param {string} config.restMethod - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} config.mappings - Field mappings from GraphQL to REST
 * @param {boolean} config.batchMode - Enable batch processing (default: true)
 * @returns {Promise<Object>} Response object with success status and data
 */
async function graphqlToRestAdapter(graphqlQuery, variables, config) {
  try {
    console.log('[Adapter] Starting GraphQL to REST transformation');
    console.log('[Adapter] Source: Shopify GraphQL API');
    console.log('[Adapter] Target: Stripe REST API');

    // Step 1: Execute GraphQL query
    const graphqlResult = await executeGraphQL(
      config.sourceEndpoint,
      graphqlQuery,
      variables,
      config.sourceAuth
    );
    console.log('[Adapter] ✓ GraphQL query executed successfully');

    // Step 2: Parse nested GraphQL response structure
    const parsedData = parseGraphQLResponse(graphqlResult);
    console.log(`[Adapter] ✓ Parsed ${parsedData.length} items from GraphQL response`);

    // Step 3: Transform and batch process
    const batchMode = config.batchMode !== false; // Default to true
    let results = [];

    if (batchMode && Array.isArray(parsedData)) {
      console.log('[Adapter] Processing in batch mode...');
      results = await processBatch(parsedData, config);
    } else {
      console.log('[Adapter] Processing single item...');
      const restPayload = transformShopifyToStripe(parsedData[0] || parsedData, config.mappings);
      const restResult = await executeRestWithRetry(
        config.targetEndpoint,
        config.restMethod || 'POST',
        restPayload,
        config.targetAuth
      );
      results = [restResult];
    }

    console.log('[Adapter] ✓ All REST API calls completed');

    // Step 4: Return formatted response
    return {
      success: true,
      data: {
        processed: results.length,
        results: results
      },
      metadata: {
        sourceProtocol: 'GraphQL',
        targetProtocol: 'REST',
        timestamp: new Date().toISOString(),
        adapter: 'Shopify → Stripe'
      }
    };
  } catch (error) {
    console.error('[Adapter] ✗ Error occurred:', error.message);
    return handleError(error);
  }
}

/**
 * Executes a GraphQL query against the source endpoint
 * 
 * @param {string} endpoint - GraphQL API endpoint URL
 * @param {string} query - GraphQL query string
 * @param {Object} variables - Variables for the GraphQL query
 * @param {Object} auth - Authentication configuration
 * @returns {Promise<Object>} GraphQL response data
 * @throws {GraphQLError} If GraphQL execution fails
 */
async function executeGraphQL(endpoint, query, variables, auth) {
  console.log('[GraphQL] Executing query...');

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
        variables: variables || {}
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      console.error('[GraphQL] Errors:', JSON.stringify(result.errors, null, 2));
      throw new GraphQLError(result.errors);
    }

    console.log('[GraphQL] ✓ Query successful');
    return result.data;

  } catch (error) {
    if (error instanceof GraphQLError) {
      throw error;
    }
    console.error('[GraphQL] Network error:', error.message);
    throw new Error(`GraphQL request failed: ${error.message}`);
  }
}

/**
 * Parses nested GraphQL response structure (edges/nodes pattern)
 * Flattens the Shopify GraphQL response into a simple array
 * 
 * @param {Object} graphqlData - Raw GraphQL response data
 * @returns {Array} Flattened array of items
 */
function parseGraphQLResponse(graphqlData) {
  console.log('[Parser] Parsing nested GraphQL structure...');

  // Handle Shopify's products query structure
  if (graphqlData.products && graphqlData.products.edges) {
    const products = graphqlData.products.edges.map(edge => {
      const product = edge.node;
      
      // Flatten nested variants structure
      if (product.variants && product.variants.edges) {
        product.firstVariant = product.variants.edges[0]?.node || null;
      }
      
      return product;
    });

    console.log(`[Parser] ✓ Extracted ${products.length} products`);
    return products;
  }

  // Handle generic edges/nodes structure
  if (graphqlData.edges) {
    return graphqlData.edges.map(edge => edge.node);
  }

  // Return as-is if not nested
  return Array.isArray(graphqlData) ? graphqlData : [graphqlData];
}

/**
 * Transforms Shopify product data to Stripe customer payload
 * 
 * @param {Object} shopifyProduct - Shopify product object
 * @param {Object} customMappings - Optional custom field mappings
 * @returns {Object} Stripe customer payload
 */
function transformShopifyToStripe(shopifyProduct, customMappings = {}) {
  console.log(`[Transformer] Transforming product: ${shopifyProduct.title}`);

  // Extract price from nested variant structure
  const price = shopifyProduct.firstVariant?.price || 
                shopifyProduct.variants?.edges?.[0]?.node?.price || 
                '0.00';

  // Build Stripe customer payload
  const stripePayload = {
    description: `Product: ${shopifyProduct.title}`,
    metadata: {
      shopify_product_id: shopifyProduct.id,
      product_title: shopifyProduct.title,
      price: price,
      source: 'shopify_sync',
      synced_at: new Date().toISOString()
    }
  };

  // Apply custom mappings if provided
  if (Object.keys(customMappings).length > 0) {
    for (const [shopifyPath, stripePath] of Object.entries(customMappings)) {
      const value = getNestedValue(shopifyProduct, shopifyPath);
      if (value !== undefined) {
        setNestedValue(stripePayload, stripePath, value);
      }
    }
  }

  console.log('[Transformer] ✓ Transformation complete');
  return stripePayload;
}

/**
 * Processes multiple items in batch with rate limiting
 * 
 * @param {Array} items - Array of items to process
 * @param {Object} config - Configuration object
 * @returns {Promise<Array>} Array of results
 */
async function processBatch(items, config) {
  const results = [];
  const batchSize = config.batchSize || 5; // Process 5 at a time
  const delayBetweenBatches = config.batchDelay || 1000; // 1 second delay

  console.log(`[Batch] Processing ${items.length} items in batches of ${batchSize}`);

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(`[Batch] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`);

    // Process batch items in parallel
    const batchPromises = batch.map(async (item, index) => {
      try {
        const restPayload = transformShopifyToStripe(item, config.mappings);
        const result = await executeRestWithRetry(
          config.targetEndpoint,
          config.restMethod || 'POST',
          restPayload,
          config.targetAuth
        );
        
        console.log(`[Batch] ✓ Item ${i + index + 1}/${items.length} processed`);
        return { success: true, data: result, item: item.title };
      } catch (error) {
        console.error(`[Batch] ✗ Item ${i + index + 1} failed:`, error.message);
        return { success: false, error: error.message, item: item.title };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      console.log(`[Batch] Waiting ${delayBetweenBatches}ms before next batch...`);
      await sleep(delayBetweenBatches);
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`[Batch] ✓ Batch processing complete: ${successCount}/${results.length} successful`);

  return results;
}

/**
 * Executes REST API call with exponential backoff retry logic
 * 
 * @param {string} endpoint - REST API endpoint URL
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} payload - Request payload
 * @param {Object} auth - Authentication configuration
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @returns {Promise<Object>} REST API response
 * @throws {RestAPIError} If all retries fail
 */
async function executeRestWithRetry(endpoint, method, payload, auth, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await executeRest(endpoint, method, payload, auth);
    } catch (error) {
      lastError = error;
      
      // Handle rate limiting with exponential backoff
      if (error instanceof RateLimitError || error.statusCode === 429) {
        const backoffDelay = calculateBackoff(attempt);
        console.warn(`[REST] Rate limited. Retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(backoffDelay);
        continue;
      }
      
      // Retry on server errors (5xx)
      if (error.statusCode >= 500) {
        const backoffDelay = calculateBackoff(attempt);
        console.warn(`[REST] Server error ${error.statusCode}. Retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(backoffDelay);
        continue;
      }
      
      // Don't retry on client errors (4xx except 429)
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Executes a REST API call
 * 
 * @param {string} endpoint - REST API endpoint URL
 * @param {string} method - HTTP method
 * @param {Object} payload - Request payload
 * @param {Object} auth - Authentication configuration
 * @returns {Promise<Object>} REST API response
 * @throws {RestAPIError} If request fails
 */
async function executeRest(endpoint, method, payload, auth) {
  console.log(`[REST] ${method} ${endpoint}`);

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${auth.token}`,
        ...(auth.additionalHeaders || {})
      }
    };

    // Stripe expects form-encoded data
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = encodeStripePayload(payload);
    }

    // Add query params for GET
    if (method === 'GET' && Object.keys(payload).length > 0) {
      const params = new URLSearchParams(flattenObject(payload));
      endpoint = `${endpoint}?${params.toString()}`;
    }

    const response = await fetch(endpoint, options);

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after') || 5;
      throw new RateLimitError(parseInt(retryAfter, 10));
    }

    // Parse response
    const result = await response.json();

    // Check for errors
    if (!response.ok) {
      throw new RestAPIError(
        result.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        result
      );
    }

    console.log('[REST] ✓ Request successful');
    return result;

  } catch (error) {
    if (error instanceof RateLimitError || error instanceof RestAPIError) {
      throw error;
    }
    console.error('[REST] Network error:', error.message);
    throw new RestAPIError(`REST request failed: ${error.message}`, 0, null);
  }
}

/**
 * Encodes payload for Stripe API (form-urlencoded format)
 * Stripe requires nested objects to be encoded as metadata[key]=value
 * 
 * @param {Object} payload - Payload object
 * @returns {string} URL-encoded string
 */
function encodeStripePayload(payload) {
  const params = new URLSearchParams();
  
  function addParam(key, value) {
    if (value === null || value === undefined) return;
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      // Handle nested objects (e.g., metadata)
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        addParam(`${key}[${nestedKey}]`, nestedValue);
      }
    } else {
      params.append(key, String(value));
    }
  }
  
  for (const [key, value] of Object.entries(payload)) {
    addParam(key, value);
  }
  
  return params.toString();
}

/**
 * Calculates exponential backoff delay
 * 
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {number} Delay in milliseconds
 */
function calculateBackoff(attempt) {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 1000;
  return delay + jitter;
}

/**
 * Sleep utility function
 * 
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets a nested value from an object using dot notation
 * 
 * @param {Object} obj - Object to extract value from
 * @param {string} path - Dot-notation path
 * @returns {*} The value at the path, or undefined if not found
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Sets a nested value in an object using dot notation
 * 
 * @param {Object} obj - Object to set value in
 * @param {string} path - Dot-notation path
 * @param {*} value - Value to set
 */
function setNestedValue(obj, path, value) {
  const parts = path.split('.');
  const last = parts.pop();
  const target = parts.reduce((acc, part) => {
    if (!acc[part]) acc[part] = {};
    return acc[part];
  }, obj);
  target[last] = value;
}

/**
 * Flattens a nested object for query parameters
 * 
 * @param {Object} obj - Object to flatten
 * @param {string} prefix - Prefix for keys
 * @returns {Object} Flattened object
 */
function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}[${key}]` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }
  
  return flattened;
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
      sourceProtocol: 'GraphQL',
      targetProtocol: 'REST',
      timestamp: new Date().toISOString()
    }
  };

  // Add specific error details based on error type
  if (error instanceof GraphQLError) {
    errorResponse.error.graphqlErrors = error.graphqlErrors;
  } else if (error instanceof RestAPIError) {
    errorResponse.error.statusCode = error.statusCode;
    errorResponse.error.response = error.response;
  } else if (error instanceof RateLimitError) {
    errorResponse.error.retryAfter = error.retryAfter;
  }

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
  }

  return errorResponse;
}

// Export the main adapter function and helper classes
module.exports = {
  graphqlToRestAdapter,
  GraphQLError,
  RestAPIError,
  RateLimitError
};
