import type { Tables } from './database.types';

/** Ligne renvoyée par admin_list_users. */
export interface UserListItem {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  gender: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
  account_status: AccountStatus;
  is_verified: boolean;
  profile_completed: boolean;
  created_at: string;
  last_active_at: string;
  kyc_status: KycStatus | null;
  is_premium: boolean;
}

export interface UserListResult {
  total: number;
  users: UserListItem[];
}

export type AccountStatus = 'active' | 'suspended' | 'banned' | 'deleted';
export type KycStatus = 'pending' | 'approved' | 'rejected';

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  banned: 'Banni',
  deleted: 'Supprimé',
};

export const KYC_STATUS_LABEL: Record<KycStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
};

export const GENDER_LABEL: Record<string, string> = {
  homme: 'Homme',
  femme: 'Femme',
};

export const DOC_TYPE_LABEL: Record<string, string> = {
  cni: "Carte d'identité",
  passport: 'Passeport',
  license: 'Permis de conduire',
};

/** Payload complet de admin_get_user_details. */
export interface UserDetails {
  profile: Tables<'profiles'>;
  auth: {
    email: string | null;
    created_at: string;
    email_confirmed_at: string | null;
    last_sign_in_at: string | null;
  } | null;
  is_admin_account: boolean;
  photos: Tables<'profile_photos'>[];
  interests: string[];
  languages: string[];
  relationship_goal: string | null;
  religion: string | null;
  subscription: {
    plan_label: string;
    status: string;
    starts_at: string | null;
    expires_at: string | null;
    provider: string;
  } | null;
  devices: { platform: string | null; updated_at: string; token_preview: string }[];
  kyc: Tables<'kyc_submissions'>[];
  reports_received: ReportEntry[];
  reports_made: ReportEntry[];
  conversations: ConversationSummary[];
  login_history: { action: string; created_at: string; ip: string | null }[];
  admin_log: { action: string; meta: Record<string, unknown>; created_at: string; admin_name: string | null }[];
}

export interface ReportEntry {
  id: string;
  reason: string;
  details?: string | null;
  status: string;
  created_at: string;
  reporter_name?: string | null;
  reported_name?: string | null;
}

export interface ConversationSummary {
  match_id: string;
  matched_at: string;
  partner_id: string;
  partner_name: string | null;
  partner_avatar: string | null;
  message_count: number;
  last_message_at: string | null;
}

export interface ConversationMessage {
  id: string;
  sender_id: string;
  sender_name: string | null;
  content: string;
  created_at: string;
  read_at: string | null;
}

/** Ligne renvoyée par admin_list_kyc. */
export interface KycItem {
  id: string;
  profile_id: string;
  doc_type: string;
  status: KycStatus;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  id_front_path: string;
  id_back_path: string | null;
  selfie_path: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
}

export interface KycListResult {
  total: number;
  counts: Partial<Record<KycStatus, number>>;
  items: KycItem[];
}

export function ageFromBirthDate(birthDate: string | null): number | null {
  if (!birthDate) {
    return null;
  }
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}
