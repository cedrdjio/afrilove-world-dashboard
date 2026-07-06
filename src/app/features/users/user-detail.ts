import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Crown,
  Download,
  Fingerprint,
  KeyRound,
  LoaderCircle,
  LucideAngularModule,
  MailCheck,
  MessageCircle,
  Pencil,
  ShieldCheck,
  ShieldUser,
  Smartphone,
  Trash2,
  UserRoundCheck,
  X,
} from 'lucide-angular';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { hasRoleLevel } from '../../models/admin.model';
import {
  ACCOUNT_STATUS_LABEL,
  DOC_TYPE_LABEL,
  GENDER_LABEL,
  KYC_STATUS_LABEL,
  ageFromBirthDate,
  type AccountStatus,
  type ConversationMessage,
  type ConversationSummary,
  type KycStatus,
} from '../../models/users.model';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { PremiumService } from '../premium/premium.service';
import { UsersService } from './users.service';

/** Fiche membre : profil complet, historique, conversations et actions admin. */
@Component({
  selector: 'app-user-detail',
  imports: [Avatar, DatePipe, LucideAngularModule, ReactiveFormsModule, RelativeTimePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-detail.html',
})
export class UserDetail {
  /** Paramètre :id de la route (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly users = inject(UsersService);
  protected readonly premium = inject(PremiumService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  // Icônes
  protected readonly BackIcon = ArrowLeft;
  protected readonly VerifiedIcon = BadgeCheck;
  protected readonly CrownIcon = Crown;
  protected readonly AdminIcon = ShieldUser;
  protected readonly BanIcon = Ban;
  protected readonly RestoreIcon = UserRoundCheck;
  protected readonly EditIcon = Pencil;
  protected readonly DeleteIcon = Trash2;
  protected readonly ExportIcon = Download;
  protected readonly MailIcon = MailCheck;
  protected readonly KeyIcon = KeyRound;
  protected readonly MessageIcon = MessageCircle;
  protected readonly DeviceIcon = Smartphone;
  protected readonly LoginIcon = Fingerprint;
  protected readonly KycIcon = ShieldCheck;
  protected readonly CloseIcon = X;
  protected readonly LoaderIcon = LoaderCircle;

  protected readonly detailQuery = injectQuery(() => ({
    queryKey: ['admin-user', this.id()],
    queryFn: () => this.users.fetchDetails(this.id()),
  }));

  protected readonly details = computed(() => this.detailQuery.data());
  protected readonly profile = computed(() => this.details()?.profile);
  protected readonly age = computed(() => ageFromBirthDate(this.profile()?.birth_date ?? null));
  protected readonly fullName = computed(() => {
    const p = this.profile();
    return [p?.first_name, p?.last_name].filter(Boolean).join(' ') || p?.email || 'Sans nom';
  });

  // Permissions dérivées du rôle (les RPC re-vérifient côté SQL).
  protected readonly canModerate = computed(() => hasRoleLevel(this.auth.role(), 'moderator'));
  protected readonly canEdit = computed(() => hasRoleLevel(this.auth.role(), 'admin'));
  protected readonly canDelete = computed(() => hasRoleLevel(this.auth.role(), 'super_admin'));

  // Dialogues
  protected readonly statusTarget = signal<AccountStatus | null>(null);
  protected readonly statusReason = signal('');
  protected readonly editOpen = signal(false);
  protected readonly deleteOpen = signal(false);
  protected readonly upgradeOpen = signal(false);
  protected readonly selectedPlan = signal('');
  protected readonly busy = signal(false);

  // Panneau conversation
  protected readonly openConversation = signal<ConversationSummary | null>(null);
  protected readonly messages = signal<ConversationMessage[]>([]);
  protected readonly messagesLoading = signal(false);

  protected readonly editForm = new FormGroup({
    first_name: new FormControl('', { nonNullable: true }),
    last_name: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    country: new FormControl('', { nonNullable: true }),
    profession: new FormControl('', { nonNullable: true }),
    gender: new FormControl('', { nonNullable: true }),
    birth_date: new FormControl('', { nonNullable: true }),
    bio: new FormControl('', { nonNullable: true }),
  });

  protected statusLabel(status: string): string {
    return ACCOUNT_STATUS_LABEL[status as AccountStatus] ?? status;
  }

  protected statusClasses(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-success/12 text-success';
      case 'suspended':
        return 'bg-warning/15 text-warning';
      case 'banned':
        return 'bg-danger/12 text-danger';
      default:
        return 'bg-ink-faint/15 text-ink-faint dark:bg-white/10 dark:text-cream-bezel2/70';
    }
  }

  protected genderLabel(gender: string | null | undefined): string {
    return gender ? (GENDER_LABEL[gender] ?? gender) : '—';
  }

  protected kycStatusLabel(status: string): string {
    return KYC_STATUS_LABEL[status as KycStatus] ?? status;
  }

  protected docTypeLabel(docType: string): string {
    return DOC_TYPE_LABEL[docType] ?? docType;
  }

  protected openEdit(): void {
    const p = this.profile();
    if (!p) {
      return;
    }
    this.editForm.setValue({
      first_name: p.first_name ?? '',
      last_name: p.last_name ?? '',
      city: p.city ?? '',
      country: p.country ?? '',
      profession: p.profession ?? '',
      gender: p.gender ?? '',
      birth_date: p.birth_date ?? '',
      bio: p.bio ?? '',
    });
    this.editOpen.set(true);
  }

  protected async saveEdit(): Promise<void> {
    await this.run(async () => {
      await this.users.updateProfile(this.id(), this.editForm.getRawValue());
      this.editOpen.set(false);
      this.toast.success('Profil mis à jour');
    });
  }

  protected askStatus(target: AccountStatus): void {
    this.statusReason.set('');
    this.statusTarget.set(target);
  }

  protected async confirmStatus(): Promise<void> {
    const target = this.statusTarget();
    if (!target) {
      return;
    }
    await this.run(async () => {
      await this.users.setAccountStatus(this.id(), target, this.statusReason());
      this.statusTarget.set(null);
      this.toast.success(`Compte ${ACCOUNT_STATUS_LABEL[target].toLowerCase()}`);
    });
  }

  protected async toggleVerified(): Promise<void> {
    const current = this.profile()?.is_verified ?? false;
    await this.run(async () => {
      await this.users.setVerified(this.id(), !current);
      this.toast.success(current ? 'Badge vérifié retiré' : 'Profil marqué vérifié');
    });
  }

  protected async verifyEmail(): Promise<void> {
    await this.run(async () => {
      await this.users.verifyEmail(this.id());
      this.toast.success('Adresse e-mail confirmée');
    });
  }

  protected async resetPassword(): Promise<void> {
    const email = this.details()?.auth?.email;
    if (!email) {
      this.toast.warning('Aucune adresse e-mail connue');
      return;
    }
    await this.run(() => this.users.sendPasswordReset(email));
  }

  protected openUpgrade(): void {
    // Précharge la liste des plans et propose le premier plan actif.
    void this.premium.plansQuery.refetch();
    const firstActive = this.premium.plansQuery.data()?.find((plan) => plan.is_active);
    this.selectedPlan.set(firstActive?.key ?? '');
    this.upgradeOpen.set(true);
  }

  protected async confirmUpgrade(): Promise<void> {
    const plan = this.selectedPlan();
    if (!plan) {
      this.toast.warning('Choisissez un plan');
      return;
    }
    await this.run(async () => {
      await this.premium.grantSubscription(this.id(), plan);
      this.users.invalidate(this.id());
      this.upgradeOpen.set(false);
      this.toast.success('Abonnement premium accordé');
    });
  }

  protected async confirmDelete(): Promise<void> {
    await this.run(async () => {
      await this.users.deleteUser(this.id());
      this.deleteOpen.set(false);
      this.toast.success('Compte supprimé définitivement');
      history.back();
    });
  }

  protected async showConversation(conversation: ConversationSummary): Promise<void> {
    this.openConversation.set(conversation);
    this.messagesLoading.set(true);
    this.messages.set([]);
    try {
      this.messages.set(await this.users.fetchConversation(conversation.match_id));
    } catch (error) {
      this.toast.error(
        'Conversation indisponible',
        error instanceof Error ? error.message : undefined,
      );
      this.openConversation.set(null);
    } finally {
      this.messagesLoading.set(false);
    }
  }

  protected exportJson(): void {
    const details = this.details();
    if (!details) {
      return;
    }
    const blob = new Blob([JSON.stringify(details, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `afrilove-user-${this.id()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.toast.success('Export téléchargé');
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
