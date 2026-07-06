/** Sprint A7 — notifications diffusées. */
export type AudienceType = 'all' | 'country' | 'gender' | 'premium' | 'age';

export interface Audience {
  type: AudienceType;
  country?: string;
  gender?: string;
  premium?: boolean;
  age_min?: number;
  age_max?: number;
}

export type BroadcastStatus = 'sent' | 'scheduled' | 'canceled';

export interface BroadcastItem {
  id: string;
  title: string;
  body: string;
  audience: Audience;
  status: BroadcastStatus;
  recipients_count: number;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  author: string | null;
}

export interface SendResult {
  broadcast_id: string;
  recipients: number;
  scheduled: boolean;
}

export const BROADCAST_STATUS_LABEL: Record<BroadcastStatus, string> = {
  sent: 'Envoyée',
  scheduled: 'Programmée',
  canceled: 'Annulée',
};

export function audienceLabel(audience: Audience): string {
  switch (audience.type) {
    case 'all':
      return 'Tous les membres';
    case 'country':
      return `Pays : ${audience.country}`;
    case 'gender':
      return `Genre : ${audience.gender === 'homme' ? 'Hommes' : 'Femmes'}`;
    case 'premium':
      return audience.premium ? 'Membres premium' : 'Membres non premium';
    case 'age':
      return `Âge : ${audience.age_min ?? 18}–${audience.age_max ?? 99} ans`;
    default:
      return 'Audience';
  }
}
