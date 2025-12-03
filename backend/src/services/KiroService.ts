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
    const fnName = `${this.toPascal(sourceProtocol)}To${this.toPascal(targetProtocol)}Adapter`;
    const payloadVar = this.randomString(6);

    // Build code dynamically
    const code = `
/* ==========================================================
  ${sourceProtocol} → ${targetProtocol} Adapter
  Description: ${userDescription || "N/A"}
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
    ${sourceEndpoint ? `console.log("Source endpoint:", "${sourceEndpoint}");` : ""}
    ${targetEndpoint ? `console.log("Target endpoint:", config?.targetEndpoint || "${targetEndpoint}");` : ""}

    // --------------------------
    // Step 3: Transform payload
    // --------------------------
    const transformed = {
      ...${payloadVar},
      meta: {
        description: \`${userDescription}\`,
        from: "${sourceProtocol}",
        to: "${targetProtocol}",
        timestamp: Date.now()
      },
      example: ${examplePayload ? examplePayload : "null"}
    };

    // --------------------------
    // Step 4: Return transformed data
    // --------------------------
    return { success: true, data: transformed };

  } catch (err) {
    return { success: false, error: err.message, meta: { timestamp: Date.now() } };
  }
}

/* --------------------------
  Example usage
--------------------------
const result = await ${fnName}(
  { event: "example_event" },
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
