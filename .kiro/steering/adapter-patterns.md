# Adapter Code Patterns
**Steering Document for Kiro Code Generation**

This document defines coding conventions, patterns, and best practices that Kiro should follow when generating adapter code for FrankenStack.

---

## 1. File Structure

### Module Exports

Every adapter must export a single main function:
```javascript
// ✅ GOOD: Clear, single export
module.exports = { restToGraphQLAdapter };

// ❌ BAD: Multiple exports, unclear purpose
module.exports = { adapter, helper1, helper2 };
```

### Function Naming Convention
```javascript
// Pattern: {source}To{target}Adapter
async function restToGraphQLAdapter(payload, config) { }
async function graphqlToRestAdapter(query, variables, config) { }
async function grpcToSoapAdapter(request, config) { }
```

---

## 2. Error Handling

### Always Use Try-Catch
```javascript
// ✅ GOOD: Comprehensive error handling
async function adapter(payload, config) {
  try {
    const result = await processData(payload);
    return { success: true, data: result };
  } catch (error) {
    return handleError(error);
  }
}

// ❌ BAD: No error handling
async function adapter(payload, config) {
  const result = await processData(payload);
  return result;
}
```

### Error Response Format

All errors must return this structure:
```javascript
function handleError(error) {
  return {
    success: false,
    error: {
      type: error.constructor.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    },
    metadata: {
      timestamp: new Date().toISOString()
    }
  };
}
```

### Custom Error Classes
```javascript
// Define specific error types
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class GraphQLError extends Error {
  constructor(errors) {
    super('GraphQL query failed');
    this.name = 'GraphQLError';
    this.graphqlErrors = errors;
  }
}
```

---

## 3. Data Transformation

### Use Helper Functions
```javascript
// ✅ GOOD: Separate concerns
function transformData(input, mappings) {
  const output = {};
  for (const [sourceField, targetField] of Object.entries(mappings)) {
    output[targetField] = getNestedValue(input, sourceField);
  }
  return output;
}

// ❌ BAD: Inline transformation logic
function adapter(payload, config) {
  const output = {};
  output.name = payload.data.customer.name;
  output.email = payload.data.customer.email;
  // ... 50 more lines of mapping
}
```

### Nested Value Access

Always use safe navigation:
```javascript
// ✅ GOOD: Safe nested access
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

// Usage
const email = getNestedValue(data, 'customer.contact.email');

// ❌ BAD: Unsafe access (can throw errors)
const email = data.customer.contact.email;
```

---

## 4. API Calls

### Use Fetch with Proper Headers
```javascript
// ✅ GOOD: Complete fetch configuration
async function callAPI(endpoint, payload, auth) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`,
      'User-Agent': 'FrankenStack/1.0',
      ...auth.additionalHeaders
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new APIError(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}
```

### Rate Limiting

Implement exponential backoff for 429 responses:
```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || Math.pow(2, i);
        await sleep(retryAfter * 1000);
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

---

## 5. Comments and Documentation

### Function Documentation
```javascript
/**
 * Transform REST webhook payload to GraphQL mutation variables
 * 
 * @param {Object} restPayload - The incoming REST webhook payload
 * @param {Object} mappings - Field mapping configuration (REST → GraphQL)
 * @returns {Object} GraphQL variables object
 * 
 * @example
 * const variables = transformData(
 *   { customer: { email: 'test@example.com' } },
 *   { 'customer.email': 'email' }
 * );
 * // Returns: { email: 'test@example.com' }
 */
function transformData(restPayload, mappings) {
  // Implementation
}
```

### Inline Comments
```javascript
// ✅ GOOD: Explain WHY, not WHAT
// Stripe signatures expire after 5 minutes, so we validate timestamp first
const timestamp = request.headers['stripe-signature-timestamp'];

// ❌ BAD: Stating the obvious
// Get timestamp from headers
const timestamp = request.headers['stripe-signature-timestamp'];
```

---

## 6. Configuration Objects

### Standard Config Structure
```javascript
interface AdapterConfig {
  // Source protocol settings
  sourceEndpoint: string;
  sourceAuth: {
    type: 'bearer' | 'apiKey' | 'oauth';
    token?: string;
    apiKey?: string;
    additionalHeaders?: Record<string, string>;
  };
  
  // Target protocol settings
  targetEndpoint: string;
  targetAuth: {
    type: 'bearer' | 'apiKey' | 'oauth';
    token?: string;
    apiKey?: string;
    additionalHeaders?: Record<string, string>;
  };
  
  // Transformation settings
  mappings: Record<string, string>;
  
  // Optional settings
  timeout?: number;  // milliseconds
  retries?: number;  // max retry attempts
  rateLimitPerMinute?: number;
}
```

### Validate Config

Always validate required fields:
```javascript
function validateConfig(config) {
  const required = ['sourceEndpoint', 'targetEndpoint', 'mappings'];
  
  for (const field of required) {
    if (!config[field]) {
      throw new ValidationError(`Missing required config field: ${field}`);
    }
  }
  
  // Validate URLs
  try {
    new URL(config.sourceEndpoint);
    new URL(config.targetEndpoint);
  } catch (error) {
    throw new ValidationError('Invalid endpoint URL');
  }
}
```

---

## 7. Testing Patterns

### Test Structure
```javascript
describe('REST to GraphQL Adapter', () => {
  // Setup
  const mockConfig = {
    sourceEndpoint: 'https://api.example.com',
    targetEndpoint: 'https://graphql.example.com',
    mappings: { 'data.email': 'email' }
  };
  
  // Happy path
  it('should transform valid REST payload', async () => {
    const payload = { data: { email: 'test@example.com' } };
    const result = await restToGraphQLAdapter(payload, mockConfig);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
  
  // Error cases
  it('should handle missing fields', async () => {
    const payload = { data: {} };
    const result = await restToGraphQLAdapter(payload, mockConfig);
    
    expect(result.success).toBe(false);
    expect(result.error.type).toBe('ValidationError');
  });
});
```

---

## 8. Performance Considerations

### Avoid Unnecessary Loops
```javascript
// ✅ GOOD: Single pass transformation
const transformed = Object.entries(mappings).reduce((acc, [src, tgt]) => {
  acc[tgt] = getNestedValue(data, src);
  return acc;
}, {});

// ❌ BAD: Multiple passes
const transformed = {};
for (const key in mappings) {
  transformed[mappings[key]] = getNestedValue(data, key);
}
```

### Cache Repeated Calculations
```javascript
// ✅ GOOD: Cache authentication header
const authHeader = `Bearer ${config.auth.token}`;
for (const request of requests) {
  await fetch(url, { headers: { 'Authorization': authHeader } });
}

// ❌ BAD: Rebuild header each time
for (const request of requests) {
  await fetch(url, { headers: { 'Authorization': `Bearer ${config.auth.token}` } });
}
```

---

## 9. Security Best Practices

### Never Log Sensitive Data
```javascript
// ✅ GOOD: Redact sensitive fields
console.log('Config:', {
  ...config,
  sourceAuth: { ...config.sourceAuth, token: '[REDACTED]' }
});

// ❌ BAD: Logs API keys
console.log('Config:', config);
```

### Validate Input
```javascript
// Always validate and sanitize user input
function sanitizeEndpoint(endpoint) {
  try {
    const url = new URL(endpoint);
    // Only allow HTTPS in production
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      throw new Error('HTTPS required in production');
    }
    return url.href;
  } catch (error) {
    throw new ValidationError('Invalid endpoint URL');
  }
}
```

---

## 10. Code Style

### Use Modern JavaScript
```javascript
// ✅ GOOD: async/await
async function fetchData() {
  const response = await fetch(url);
  return await response.json();
}

// ❌ BAD: Callbacks
function fetchData(callback) {
  fetch(url).then(r => r.json()).then(callback);
}
```

### Destructuring
```javascript
// ✅ GOOD: Destructure for clarity
const { sourceEndpoint, targetEndpoint, mappings } = config;

// ❌ BAD: Repeated object access
const endpoint1 = config.sourceEndpoint;
const endpoint2 = config.targetEndpoint;
const maps = config.mappings;
```

---

## Summary

When generating adapter code, Kiro should:

✅ Follow consistent naming conventions  
✅ Include comprehensive error handling  
✅ Use helper functions for transformations  
✅ Implement rate limiting and retries  
✅ Add clear documentation  
✅ Validate all inputs  
✅ Write secure, performant code  
✅ Use modern JavaScript features  

These patterns ensure all generated adapters are production-ready, maintainable, and secure.