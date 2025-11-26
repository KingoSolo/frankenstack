# REST to GraphQL Adapter

Production-ready adapter that transforms Stripe payment webhooks into Shopify GraphQL order creation mutations.

## 🎯 Overview

This adapter bridges the gap between REST APIs (like Stripe webhooks) and GraphQL APIs (like Shopify Admin API). It handles:

- ✅ Data transformation (REST JSON → GraphQL variables)
- ✅ Field mapping (Stripe fields → Shopify fields)
- ✅ Authentication (Shopify access tokens)
- ✅ Error handling (validation, network, GraphQL errors)
- ✅ Logging and debugging
- ✅ Production-ready code

## 📦 Installation

```bash
# Install required dependencies
npm install node-fetch express
```

## 🚀 Quick Start

### 1. Set Environment Variables

```bash
export SHOPIFY_GRAPHQL_ENDPOINT="https://your-store.myshopify.com/admin/api/2024-01/graphql.json"
export SHOPIFY_ACCESS_TOKEN="shpat_your_access_token_here"
```

### 2. Use the Adapter

```javascript
const { restToGraphQLAdapter } = require('./restToGraphQLAdapter');

// Stripe webhook payload
const stripePayload = {
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_123',
      amount: 5000, // $50.00
      currency: 'usd',
      customer: {
        email: 'customer@example.com',
        name: 'John Doe'
      },
      metadata: {
        product_id: 'gid://shopify/ProductVariant/123456',
        quantity: 2
      }
    }
  }
};

// Configuration
const config = {
  targetEndpoint: process.env.SHOPIFY_GRAPHQL_ENDPOINT,
  authentication: {
    token: process.env.SHOPIFY_ACCESS_TOKEN
  }
};

// Execute
const result = await restToGraphQLAdapter(stripePayload, config);

if (result.success) {
  console.log('Order created:', result.data.orderCreate.order.id);
} else {
  console.error('Error:', result.error.message);
}
```

### 3. Run Test Script

```bash
node backend/src/adapters/testAdapter.js
```

## 🔧 Configuration

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `targetEndpoint` | string | Shopify GraphQL API URL | `https://store.myshopify.com/admin/api/2024-01/graphql.json` |
| `authentication.token` | string | Shopify access token | `shpat_abc123...` |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `authentication.additionalHeaders` | object | Extra HTTP headers | `{}` |
| `mappings` | object | Custom field mappings | Auto-mapped |
| `sourceSchema` | object | Validation schema | `null` |

## 📊 Field Mappings

The adapter automatically maps Stripe webhook fields to Shopify GraphQL variables:

| Stripe Field | Shopify Variable | Transformation |
|--------------|------------------|----------------|
| `data.object.customer.email` | `email` | Direct mapping |
| `data.object.customer.name` | `firstName`, `lastName` | Split on space |
| `data.object.amount` | `totalPrice` | Cents → Dollars |
| `data.object.currency` | `currency` | Uppercase |
| `data.object.metadata.product_id` | `productId` | Direct mapping |
| `data.object.metadata.quantity` | `quantity` | Parse to integer |
| `data.object.id` | `stripePaymentId` | Direct mapping |

## 🔌 Express Integration

```javascript
const express = require('express');
const webhookRouter = require('./routes/webhooks');

const app = express();
app.use(express.json());
app.use('/webhooks', webhookRouter);

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

Then send webhooks to: `POST http://localhost:3000/webhooks/stripe-to-shopify`

## 🧪 Testing

### Test with Sample Data

```bash
# Set environment variables
export SHOPIFY_GRAPHQL_ENDPOINT="https://test-store.myshopify.com/admin/api/2024-01/graphql.json"
export SHOPIFY_ACCESS_TOKEN="shpat_test_token"

# Run test
node backend/src/adapters/testAdapter.js
```

### Test with cURL

```bash
curl -X POST http://localhost:3000/webhooks/stripe-to-shopify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "amount": 5000,
        "currency": "usd",
        "customer": {
          "email": "test@example.com",
          "name": "Test User"
        },
        "metadata": {
          "product_id": "gid://shopify/ProductVariant/123456",
          "quantity": 1
        }
      }
    }
  }'
```

## 🛡️ Error Handling

The adapter handles three types of errors:

### 1. Validation Errors

```javascript
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Missing required field: data.object.customer.email",
    "field": "customer.email"
  }
}
```

### 2. GraphQL Errors

```javascript
{
  "success": false,
  "error": {
    "type": "GraphQLError",
    "message": "GraphQL execution failed",
    "graphqlErrors": [
      {
        "field": ["lineItems", 0, "variantId"],
        "message": "Product variant not found"
      }
    ]
  }
}
```

### 3. Network Errors

```javascript
{
  "success": false,
  "error": {
    "type": "Error",
    "message": "GraphQL request failed: HTTP 401: Unauthorized"
  }
}
```

## 📝 Logging

The adapter provides detailed console logging:

```
[Adapter] Starting REST to GraphQL transformation
[Adapter] Source: Stripe webhook
[Adapter] Target: Shopify GraphQL API
[Adapter] ✓ Payload validation passed
[Transformer] Mapped fields:
  - Email: customer@example.com
  - Name: John Doe
  - Total: USD 50.00
  - Product: gid://shopify/ProductVariant/123456 (qty: 2)
[Adapter] ✓ Data transformation complete
[Adapter] ✓ GraphQL mutation built
[GraphQL] Executing request to: https://store.myshopify.com/...
[GraphQL] ✓ Request successful
[Adapter] ✓ GraphQL execution successful
```

## 🔐 Security Best Practices

1. **Never commit tokens**: Use environment variables
2. **Validate webhooks**: Add Stripe signature verification
3. **Rate limiting**: Implement rate limiting on webhook endpoints
4. **HTTPS only**: Always use HTTPS in production
5. **Error messages**: Don't expose sensitive data in error messages

## 🎨 Customization

### Custom Field Mappings

```javascript
const config = {
  targetEndpoint: '...',
  authentication: { token: '...' },
  mappings: {
    'data.object.custom_field': 'myCustomVariable'
  }
};
```

### Custom Validation

```javascript
const config = {
  targetEndpoint: '...',
  authentication: { token: '...' },
  sourceSchema: {
    requiredFields: ['data.object.amount', 'data.object.customer.email'],
    minAmount: 100 // cents
  }
};
```

## 📚 API Reference

### `restToGraphQLAdapter(restPayload, config)`

Main adapter function.

**Parameters:**
- `restPayload` (Object): Stripe webhook payload
- `config` (Object): Configuration object

**Returns:**
- Promise<Object>: Result object with `success`, `data`, `error`, and `metadata`

**Example:**
```javascript
const result = await restToGraphQLAdapter(payload, config);
```

## 🐛 Troubleshooting

### "Missing required field: data.object.customer.email"

**Solution**: Ensure Stripe webhook includes customer information. In Stripe dashboard, expand event data to include customer details.

### "Product variant not found"

**Solution**: Verify the `product_id` in Stripe metadata matches a valid Shopify product variant ID (format: `gid://shopify/ProductVariant/123456`).

### "HTTP 401: Unauthorized"

**Solution**: Check that `SHOPIFY_ACCESS_TOKEN` is valid and has `write_orders` permission.

### "GraphQL execution failed"

**Solution**: Enable development mode to see full error details:
```bash
export NODE_ENV=development
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and add tests for new features.

## 📞 Support

For issues or questions, please open an issue on GitHub or contact the development team.
