/** Sprint A11 — modération des images de profil. */
export type PhotoStatus = 'approved' | 'flagged' | 'hidden';

export const PHOTO_STATUS_LABEL: Record<PhotoStatus, string> = {
  approved: 'Approuvées',
  flagged: 'Signalées',
  hidden: 'Masquées',
};

export type PhotoModerationAction = 'approve' | 'flag' | 'hide';

export interface PhotoItem {
  id: string;
  url: string;
  profile_id: string;
  is_primary: boolean;
  moderation_status: PhotoStatus;
  moderation_note: string | null;
  moderated_at: string | null;
  created_at: string;
  first_name: string | null;
  email: string | null;
  account_status: string;
  open_reports: number;
}

export interface PhotoListResult {
  total: number;
  items: PhotoItem[];
}
