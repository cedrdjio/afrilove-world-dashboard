import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Ban,
  CircleCheck,
  CircleX,
  Clock,
  ExternalLink,
  Flag,
  LoaderCircle,
  LucideAngularModule,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldX,
  TriangleAlert,
} from 'lucide-angular';
import { ToastService } from '../../core/services/toast.service';
import {
  REPORT_STATUS_LABEL,
  type ReportItem,
  type ReportStatus,
} from '../../models/moderation.model';
import { ACCOUNT_STATUS_LABEL, type AccountStatus } from '../../models/users.model';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { REPORTS_PAGE_SIZE, ModerationService } from './moderation.service';

const DEBOUNCE_MS = 300;
const TABS: ReportStatus[] = ['pending', 'resolved', 'dismissed'];

/** File de modération : signalements, résolution, avertissement, bannissement. */
@Component({
  selector: 'app-moderation-page',
  imports: [Avatar, LucideAngularModule, RelativeTimePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './moderation-page.html',
})
export class ModerationPage {
  protected readonly moderation = inject(ModerationService);
  private readonly toast = inject(ToastService);

  protected readonly SearchIcon = Search;
  protected readonly FlagIcon = Flag;
  protected readonly ResolveIcon = CircleCheck;
  protected readonly DismissIcon = CircleX;
  protected readonly WarnIcon = TriangleAlert;
  protected readonly BanIcon = Ban;
  protected readonly TempBanIcon = Clock;
  protected readonly PermBanIcon = ShieldX;
  protected readonly RefreshIcon = RefreshCw;
  protected readonly OpenIcon = ExternalLink;
  protected readonly EmptyIcon = ShieldAlert;
  protected readonly LoaderIcon = LoaderCircle;

  protected readonly tabs = TABS;
  protected readonly pageSize = REPORTS_PAGE_SIZE;
  protected readonly listQuery = this.moderation.listQuery;
  protected readonly statsQuery = this.moderation.statsQuery;
  protected readonly result = computed(() => this.listQuery.data());
  protected readonly stats = computed(() => this.statsQuery.data());
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil((this.result()?.total ?? 0) / REPORTS_PAGE_SIZE)),
  );

  // Dialogue d'action sur le membre signalé.
  protected readonly actionTarget = signal<ReportItem | null>(null);
  protected readonly actionKind = signal<'warn' | 'suspend' | 'temp_ban' | 'ban'>('warn');
  protected readonly actionReason = signal('');
  protected readonly actionDays = signal(7);
  protected readonly busy = signal(false);

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  protected countOf(status: ReportStatus): number {
    return this.result()?.counts?.[status] ?? 0;
  }

  protected tabLabel(status: ReportStatus): string {
    return REPORT_STATUS_LABEL[status];
  }

  protected reportedStatusLabel(status: string | undefined): string {
    return status ? (ACCOUNT_STATUS_LABEL[status as AccountStatus] ?? status) : '—';
  }

  protected onSearch(value: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.moderation.query.set(value);
      this.moderation.page.set(0);
    }, DEBOUNCE_MS);
  }

  protected async review(ids: string[], status: ReportStatus): Promise<void> {
    await this.run(async () => {
      const count = await this.moderation.reviewReports(ids, status);
      this.toast.success(
        `${count} signalement(s) ${status === 'resolved' ? 'résolu(s)' : 'rejeté(s)'}`,
      );
    });
  }

  protected openAction(report: ReportItem, kind: 'warn' | 'suspend' | 'temp_ban' | 'ban'): void {
    this.actionKind.set(kind);
    this.actionReason.set('');
    this.actionDays.set(7);
    this.actionTarget.set(report);
  }

  protected actionTitle(): string {
    switch (this.actionKind()) {
      case 'warn':
        return 'Avertir le membre';
      case 'suspend':
        return 'Suspendre le membre';
      case 'temp_ban':
        return 'Bannir temporairement';
      case 'ban':
        return 'Bannir définitivement';
    }
  }

  protected async confirmAction(): Promise<void> {
    const report = this.actionTarget();
    const userId = report?.reported.id;
    if (!report || !userId) {
      return;
    }
    const reason = this.actionReason().trim();
    if (this.actionKind() !== 'warn' && !reason) {
      this.toast.warning('Le motif est obligatoire');
      return;
    }
    await this.run(async () => {
      switch (this.actionKind()) {
        case 'warn':
          await this.moderation.warnUser(userId, reason || 'Rappel des règles de la communauté.');
          this.toast.success('Avertissement envoyé');
          break;
        case 'suspend':
          await this.moderation.setStatusOnUser(userId, 'suspended', reason);
          this.toast.success('Membre suspendu');
          break;
        case 'temp_ban':
          await this.moderation.tempBan(userId, this.actionDays(), reason);
          this.toast.success(`Membre banni ${this.actionDays()} jour(s)`);
          break;
        case 'ban':
          await this.moderation.setStatusOnUser(userId, 'banned', reason);
          this.toast.success('Membre banni définitivement');
          break;
      }
      // Résout aussi le signalement à l'origine de l'action.
      await this.moderation.reviewReports([report.id], 'resolved');
      this.actionTarget.set(null);
    });
  }

  private async run(action: () => Promise<void>): Promise<void> {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    try {
      await action();
    } catch (error) {
      this.toast.error('Action impossible', error instanceof Error ? error.message : undefined);
    } finally {
      this.busy.set(false);
    }
  }
}
