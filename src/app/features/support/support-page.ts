import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  LifeBuoy,
  LoaderCircle,
  LucideAngularModule,
  MessageSquare,
  Search,
  Send,
  StickyNote,
  X,
} from 'lucide-angular';
import { ToastService } from '../../core/services/toast.service';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import {
  SupportService,
  TICKETS_PAGE_SIZE,
  type TicketDetail,
  type TicketListItem,
  type TicketStatus,
} from './support.service';

const DEBOUNCE_MS = 300;
const TABS: TicketStatus[] = ['open', 'pending', 'closed'];
const STATUS_LABEL: Record<TicketStatus, string> = { open: 'Ouverts', pending: 'En attente', closed: 'Clos' };
const PRIORITY_LABEL: Record<string, string> = { low: 'Basse', normal: 'Normale', high: 'Haute' };

/** Sprint A12 — file de support et conversation. */
@Component({
  selector: 'app-support-page',
  imports: [Avatar, LucideAngularModule, RelativeTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './support-page.html',
})
export class SupportPage {
  protected readonly support = inject(SupportService);
  private readonly toast = inject(ToastService);

  protected readonly SupportIcon = LifeBuoy;
  protected readonly SearchIcon = Search;
  protected readonly SendIcon = Send;
  protected readonly NoteIcon = StickyNote;
  protected readonly MessageIcon = MessageSquare;
  protected readonly CloseIcon = X;
  protected readonly LoaderIcon = LoaderCircle;

  protected readonly tabs = TABS;
  protected readonly statusLabel = STATUS_LABEL;
  protected readonly priorityLabel = PRIORITY_LABEL;
  protected readonly pageSize = TICKETS_PAGE_SIZE;

  protected readonly listQuery = this.support.listQuery;
  protected readonly result = computed(() => this.listQuery.data());
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil((this.result()?.total ?? 0) / TICKETS_PAGE_SIZE)),
  );

  // Panneau de détail.
  protected readonly detail = signal<TicketDetail | null>(null);
  protected readonly detailLoading = signal(false);
  protected readonly replyText = signal('');
  protected readonly replyInternal = signal(false);
  protected readonly busy = signal(false);

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  protected countOf(status: TicketStatus): number {
    return this.result()?.counts?.[status] ?? 0;
  }

  protected onSearch(value: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.support.query.set(value);
      this.support.page.set(0);
    }, DEBOUNCE_MS);
  }

  protected statusClasses(status: TicketStatus): string {
    switch (status) {
      case 'open':
        return 'bg-success/12 text-success';
      case 'pending':
        return 'bg-warning/15 text-warning';
      default:
        return 'bg-ink-faint/15 text-ink-faint dark:bg-white/10 dark:text-cream-bezel2/70';
    }
  }

  protected priorityClasses(priority: string): string {
    return priority === 'high'
      ? 'bg-danger/12 text-danger'
      : priority === 'low'
        ? 'bg-ink-faint/15 text-ink-faint dark:bg-white/10 dark:text-cream-bezel2/70'
        : 'bg-brand-500/10 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300';
  }

  protected async open(ticket: TicketListItem): Promise<void> {
    this.detailLoading.set(true);
    this.detail.set(null);
    this.replyText.set('');
    try {
      this.detail.set(await this.support.fetchTicket(ticket.id));
    } catch (error) {
      this.toast.error('Ticket indisponible', error instanceof Error ? error.message : undefined);
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected async send(): Promise<void> {
    const detail = this.detail();
    const text = this.replyText().trim();
    if (!detail || !text) {
      return;
    }
    await this.run(async () => {
      await this.support.reply(detail.ticket.id, text, this.replyInternal());
      this.replyText.set('');
      this.detail.set(await this.support.fetchTicket(detail.ticket.id));
      this.toast.success(this.replyInternal() ? 'Note interne ajoutée' : 'Réponse envoyée');
    });
  }

  protected async setStatus(status: TicketStatus): Promise<void> {
    const detail = this.detail();
    if (!detail) {
      return;
    }
    await this.run(async () => {
      await this.support.update(detail.ticket.id, { status });
      this.detail.set(await this.support.fetchTicket(detail.ticket.id));
      this.toast.success('Ticket mis à jour');
    });
  }

  protected async setPriority(priority: string): Promise<void> {
    const detail = this.detail();
    if (!detail) {
      return;
    }
    await this.run(async () => {
      await this.support.update(detail.ticket.id, { priority });
      this.detail.set(await this.support.fetchTicket(detail.ticket.id));
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
