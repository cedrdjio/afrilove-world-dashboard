import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Database,
  Flag,
  Info,
  LoaderCircle,
  LucideAngularModule,
  Mail,
  Pencil,
  Save,
  ScrollText,
  Smartphone,
  TriangleAlert,
} from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { SystemService, type MessageTemplate } from './system.service';

const APP_VERSION = '1.0.0';

/** Sprint A9 — réglages système. */
@Component({
  selector: 'app-system-page',
  imports: [LucideAngularModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './system-page.html',
})
export class SystemPage {
  protected readonly system = inject(SystemService);
  private readonly toast = inject(ToastService);

  protected readonly MaintenanceIcon = TriangleAlert;
  protected readonly FlagIcon = Flag;
  protected readonly MailIcon = Mail;
  protected readonly PushIcon = Smartphone;
  protected readonly EditIcon = Pencil;
  protected readonly SaveIcon = Save;
  protected readonly InfoIcon = Info;
  protected readonly StorageIcon = Database;
  protected readonly LogIcon = ScrollText;
  protected readonly LoaderIcon = LoaderCircle;

  protected readonly appVersion = APP_VERSION;
  protected readonly settingsQuery = this.system.settingsQuery;
  protected readonly templatesQuery = this.system.templatesQuery;
  protected readonly settings = computed(() => this.settingsQuery.data());

  protected readonly flags = computed(() => {
    const f = this.settings()?.feature_flags ?? {};
    return Object.entries(f).map(([key, enabled]) => ({ key, enabled }));
  });

  protected readonly busy = signal(false);
  protected readonly templateTarget = signal<MessageTemplate | null>(null);

  protected async toggleMaintenance(): Promise<void> {
    const current = this.settings()?.maintenance_mode;
    await this.run(async () => {
      await this.system.updateSetting('maintenance_mode', {
        enabled: !current?.enabled,
        message: current?.message ?? 'Maintenance en cours, revenez bientôt.',
      });
      this.toast.success(current?.enabled ? 'Maintenance désactivée' : 'Mode maintenance activé');
    });
  }

  protected async toggleFlag(key: string, enabled: boolean): Promise<void> {
    const flags = { ...(this.settings()?.feature_flags ?? {}) };
    flags[key] = !enabled;
    await this.run(async () => {
      await this.system.updateSetting('feature_flags', flags);
    });
  }

  protected editTemplate(template: MessageTemplate): void {
    this.templateTarget.set({ ...template });
  }

  protected patchTemplate(patch: Partial<MessageTemplate>): void {
    this.templateTarget.update((t) => (t ? { ...t, ...patch } : t));
  }

  protected async saveTemplate(): Promise<void> {
    const t = this.templateTarget();
    if (!t) {
      return;
    }
    await this.run(async () => {
      await this.system.upsertTemplate(t.id, {
        name: t.name,
        subject: t.subject,
        body: t.body,
        is_active: t.is_active,
      });
      this.templateTarget.set(null);
      this.toast.success('Modèle enregistré');
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
