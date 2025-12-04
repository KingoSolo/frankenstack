export type IntentType = "payment" | "messaging" | "delivery" | "authentication" | "generic";

export const intentBlocks: Record<IntentType, string> = {
  payment: `
  // Payment processing logic
  payload.paymentRequest = {
    amount: payload.amount || 0,
    currency: payload.currency || "NGN",
    customer: payload.customer,
    reference: payload.orderId || payload.reference,
    description: payload.description || "Payment adapter"
  };
  `,
  messaging: `
  // Messaging logic
  payload.message = {
    to: payload.recipient,
    body: payload.text || "Default message",
    timestamp: Date.now()
  };
  `,
  delivery: `
  // Delivery logic
  payload.deliveryRequest = {
    orderId: payload.orderId,
    address: payload.address,
    instructions: payload.instructions || "No instructions"
  };
  `,
  authentication: `
  // Authentication logic
  payload.authToken = payload.token || null;
  payload.userId = payload.userId || null;
  `,
  generic: `
  // Generic transformation
  payload.meta = { ...payload.meta, transformed: true };
  `
};

export function detectIntent(description: string): IntentType {
  if (!description) return "generic";
  const desc = description.toLowerCase();

  if (["pay", "payment", "checkout", "transaction"].some(w => desc.includes(w))) return "payment";
  if (["message", "chat", "sms", "whatsapp"].some(w => desc.includes(w))) return "messaging";
  if (["deliver", "delivery", "shipment", "order"].some(w => desc.includes(w))) return "delivery";
  if (["login", "auth", "authenticate", "sign in"].some(w => desc.includes(w))) return "authentication";

  return "generic";
}
