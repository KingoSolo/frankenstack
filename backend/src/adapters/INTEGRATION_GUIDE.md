# Integration Guide: Stripe → Shopify Adapter

This guide walks you through integrating the REST-to-GraphQL adapter into your application.

## 🎯 Prerequisites

- Node.js 14+ installed
- Shopify store with Admin API access
- Stripe account with webhook capability
- Basic knowledge of Express.js

## 📋 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install node-fetch express dotenv
```

### Step 2: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
SHOPIFY_GRAPHQL_ENDPOINT=https://your-store.myshopify.com/admin/api/2024-01/graphql.json
SHOPIFY_ACCESS_TOKEN=shpat_abc123def456...
PORT=3000
NODE_ENV=development
```

### Step 3: Get Shopify Credentials

1. Go to your Shopify Admin panel
2. Navigate to **Settings** → **Apps and sales channels** → **Develop apps**
3. Click **Create an app**
4. Name it "Stripe Integration" or similar
5. Go to **Configuration** tab
6. Under **Admin API access scopes**, select:
   - `write_orders`
   - `read_products`
   - `read_customers`
7. Click **Save**
8. Go to **API credentials** tab
9. Click **Install app**
10. Copy the **Admin API access token** (starts with `shpat_`)
11. Your GraphQL endpoint will be: `https://YOUR-STORE.myshopify.com/admin/api/2024-01/graphql.json`

### Step 4: Integrate into Your Express App

Update your main server file (e.g., `backend/src/index.js`):

```javascript
const express = require('express');
const webhookRouter = require('./routes/webhooks');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/webhooks', webhookRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhooks/stripe-to-shopify`);
});
```

### Step 5: Test Locally

Run the test script to verify everything works:

```bash
node backend/src/adapters/testAdapter.js
```

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║  REST to GraphQL Adapter - Test Script                    ║
╚════════════════════════════════════════════════════════════╝

[Adapter] Starting REST to GraphQL transformation
[Adapter] ✓ Payload validation passed
[Transformer] Mapped fields:
  - Email: john.doe@example.com
  - Name: John Doe
  - Total: USD 50.00
  - Product: gid://shopify/ProductVariant/123456789 (qty: 2)
[Adapter] ✓ Data transformation complete
[GraphQL] ✓ Request successful
✅ SUCCESS! Order created in Shopify
```

### Step 6: Start Your Server

```bash
npm run dev
# or
node backend/src/index.js
```

### Step 7: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL:
   - Development: Use [ngrok](https://ngrok.com/) to expose localhost
     ```bash
     ngrok http 3000
     # Use the HTTPS URL: https://abc123.ngrok.io/webhooks/stripe-to-shopify
     ```
   - Production: `https://yourdomain.com/webhooks/stripe-to-shopify`
4. Select events to listen to:
   - `payment_intent.succeeded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### Step 8: Test with Real Stripe Webhook

#### Option A: Use Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/webhooks/stripe-to-shopify

# Trigger a test event
stripe trigger payment_intent.succeeded
```

#### Option B: Use Stripe Dashboard

1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **Send test webhook**
4. Select `payment_intent.succeeded`
5. Click **Send test webhook**

### Step 9: Verify in Shopify

1. Go to Shopify Admin → **Orders**
2. You should see a new order created
3. Check the order details:
   - Customer email matches Stripe
   - Amount matches Stripe payment
   - Order tagged with "stripe" and "automated"

## 🔧 Customization

### Add Custom Product Mapping

If you need to map Stripe products to Shopify products dynamically:

```javascript
// In your webhook handler
const productMapping = {
  'stripe_prod_123': 'gid://shopify/ProductVariant/111',
  'stripe_prod_456': 'gid://shopify/ProductVariant/222'
};

const stripeProductId = req.body.data.object.metadata.product_id;
const shopifyVariantId = productMapping[stripeProductId];

// Add to metadata
req.body.data.object.metadata.product_id = shopifyVariantId;
```

### Add Webhook Signature Verification

For production, verify Stripe webhook signatures:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/stripe-to-shopify', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Now process the verified event
    // ... rest of your code
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

### Add Retry Logic

For production resilience:

```javascript
async function executeWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Use it
const result = await executeWithRetry(() => 
  restToGraphQLAdapter(stripePayload, config)
);
```

## 🚀 Deployment

### Deploy to Production

1. **Set environment variables** on your hosting platform
2. **Enable HTTPS** (required for Stripe webhooks)
3. **Update Stripe webhook URL** to production URL
4. **Monitor logs** for any errors
5. **Set up alerts** for failed webhooks

### Recommended Hosting Platforms

- **Heroku**: Easy deployment, built-in logging
- **AWS Lambda**: Serverless, auto-scaling
- **DigitalOcean App Platform**: Simple, affordable
- **Vercel/Netlify**: For serverless functions

### Example: Deploy to Heroku

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set SHOPIFY_GRAPHQL_ENDPOINT=https://...
heroku config:set SHOPIFY_ACCESS_TOKEN=shpat_...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

## 📊 Monitoring

### Log Important Events

```javascript
// Add to your webhook handler
console.log('Webhook received:', {
  type: req.body.type,
  paymentId: req.body.data.object.id,
  amount: req.body.data.object.amount,
  customer: req.body.data.object.customer.email
});
```

### Track Success/Failure Rates

```javascript
let successCount = 0;
let failureCount = 0;

// After adapter execution
if (result.success) {
  successCount++;
} else {
  failureCount++;
}

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    success: successCount,
    failure: failureCount,
    successRate: (successCount / (successCount + failureCount) * 100).toFixed(2) + '%'
  });
});
```

## 🐛 Common Issues

### Issue: "Product variant not found"

**Cause**: Invalid Shopify product variant ID

**Solution**: 
1. Get valid variant IDs from Shopify Admin
2. Format: `gid://shopify/ProductVariant/123456789`
3. Store mapping in database or config

### Issue: "Insufficient permissions"

**Cause**: Shopify access token lacks required scopes

**Solution**: 
1. Go to Shopify app configuration
2. Add `write_orders` scope
3. Reinstall the app
4. Get new access token

### Issue: "Webhook timeout"

**Cause**: Shopify API is slow or rate-limited

**Solution**:
1. Implement retry logic
2. Use queue system (Bull, RabbitMQ)
3. Return 200 immediately, process async

## 📚 Next Steps

- [ ] Add webhook signature verification
- [ ] Implement retry logic with exponential backoff
- [ ] Add database logging for audit trail
- [ ] Create admin dashboard to view webhook history
- [ ] Add support for other Stripe events (refunds, disputes)
- [ ] Implement rate limiting
- [ ] Add unit tests
- [ ] Set up monitoring and alerts

## 🤝 Support

Need help? Check:
- [Shopify GraphQL Admin API Docs](https://shopify.dev/api/admin-graphql)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- Project README: `backend/src/adapters/README.md`

Happy integrating! 🎉
