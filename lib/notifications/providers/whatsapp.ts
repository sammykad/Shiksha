export type WhatsAppComponentType = "header" | "body" | "footer" | "button";

// ── Parameter Types ────────────────────────────────────────────────────────────

export type TextParameter = {
  type: "text";
  text: string;
};

export type ImageParameter = {
  type: "image";
  image: { link: string };
};

export type DocumentParameter = {
  type: "document";
  document:
  | { link: string; filename?: string }   // public URL (other templates)
  | { id: string; filename?: string };    // Meta resumable upload handle
};

export type VideoParameter = {
  type: "video";
  video: { link: string };
};

export type CurrencyParameter = {
  type: "currency";
  currency: { fallback_value: string; code: string; amount_1000: number };
};

export type DateTimeParameter = {
  type: "date_time";
  date_time: { fallback_value: string };
};

export type PayloadParameter = {
  type: "payload";
  payload: string;
};

// ── Component Types ────────────────────────────────────────────────────────────

export type HeaderComponent = {
  type: "header";
  parameters: Array<TextParameter | ImageParameter | DocumentParameter | VideoParameter>;
};

export type BodyComponent = {
  type: "body";
  parameters: Array<TextParameter | CurrencyParameter | DateTimeParameter>;
};

export type FooterComponent = {
  type: "footer";
  // static — set at template creation time, no runtime parameters
};

export type ButtonComponent = {
  type: "button";
  sub_type: "quick_reply" | "url";
  index: string;
  parameters: Array<PayloadParameter | TextParameter>;
};


export type TemplateComponent = HeaderComponent | BodyComponent | FooterComponent | ButtonComponent;
// ── Payload ────────────────────────────────────────────────────────────────────

export interface WhatsAppTemplate {
  name: string;
  language: { code: string };
  components: TemplateComponent[];
}



export type WhatsAppTemplateMessage = {
  messaging_product: "whatsapp";
  to: string;
  type: "template";
  template: WhatsAppTemplate;
};

export type WhatsAppTextMessage = {
  messaging_product: "whatsapp";
  to: string;
  type: "text";
  text: { body: string };
};

// Union — this is what gets JSON.stringify'd and sent to Meta
export type WhatsAppWirePayload = WhatsAppTemplateMessage | WhatsAppTextMessage;

// ── Legacy alias ──────────────────────────────────────────────────────────────
// Kept so existing registry files that import WhatsAppTemplatePayload
// still compile without changes.
/** @deprecated Use WhatsAppTemplate for the inner object, WhatsAppWirePayload for the full message */
export type WhatsAppTemplatePayload = WhatsAppTemplate;



// ── Meta Media Upload ─────────────────────────────────────────────────────────
// Upload buffer to /media endpoint → get media ID
// Returns media_id for use in template header parameter

export async function uploadBufferToMeta(
  buf: Buffer,
  filename: string,
  contentType: string,
  logPrefix: string
): Promise<string> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const userToken = (process.env.WHATSAPP_ACCESS_TOKEN || "").replace(/['"]/g, "").trim();
  const baseUrl = "https://graph.facebook.com/v25.0";

  // Convert Node.js Buffer to standard Uint8Array to satisfy TypeScript BlobPart constraints
  const blobPart = new Uint8Array(buf);

  const formData = new FormData();
  formData.append("messaging_product", "whatsapp");
  formData.append("file", new Blob([blobPart], { type: contentType }), filename);

  const uploadRes = await fetch(`${baseUrl}/${phoneId}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    // Next.js 15 native fetch perfectly supports FormData without explicit boundaries
    body: formData as any,
  });

  const uploadJson = await uploadRes.json();

  if (!uploadRes.ok || !uploadJson.id) {
    throw new Error(
      `Meta file upload failed: ${uploadJson.error?.message ?? JSON.stringify(uploadJson)}`
    );
  }

  const mediaId = String(uploadJson.id);
  console.log(`${logPrefix} ✓ Upload complete | media_id: ${mediaId}`);

  return mediaId;
}

/**
 * Send a plain-text WhatsApp message via Meta Cloud API.
 * Used for delivering reports and one-off admin notifications.
 */
export async function sendWhatsAppText(to: string, body: string): Promise<{ success: boolean; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = (process.env.WHATSAPP_ACCESS_TOKEN || '').replace(/['"]/g, '').trim()

  if (!phoneNumberId || !accessToken) {
    return { success: false, error: 'WhatsApp not configured (missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN)' }
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body },
        }),
      },
    )

    const json = await res.json()

    if (!res.ok) {
      return { success: false, error: json.error?.message ?? 'WhatsApp API error' }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}