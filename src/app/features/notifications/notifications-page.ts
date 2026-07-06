import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import {
  BellRing,
  CalendarClock,
  Check,
  LoaderCircle,
  LucideAngularModule,
  Send,
  Users,
  X,
} from 'lucide-angular';
import { ContentService } from '../content/content.service';
import { ToastService } from '../../core/services/toast.service';
import {
  BROADCAST_STATUS_LABEL,
  audienceLabel,
  type Audience,
  type AudienceType,
  type BroadcastItem,
  type BroadcastStatus,
} from '../../models/notification.model';
import type { CatalogItem } from '../../models/content.model';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { NotificationsService } from './notifications.service';

/** Sprint A7 — composer et diffuser des notifications (ciblage réel). */
@Component({
  selector: 'app-notifications-page',
  imports: [LucideAngularModule, RelativeTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-page.html',
})
export class NotificationsPage {
  private readonly notifications = inject(NotificationsService);
  private readonly content = inject(ContentService);
  private readonly toast = inject(ToastService);

  protected readonly BellIcon = BellRing;
  protected readonly SendIcon = Send;
  protected readonly ScheduleIcon = CalendarClock;
  protected readonly UsersIcon = Users;
  protected readonly CheckIcon = Check;
  protected readonly CancelIcon = X;
  protected readonly LoaderIcon = LoaderCircle;

  protected readonly audienceLabel = audienceLabel;
  protected readonly historyQuery = this.notifications.historyQuery;

  // Composition
  protected readonly title = signal('');
  protected readonly body = signal('');
  protected readonly audienceType = signal<AudienceType>('all');
  protected readonly country = signal('');
  protected readonly gender = signal<'homme' | 'femme'>('femme');
  protected readonly premium = signal(true);
  protected readonly ageMin = signal(18);
  protected readonly ageMax = signal(45);
  protected readonly scheduleEnabled = signal(false);
  protected readonly scheduledFor = signal('');

  protected readonly recipientCount = signal<number | null>(null);
  protected readonly counting = signal(false);
  protected readonly sending = signal(false);

  // Pays réels (catalogue Supabase) pour le ciblage par pays.
  protected readonly countries = signal<CatalogItem[]>([]);

  protected readonly audience = computed<Audience>(() => {
    switch (this.audienceType()) {
      case 'country':
        return { type: 'country', country: this.country() };
      case 'gender':
        return { type: 'gender', gender: this.gender() };
      case 'premium':
        return { type: 'premium', premium: this.premium() };
      case 'age':
        return { type: 'age', age_min: this.ageMin(), age_max: this.ageMax() };
      default:
        return { type: 'all' };
    }
  });

  protected readonly canSend = computed(
    () => this.title().trim().length > 0 && this.body().trim().length > 0,
  );

  constructor() {
    // Charge la liste réelle des pays actifs pour le sélecteur.
    void this.content
      .list('countries')
      .then((rows) => this.countries.set(rows.filter((c) => c.is_active)))
      .catch(() => this.countries.set([]));

    // Recompte les destinataires (réels) à chaque changement d'audience.
    effect(() => {
      const audience = this.audience();
      this.counting.set(true);
      this.recipientCount.set(null);
      const token = JSON.stringify(audience);
      void this.notifications
        .audienceCount(audience)
        .then((count) => {
          if (token === JSON.stringify(this.audience())) {
            this.recipientCount.set(count);
          }
        })
        .catch(() => this.recipientCount.set(null))
        .finally(() => this.counting.set(false));
    });
  }

  protected statusLabel(status: BroadcastStatus): string {
    return BROADCAST_STATUS_LABEL[status];
  }

  protected statusClasses(status: BroadcastStatus): string {
    switch (status) {
      case 'sent':
        return 'bg-success/12 text-success';
      case 'scheduled':
        return 'bg-warning/15 text-warning';
      default:
        return 'bg-ink-faint/15 text-ink-faint dark:bg-white/10 dark:text-cream-bezel2/70';
    }
  }

  protected async submit(): Promise<void> {
    if (!this.canSend() || this.sending()) {
      return;
    }
    if (this.audienceType() === 'country' && !this.country()) {
      this.toast.warning('Choisissez un pays');
      return;
    }
    let scheduledFor: string | null = null;
    if (this.scheduleEnabled()) {
      if (!this.scheduledFor()) {
        this.toast.warning('Choisissez une date de programmation');
        return;
      }
      scheduledFor = new Date(this.scheduledFor()).toISOString();
    }

    this.sending.set(true);
    try {
      const result = await this.notifications.send(
        this.title().trim(),
        this.body().trim(),
        this.audience(),
        scheduledFor,
      );
      if (result.scheduled) {
        this.toast.success('Notification programmée', `${result.recipients} destinataire(s) prévu(s).`);
      } else {
        this.toast.success('Notification envoyée', `${result.recipients} membre(s) notifié(s).`);
      }
      this.title.set('');
      this.body.set('');
      this.scheduleEnabled.set(false);
      this.scheduledFor.set('');
    } catch (error) {
      this.toast.error('Envoi impossible', error instanceof Error ? error.message : undefined);
    } finally {
      this.sending.set(false);
    }
  }

  protected async cancel(item: BroadcastItem): Promise<void> {
    try {
      await this.notifications.cancel(item.id);
      this.toast.success('Envoi annulé');
    } catch (error) {
      this.toast.error('Annulation impossible', error instanceof Error ? error.message : undefined);
    }
  }
}
