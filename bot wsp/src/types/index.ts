export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price?: string;
  url?: string;
  imageUrl?: string;
  keywords: string[];
  source?: 'manual' | 'scraped';
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export interface TenantAI {
  enabled: boolean;
  model: string;
  prompt: string;
}

export interface TenantStats {
  messages: number;
  conversations: number;
  leads: number;
}

export interface TenantPayment {
  id: string;
  date: string;
  amount: number;
  currency: string;
  method: string;
  note?: string;
  period: string;
}

export interface TenantSubscription {
  status: 'trial' | 'active' | 'expired' | 'suspended';
  plan: string;
  amount: number;
  currency: string;
  startDate: string;
  expiresAt: string;
  payments: TenantPayment[];
}

export interface Tenant {
  id: string;
  username: string;
  passwordHash: string;
  storeName: string;
  websiteUrl: string;
  logoUrl?: string;
  whatsappToken: string;
  phoneNumberId: string;
  verifyToken: string;
  yapeNumber?: string;
  yapeOwner?: string;
  yapeQrUrl?: string;
  plinNumber?: string;
  plinOwner?: string;
  plinQrUrl?: string;
  bankAccounts?: string;
  catalog: Product[];
  faqs: FAQ[];
  ai?: TenantAI;
  stats?: TenantStats;
  sellers?: string[];
  theme?: { primaryColor: string };
  subscription?: TenantSubscription;
  createdAt: string;
}

export interface WhatsAppMessage {
  from: string;
  text: string;
  messageId: string;
  name?: string;
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
