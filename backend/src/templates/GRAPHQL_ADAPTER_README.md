# GraphQL to REST Adapter

Production-ready adapter that queries Shopify GraphQL API for products and creates corresponding customer records in Stripe REST API.

## 🎯 Overview

This adapter bridges GraphQL APIs (like Shopify) to REST APIs (like Stripe). It handles:

- ✅ GraphQL query execution
- ✅ Nested response parsing (edges/nodes pattern)
- ✅ Data transformation (GraphQL → REST JSON)
- ✅ Batch processing with rate limiting
- ✅ Exponential backoff retry logic
- ✅ Comprehensive error handling
- ✅ Production-ready code

## 📦 Installation

```bash
# Install required dependencies
npm install node-fetch
```

## 🚀 Quick Start

### 1. Set Environment Variables

```bash
export SHOPIFY_GRAPHQL_ENDPOINT="https://your-store.myshopify.com/admin/api/2024-01/graphql.json"
export SHOPIFY_ACCESS_TOKEN="shpat_your_access_token_here"
export STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
export STRIPE_API_ENDPOINT="https://api.stripe.com/v1/customers"
```

### 2. Use the Adapter

```javascript
const { graphqlToRestAdapter } = require('./graphqlToRestAdapter');

// GraphQL query
const query = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          variants(first: 1) {
            edges {
              node {
                price
              }
            }
          }
        }
      }
    }
  }
`;

const variables = { first: 10 };

// Configuration
const config = {
  sourceEndpoint: process.env.SHOPIFY_GRAPHQL_ENDPOINT,
  sourceAuth: {
    token: process.env.SHOPIFY_ACCESS_TOKEN
  },
  targetEndpoint: process.env.STRIPE_API_ENDPOINT,
  targetAuth: {
    token: process.env.STRIPE_SECRET_KEY
  },
  restMethod: 'POST',
  batchMode: true,
  batchSize: 5,
  batchDelay: 1000
};

// Execute
const result = await graphqlToRestAdapter(query, variables, config);

if (result.success) {
  console.log(`Synced ${result.data.processed} products`);
} else {
  console.error('Error:', result.error.message);
}
```

### 3. Run Test Script

```bash
# Test with real APIs
node backend/src/adapters/testGraphqlAdapter.js

# Test with mock data (no API calls)
node backend/src/adapters/testGraphqlAdapter.js mock
```

## 🔧 Configuration

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sourceEndpoint` | string | GraphQL API endpoint | `https://store.myshopify.com/admin/api/2024-01/graphql.json` |
| `sourceAuth.token` | string | GraphQL auth token | `shpat_abc123...` |
| `targetEndpoint` | string | REST API endpoint | `https://api.stripe.com/v1/customers` |
| `targetAuth.token` | string | REST API auth token | `sk_test_abc123...` |
| `restMethod` | string | HTTP method | `POST`, `GET`, `PUT`, `DELETE` |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `batchMode` | boolean | Enable batch processing | `true` |
| `batchSize` | number | Items per batch | `5` |
| `batchDelay` | number | Delay between batches (ms) | `1000` |
| `mappings` | object | Custom field mappings | `{}` |

## 📊 Data Flow

### 1. GraphQL Query Execution

```graphql
query GetProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        title
        variants(first: 1) {
          edges {
            node {
              price
            }
          }
        }
      }
    }
  }
}
```

### 2. Nested Structure Parsing

The adapter automatically flattens Shopify's nested `edges/nodes` structure:

```javascript
// Raw GraphQL response
{
  products: {
    edges: [
      {
        node: {
          id: "gid://shopify/Product/123",
          title: "T-Shirt",
          variants: {
            edges: [{ node: { price: "29.99" } }]
          }
        }
      }
    ]
  }
}

// Parsed to
[
  {
    id: "gid://shopify/Product/123",
    title: "T-Shirt",
    firstVariant: { price: "29.99" }
  }
]
```

### 3. Data Transformation

Each product is transformed to a Stripe customer payload:

```javascript
// Shopify product
{
  id: "gid://shopify/Product/123",
  title: "Awesome T-Shirt",
  firstVariant: { price: "29.99" }
}

// Stripe customer payload
{
  description: "Product: Awesome T-Shirt",
  metadata: {
    shopify_product_id: "gid://shopify/Product/123",
    product_title: "Awesome T-Shirt",
    price: "29.99",
    source: "shopify_sync",
    synced_at: "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. REST API Call

```http
POST https://api.stripe.com/v1/customers
Authorization: Bearer sk_test_...
Content-Type: application/x-www-form-urlencoded

description=Product%3A+Awesome+T-Shirt&metadata[shopify_product_id]=gid%3A%2F%2Fshopify%2FProduct%2F123&metadata[product_title]=Awesome+T-Shirt&metadata[price]=29.99&metadata[source]=shopify_sync&metadata[synced_at]=2024-01-15T10%3A30%3A00.000Z
```

## 🔄 Batch Processing

The adapter processes items in batches to avoid rate limiting:

```javascript
const config = {
  // ... other config
  batchMode: true,
  batchSize: 5,      // Process 5 items at a time
  batchDelay: 1000   // Wait 1 second between batches
};
```

**Example with 12 products:**
- Batch 1: Products 1-5 (parallel)
- Wait 1 second
- Batch 2: Products 6-10 (parallel)
- Wait 1 second
- Batch 3: Products 11-12 (parallel)

## 🔁 Retry Logic with Exponential Backoff

The adapter automatically retries failed requests:

### Rate Limiting (429)
```
Attempt 1: Immediate
Attempt 2: Wait ~1 second
Attempt 3: Wait ~2 seconds
```

### Server Errors (5xx)
```
Attempt 1: Immediate
Attempt 2: Wait ~1 second + jitter
Attempt 3: Wait ~2 seconds + jitter
```

### Client Errors (4xx)
No retry - fails immediately

## 🛡️ Error Handling

### 1. GraphQL Errors

```javascript
{
  "success": false,
  "error": {
    "type": "GraphQLError",
    "message": "GraphQL execution failed",
    "graphqlErrors": [
      {
        "message": "Field 'products' doesn't exist on type 'QueryRoot'",
        "locations": [{ "line": 2, "column": 3 }]
      }
    ]
  }
}
```

### 2. REST API Errors

```javascript
{
  "success": false,
  "error": {
    "type": "RestAPIError",
    "message": "Invalid API Key provided",
    "statusCode": 401,
    "response": {
      "error": {
        "type": "invalid_request_error",
        "message": "Invalid API Key provided"
      }
    }
  }
}
```

### 3. Rate Limit Errors

```javascript
{
  "success": false,
  "error": {
    "type": "RateLimitError",
    "message": "Rate limit exceeded",
    "retryAfter": 5
  }
}
```

## 📝 Logging

Detailed console logging for debugging:

```
[Adapter] Starting GraphQL to REST transformation
[Adapter] Source: Shopify GraphQL API
[Adapter] Target: Stripe REST API
[GraphQL] Executing query...
[GraphQL] ✓ Query successful
[Adapter] ✓ GraphQL query executed successfully
[Parser] Parsing nested GraphQL structure...
[Parser] ✓ Extracted 10 products
[Adapter] ✓ Parsed 10 items from GraphQL response
[Adapter] Processing in batch mode...
[Batch] Processing 10 items in batches of 5
[Batch] Processing batch 1/2
[Transformer] Transforming product: Awesome T-Shirt
[Transformer] ✓ Transformation complete
[REST] POST https://api.stripe.com/v1/customers
[REST] ✓ Request successful
[Batch] ✓ Item 1/10 processed
...
[Batch] Waiting 1000ms before next batch...
[Batch] ✓ Batch processing complete: 10/10 successful
[Adapter] ✓ All REST API calls completed
```

## 🔌 Express Integration

```javascript
const express = require('express');
const webhookRouter = require('./routes/webhooks');

const app = express();
app.use(express.json());
app.use('/webhooks', webhookRouter);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

Trigger sync: `POST http://localhost:3000/webhooks/shopify-to-stripe`

## 🧪 Testing

### Test with Mock Data

```bash
node backend/src/adapters/testGraphqlAdapter.js mock
```

Output:
```
╔════════════════════════════════════════════════════════════╗
║  GraphQL to REST Adapter - Mock Test                      ║
╚════════════════════════════════════════════════════════════╝

📦 Mock GraphQL Response:
{
  "products": {
    "edges": [
      {
        "node": {
          "id": "gid://shopify/Product/123",
          "title": "Awesome T-Shirt",
          "variants": {
            "edges": [{ "node": { "price": "29.99" } }]
          }
        }
      }
    ]
  }
}

📊 Expected Stripe Payloads:
1. Awesome T-Shirt:
{
  "description": "Product: Awesome T-Shirt",
  "metadata": {
    "shopify_product_id": "gid://shopify/Product/123",
    "product_title": "Awesome T-Shirt",
    "price": "29.99",
    "source": "shopify_sync",
    "synced_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Test with Real APIs

```bash
export SHOPIFY_GRAPHQL_ENDPOINT="https://test-store.myshopify.com/admin/api/2024-01/graphql.json"
export SHOPIFY_ACCESS_TOKEN="shpat_test_token"
export STRIPE_SECRET_KEY="sk_test_key"

node backend/src/adapters/testGraphqlAdapter.js
```

### Test with cURL

```bash
curl -X POST http://localhost:3000/webhooks/shopify-to-stripe \
  -H "Content-Type: application/json" \
  -d '{
    "variables": { "first": 5 },
    "batchSize": 3,
    "batchDelay": 2000
  }'
```

## 🎨 Customization

### Custom Field Mappings

```javascript
const config = {
  // ... other config
  mappings: {
    'title': 'name',
    'description': 'description',
    'id': 'metadata.shopify_id'
  }
};
```

### Custom GraphQL Query

```javascript
const customQuery = `
  query GetProductsWithImages($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
        }
      }
    }
  }
`;
```

### Different REST Endpoints

```javascript
// Create products instead of customers
const config = {
  targetEndpoint: 'https://api.stripe.com/v1/products',
  restMethod: 'POST',
  // ... other config
};
```

## 🚀 Deployment

### Environment Variables

```env
# Shopify
SHOPIFY_GRAPHQL_ENDPOINT=https://your-store.myshopify.com/admin/api/2024-01/graphql.json
SHOPIFY_ACCESS_TOKEN=shpat_...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_API_ENDPOINT=https://api.stripe.com/v1/customers

# Server
PORT=3000
NODE_ENV=production
```

### Production Considerations

1. **Use live API keys** (not test keys)
2. **Enable HTTPS** for secure communication
3. **Monitor rate limits** and adjust batch settings
4. **Log to external service** (e.g., Datadog, Sentry)
5. **Set up alerts** for failed syncs
6. **Use queue system** for large batches (Bull, RabbitMQ)

## 🐛 Troubleshooting

### "GraphQL execution failed"

**Cause**: Invalid query or missing permissions

**Solution**: 
- Verify query syntax in Shopify GraphQL Explorer
- Check Shopify app has `read_products` scope

### "Rate limit exceeded"

**Cause**: Too many requests to Stripe

**Solution**:
- Increase `batchDelay` (e.g., 2000ms)
- Decrease `batchSize` (e.g., 3)
- The adapter will automatically retry with backoff

### "Invalid API Key provided"

**Cause**: Wrong or expired Stripe key

**Solution**:
- Verify `STRIPE_SECRET_KEY` is correct
- Use test key (`sk_test_...`) for testing
- Use live key (`sk_live_...`) for production

### "Field 'products' doesn't exist"

**Cause**: Wrong GraphQL endpoint or API version

**Solution**:
- Verify endpoint URL includes correct API version
- Example: `/admin/api/2024-01/graphql.json`

## 📚 API Reference

### `graphqlToRestAdapter(query, variables, config)`

Main adapter function.

**Parameters:**
- `query` (string): GraphQL query string
- `variables` (Object): Query variables
- `config` (Object): Configuration object

**Returns:**
- Promise<Object>: Result with `success`, `data`, `error`, and `metadata`

**Example:**
```javascript
const result = await graphqlToRestAdapter(query, variables, config);
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please add tests for new features.

## 📞 Support

For issues or questions, open an issue on GitHub.
