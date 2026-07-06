/** Sprint A4 — modération. */
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  pending: 'En attente',
  resolved: 'Résolus',
  dismissed: 'Rejetés',
};

export interface ReportParty {
  id: string | null;
  name: string | null;
  email?: string | null;
  avatar: string | null;
  account_status?: string;
  total_reports?: number;
}

export interface ReportItem {
  id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
  reviewed_at: string | null;
  reporter: ReportParty;
  reported: ReportParty;
}

export interface ReportListResult {
  total: number;
  counts: Partial<Record<ReportStatus, number>>;
  items: ReportItem[];
}

export interface ModerationStats {
  reports_pending: number;
  reports_total: number;
  warnings_total: number;
  suspended_users: number;
  banned_users: number;
}
