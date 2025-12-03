// backend/src/services/KiroService.ts
import * as fs from 'fs';
import * as path from 'path';

// backend/src/services/KiroService.ts
export class KiroService {
  async generateAdapterCode(
    sourceProtocol: string,
    targetProtocol: string,
    userDescription: string,
    sourceEndpoint?: string,
    targetEndpoint?: string,
    examplePayload?: string
  ): Promise<string> {
    console.log(`🧪 Generating ${sourceProtocol} → ${targetProtocol} adapter...`);

    await new Promise(r => setTimeout(r, 300));

    const fnName = `${this.toPascal(sourceProtocol)}To${this.toPascal(targetProtocol)}Adapter`;
    const payloadVar = this.randomString(6);

    const safeDescription = userDescription
      ? userDescription.replace(/\*\//g, '')
      : 'No description provided.';

    // prettier code formatting with markdown-style highlights for the UI
    const code = `
/* ==========================================================
  ${sourceProtocol} → ${targetProtocol} Adapter
  Description: ${safeDescription}
  Generated: ${new Date().toISOString()}
========================================================== */

export async function ${fnName}(payload, config) {
  try {
    // --------------------------
    // Step 1: Capture payload
    // --------------------------
    const ${payloadVar} = payload;

    // --------------------------
    // Step 2: Handle endpoints
    // --------------------------
    ${sourceEndpoint ? `console.log("[Adapter] Reading from", config.sourceEndpoint);` : ''}
    ${targetEndpoint ? `console.log("[Adapter] Sending to", config.targetEndpoint);` : ''}

    // --------------------------
    // Step 3: Transform payload
    // --------------------------
    const transformed = {
      ...${payloadVar},
      meta: {
        description: \`${safeDescription}\`,
        from: "${sourceProtocol}",
        to: "${targetProtocol}",
        timestamp: Date.now()
      },
      example: ${examplePayload ? examplePayload : 'null'}
    };

    // --------------------------
    // Step 4: Return
    // --------------------------
    return { success: true, data: transformed };

  } catch (err) {
    return { success: false, error: err.message, meta: { timestamp: Date.now() } };
  }
}

/* --------------------------
  Example usage in your app
--------------------------
const result = await ${fnName}(
  { event: "payment_succeeded" },
  { targetEndpoint: "${targetEndpoint || 'https://your-api.com'}" }
);
*/
`;

    return code.trim();
  }

  private randomString(len: number) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let s = '';
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  private toPascal(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
