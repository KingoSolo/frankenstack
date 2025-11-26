// Load environment variables first
import "dotenv/config";

import { db } from "./db/client";
import { adapters } from "./db/schema/adapters";

async function testDatabase() {
  console.log("🧪 Testing database connection...\n");

  try {
    // 1. Insert a test row
    console.log("📝 Creating test adapter...");
    const [newAdapter] = await db.insert(adapters).values({
      userId: "demo-user",
      sourceProtocol: "REST",
      targetProtocol: "GraphQL",
      code: "async function transform(data) { return data; }",
      config: {
        description: "Test adapter for Stripe to Shopify",
        inputMethod: "natural-language",
      },
    }).returning();

    console.log("✅ Adapter created with ID:", newAdapter.id, "\n");

    // 2. Retrieve it
    console.log("📖 Fetching adapter from database...");
    const retrieved = await db.query.adapters.findFirst({
      where: (table, { eq }) => eq(table.id, newAdapter.id),
    });

    if (retrieved) {
      console.log("✅ Adapter retrieved!");
      console.log("   Created at:", retrieved.createdAt, "\n");
    }

    // 3. List all rows
    console.log("📋 Listing all adapters...");
    const allAdapters = await db.query.adapters.findMany();
    console.log(`✅ Total adapters: ${allAdapters.length}\n`);

    console.log("🎉 Database test passed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database test failed:\n", error);
    process.exit(1);
  }
}

testDatabase();
