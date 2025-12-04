import { detectIntent, intentBlocks, IntentType } from "./smartIntentEngine";

export class KiroService {
  generateAdapterCode(description: string, payload: any) {
    // 1. Detect intent safely
    const intent: IntentType = detectIntent(description);

    // 2. Get correct code block
    const block = intentBlocks[intent];

    // 3. Build fully dynamic, descriptive adapter code
    return `
/* ==========================================================
  Dynamic Adapter
  Description: ${description}
  Detected Intent: ${intent}
  Generated: ${new Date().toISOString()}
========================================================== */

export async function DynamicAdapter(payload, config) {
  try {
    console.log("[DynamicAdapter] Starting transformation...");

    // --------------------------
    // Intent Block (Auto-Generated)
    // --------------------------
    ${block}

    // --------------------------
    // Validate targetEndpoint
    // --------------------------
    if (!config?.targetEndpoint) throw new Error("Missing targetEndpoint in config");

    // --------------------------
    // Send data to endpoint
    // --------------------------
    const response = await fetch(config.targetEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      data: await response.json(),
      meta: {
        description: "${description}",
        detectedIntent: "${intent}",
        timestamp: Date.now()
      }
    };

  } catch (err) {
    console.error("[DynamicAdapter] Error:", err.message);
    return {
      success: false,
      error: err.message,
      meta: { timestamp: Date.now() }
    };
  }
}

/* --------------------------
Example usage
--------------------------
const result = await DynamicAdapter(
  { amount: 5000, customer: "Solomon", orderId: "123ABC" },
  { targetEndpoint: "https://your-api.com" }
);
*/
`;
  }
}
