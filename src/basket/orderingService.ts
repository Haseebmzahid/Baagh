import { orderRequestMessage, validateDelivery } from './orderRequest.ts';
import type { DeliveryDetails, DeliveryErrors, RequestItem } from './orderRequest.ts';

export interface OrderRequestInput {
  items: RequestItem[];
  details: DeliveryDetails;
  currency: string;
  whatsappNumber: string;
}

export type OrderRequestResult =
  | { ok: true; message: string; whatsappUrl: string }
  | { ok: false; fieldErrors: DeliveryErrors; error: string };

/** The ordering boundary used by the delivery UI. This phase only prepares a
 * customer-reviewed message: it never sends, stores, or confirms an order.
 * The async contract lets a later backend implementation use the same call. */
export async function prepareOrderRequest(input: OrderRequestInput): Promise<OrderRequestResult> {
  const fieldErrors = validateDelivery(input.details);
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors, error: 'Please check the marked delivery fields.' };
  if (!/^[1-9]\d{6,14}$/.test(input.whatsappNumber)) {
    return { ok: false, fieldErrors: {}, error: 'WhatsApp ordering is temporarily unavailable. Please try again later.' };
  }
  if (!/^[A-Z]{3}$/.test(input.currency)) {
    return { ok: false, fieldErrors: {}, error: 'Please return to your basket and review the displayed prices.' };
  }
  try {
    const message = orderRequestMessage(input.items, input.details, input.currency);
    return { ok: true, message, whatsappUrl: `https://wa.me/${input.whatsappNumber}?text=${encodeURIComponent(message)}` };
  } catch {
    return { ok: false, fieldErrors: {}, error: 'Please return to your basket and review the selected products and packs.' };
  }
}
