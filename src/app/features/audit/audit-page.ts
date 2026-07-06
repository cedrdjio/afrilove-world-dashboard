import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Fingerprint,
  LucideAngularModule,
  RefreshCw,
  ScrollText,
  Search,
} from 'lucide-angular';
import { AUDIT_PAGE_SIZE, AuditService, type AuditEntry } from './audit.service';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { downloadCsv } from '../../shared/utils/csv';

const DEBOUNCE_MS = 300;
const TARGET_TYPES = ['', 'user', 'kyc', 'report', 'subscription', 'admin', 'setting', 'catalog', 'broadcast', 'ticket'];

/** Sprint A11 — journaux d'audit (actions) et de connexion. */
@Component({
  selector: 'app-audit-page',
  imports: [LucideAngularModule, RelativeTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './audit-page.html',
})
export class AuditPage {
  protected readonly audit = inject(AuditService);

  protected readonly SearchIcon = Search;
  protected readonly LogIcon = ScrollText;
  protected readonly LoginIcon = Fingerprint;
  protected readonly ExportIcon = Download;
  protected readonly RefreshIcon = RefreshCw;
  protected readonly PrevIcon = ChevronLeft;
  protected readonly NextIcon = ChevronRight;

  protected readonly targetTypes = TARGET_TYPES;
  protected readonly tab = signal<'actions' | 'logins'>('actions');

  protected readonly auditQuery = this.audit.auditQuery;
  protected readonly loginQuery = this.audit.loginQuery;
  protected readonly result = computed(() => this.auditQuery.data());
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil((this.result()?.total ?? 0) / AUDIT_PAGE_SIZE)),
  );

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  protected onSearch(value: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.audit.query.set(value);
      this.audit.page.set(0);
    }, DEBOUNCE_MS);
  }

  protected onType(value: string): void {
    this.audit.targetType.set(value);
    this.audit.page.set(0);
  }

  protected typeLabel(type: string): string {
    return type === '' ? 'Tous les types' : type;
  }

  protected metaSummary(entry: AuditEntry): string {
    const meta = entry.meta;
    if (!meta || Object.keys(meta).length === 0) {
      return '';
    }
    return Object.entries(meta)
      .filter(([, v]) => v != null && typeof v !== 'object')
      .map(([k, v]) => `${k}: ${v}`)
      .slice(0, 3)
      .join(' · ');
  }

  protected actionColor(action: string): string {
    if (action.includes('delete') || action.includes('ban') || action.includes('revoke') || action.includes('reject')) {
      return 'bg-danger/12 text-danger';
    }
    if (action.includes('warn') || action.includes('suspend') || action.includes('cancel')) {
      return 'bg-warning/15 text-warning';
    }
    if (action.includes('grant') || action.includes('approve') || action.includes('verify') || action.includes('enable')) {
      return 'bg-success/12 text-success';
    }
    return 'bg-brand-500/10 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300';
  }

  protected exportAudit(): void {
    const rows = (this.result()?.items ?? []).map((e) => ({
      date: e.created_at,
      admin: e.admin_name ?? e.admin_email ?? '',
      action: e.action,
      cible: e.target_type,
      cible_id: e.target_id ?? '',
    }));
    downloadCsv('afrilove-audit.csv', rows);
  }
}
