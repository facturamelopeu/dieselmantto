export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price?: string;
  keywords: string[];
  source?: 'manual' | 'scraped';
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export interface Tenant {
  id: string;
  username: string;
  passwordHash: string;
  storeName: string;
  websiteUrl: string;
  whatsappToken: string;
  phoneNumberId: string;
  verifyToken: string;
  catalog: Product[];
  faqs: FAQ[];
  createdAt: string;
}

export interface WhatsAppMessage {
  from: string;
  text: string;
  messageId: string;
}

export interface InteractiveButton {
  id: string;
  title: string;
}

export interface InteractiveListRow {
  id: string;
  title: string;
  description?: string;
}

export interface InteractiveListSection {
  title: string;
  rows: InteractiveListRow[];
}

export interface MetaWebhookBody {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { display_phone_number: string; phone_number_id: string };
        messages?: Array<{
          from: string;
          id: string;
          type: string;
          text?: { body: string };
          interactive?: {
            type: string;
            button_reply?: { id: string; title: string };
            list_reply?: { id: string; title: string };
          };
        }>;
      };
      field: string;
    }>;
  }>;
}
