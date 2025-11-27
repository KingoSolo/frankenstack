# Protocol Adapters Overview

This directory contains production-ready protocol adapters for transforming data between different API protocols.

## 📦 Available Adapters

### 1. REST → GraphQL Adapter
**File:** `restToGraphQLAdapter.js`

Transforms REST API webhooks (like Stripe) into GraphQL mutations (like Shopify).

**Use Case:** When a Stripe payment succeeds, create an order in Shopify

**Flow:**
```
Stripe Webhook (REST/JSON)
    ↓
[Validate & Transform]
    ↓
Shopify GraphQL Mutation
    ↓
Order Created ✓
```

**Key Features:**
- ✅ Webhook payload validation
- ✅ Amount conversion (cents → dollars)
- ✅ Name splitting (full name → first/last)
- ✅ GraphQL mutation building
- ✅ Error handling (validation, GraphQL, network)

**Quick Start:**
```bash
node backend/src/adapters/testAdapter.js
```

---

### 2. GraphQL → REST Adapter
**File:** `graphqlToRestAdapter.js`

Queries GraphQL APIs (like Shopify) and transforms results into REST API calls (like Stripe).

**Use Case:** Sync Shopify products to Stripe as customer records

**Flow:**
```
Shopify GraphQL Query
    ↓
[Parse Nested Structure]
    ↓
[Transform to REST Payload]
    ↓
[Batch Process with Rate Limiting]
    ↓
Stripe REST API Calls
    ↓
Customers Created ✓
```

**Key Features:**
- ✅ Nested structure parsing (edges/nodes)
- ✅ Batch processing
- ✅ Rate limiting with exponential backoff
- ✅ Retry logic for failed requests
- ✅ Parallel processing within batches

**Quick Start:**
```bash
# With mock data
node backend/src/adapters/testGraphqlAdapter.js mock

# With real APIs
node backend/src/adapters/testGraphqlAdapter.js
```

---

## 🔄 Comparison

| Feature | REST → GraphQL | GraphQL → REST |
|---------|----------------|----------------|
| **Source** | Stripe (REST) | Shopify (GraphQL) |
| **Target** | Shopify (GraphQL) | Stripe (REST) |
| **Trigger** | Webhook event | Manual/scheduled |
| **Processing** | Single item | Batch processing |
| **Rate Limiting** | Basic | Advanced with backoff |
| **Retry Logic** | No | Yes (3 attempts) |
| **Use Case** | Event-driven | Data synchronization |

---

## 🚀 Usage Examples

### REST → GraphQL (Stripe → Shopify)

```javascript
const { restToGraphQLAdapter } = require('./restToGraphQLAdapter');

const stripeWebhook = {
  type: 'payment_intent.succeeded',
  data: {
    object: {
      amount: 5000,
      customer: { email: 'user@example.com', name: 'John Doe' },
      metadata: { product_id: 'gid://shopify/ProductVariant/123', quantity: 2 }
    }
  }
};

const config = {
  targetEndpoint: process.env.SHOPIFY_GRAPHQL_ENDPOINT,
  authentication: { token: process.env.SHOPIFY_ACCESS_TOKEN }
};

const result = await restToGraphQLAdapter(stripeWebhook, config);
```

### GraphQL → REST (Shopify → Stripe)

```javascript
const { graphqlToRestAdapter } = require('./graphqlToRestAdapter');

const query = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          variants(first: 1) {
            edges {
              node { price }
            }
          }
        }
      }
    }
  }
`;

const config = {
  sourceEndpoint: process.env.SHOPIFY_GRAPHQL_ENDPOINT,
  sourceAuth: { token: process.env.SHOPIFY_ACCESS_TOKEN },
  targetEndpoint: 'https://api.stripe.com/v1/customers',
  targetAuth: { token: process.env.STRIPE_SECRET_KEY },
  restMethod: 'POST',
  batchMode: true,
  batchSize: 5
};

const result = await graphqlToRestAdapter(query, { first: 10 }, config);
```

---

## 🔌 Express Routes

Both adapters are integrated into Express routes:

### Webhook Endpoints

```javascript
// REST → GraphQL
POST /webhooks/stripe-to-shopify
Body: Stripe webhook payload

// GraphQL → REST
POST /webhooks/shopify-to-stripe
Body: { variables: { first: 10 }, batchSize: 5 }

// Health check
GET /webhooks/health
```

### Start Server

```javascript
const express = require('express');
const webhookRouter = require('./routes/webhooks');

const app = express();
app.use(express.json());
app.use('/webhooks', webhookRouter);

app.listen(3000);
```

---

## 📊 Architecture

### REST → GraphQL Flow

```
┌─────────────┐
│   Stripe    │
│  (Webhook)  │
└──────┬──────┘
       │ REST/JSON
       ↓
┌─────────────────────┐
│  REST → GraphQL     │
│     Adapter         │
│                     │
│ 1. Validate         │
│ 2. Transform        │
│ 3. Build Mutation   │
│ 4. Execute          │
└──────┬──────────────┘
       │ GraphQL
       ↓
┌─────────────┐
│   Shopify   │
│  (GraphQL)  │
└─────────────┘
```

### GraphQL → REST Flow

```
┌─────────────┐
│   Shopify   │
│  (GraphQL)  │
└──────┬──────┘
       │ GraphQL Query
       ↓
┌─────────────────────┐
│  GraphQL → REST     │
│     Adapter         │
│                     │
│ 1. Execute Query    │
│ 2. Parse Response   │
│ 3. Transform Data   │
│ 4. Batch Process    │
│ 5. Rate Limit       │
│ 6. Retry on Fail    │
└──────┬──────────────┘
       │ REST/JSON (batched)
       ↓
┌─────────────┐
│   Stripe    │
│   (REST)    │
└─────────────┘
```

---

## 🛡️ Error Handling

Both adapters provide comprehensive error handling:

### Common Error Types

1. **ValidationError** - Invalid input data
2. **GraphQLError** - GraphQL execution failed
3. **RestAPIError** - REST API returned error
4. **RateLimitError** - Rate limit exceeded
5. **NetworkError** - Connection failed

### Error Response Format

```javascript
{
  success: false,
  error: {
    type: 'GraphQLError',
    message: 'Field not found',
    timestamp: '2024-01-15T10:30:00.000Z',
    // Additional error-specific fields
  },
  metadata: {
    sourceProtocol: 'REST',
    targetProtocol: 'GraphQL',
    timestamp: '2024-01-15T10:30:00.000Z'
  }
}
```

---

## 📝 Environment Variables

Required environment variables for both adapters:

```env
# Shopify
SHOPIFY_GRAPHQL_ENDPOINT=https://your-store.myshopify.com/admin/api/2024-01/graphql.json
SHOPIFY_ACCESS_TOKEN=shpat_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_API_ENDPOINT=https://api.stripe.com/v1/customers
STRIPE_WEBHOOK_SECRET=whsec_...

# Server
PORT=3000
NODE_ENV=development
```

---

## 🧪 Testing

### Test REST → GraphQL

```bash
node backend/src/adapters/testAdapter.js
```

### Test GraphQL → REST

```bash
# Mock test (no API calls)
node backend/src/adapters/testGraphqlAdapter.js mock

# Real API test
node backend/src/adapters/testGraphqlAdapter.js
```

### Test via HTTP

```bash
# REST → GraphQL
curl -X POST http://localhost:3000/webhooks/stripe-to-shopify \
  -H "Content-Type: application/json" \
  -d @stripe-webhook.json

# GraphQL → REST
curl -X POST http://localhost:3000/webhooks/shopify-to-stripe \
  -H "Content-Type: application/json" \
  -d '{"variables":{"first":5}}'
```

---

## 📚 Documentation

- **REST → GraphQL**: See `README.md` and `INTEGRATION_GUIDE.md`
- **GraphQL → REST**: See `GRAPHQL_ADAPTER_README.md`

---

## 🚀 Production Deployment

### Checklist

- [ ] Set production environment variables
- [ ] Use live API keys (not test keys)
- [ ] Enable HTTPS
- [ ] Set up monitoring and alerts
- [ ] Configure rate limiting
- [ ] Add webhook signature verification
- [ ] Set up logging to external service
- [ ] Test error scenarios
- [ ] Document runbook for common issues

### Recommended Hosting

- **Heroku**: Easy deployment, built-in logging
- **AWS Lambda**: Serverless, auto-scaling
- **DigitalOcean**: Simple, affordable
- **Vercel/Netlify**: Serverless functions

---

## 🤝 Contributing

When adding new adapters:

1. Follow the existing code structure
2. Include comprehensive error handling
3. Add detailed logging
4. Create test scripts
5. Write documentation
6. Add to this overview

---

## 📞 Support

- Check individual adapter READMEs for detailed docs
- Review test scripts for usage examples
- Open issues on GitHub for bugs
- Contact dev team for questions

---

## 🎯 Future Adapters

Potential adapters to add:

- **SOAP → REST**: Legacy systems to modern APIs
- **gRPC → GraphQL**: Microservices to GraphQL gateway
- **WebSocket → REST**: Real-time events to REST webhooks
- **REST → gRPC**: HTTP APIs to gRPC services

---

Happy integrating! 🎉
