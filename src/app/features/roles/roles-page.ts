import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  LoaderCircle,
  LucideAngularModule,
  ShieldUser,
  Trash2,
  UserPlus,
} from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ROLE_LABEL, type AdminRole } from '../../models/admin.model';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { RolesService, type AdminMember } from './roles.service';

const ROLES: AdminRole[] = ['super_admin', 'admin', 'moderator', 'support', 'viewer'];

// Matrice de permissions (référence affichée). ✓ = accès.
const PERMISSION_MATRIX: { area: string; roles: Record<AdminRole, boolean> }[] = [
  { area: 'Tableau de bord & analytics', roles: { super_admin: true, admin: true, moderator: true, support: true, viewer: true } },
  { area: 'Utilisateurs (consulter)', roles: { super_admin: true, admin: true, moderator: true, support: true, viewer: false } },
  { area: 'Modération & KYC', roles: { super_admin: true, admin: true, moderator: true, support: false, viewer: false } },
  { area: 'Édition profils, e-mail, premium', roles: { super_admin: true, admin: true, moderator: false, support: false, viewer: false } },
  { area: 'Contenu, notifications, réglages', roles: { super_admin: true, admin: true, moderator: false, support: false, viewer: false } },
  { area: 'Suppression de compte, rôles', roles: { super_admin: true, admin: false, moderator: false, support: false, viewer: false } },
  { area: 'Support (tickets)', roles: { super_admin: true, admin: true, moderator: true, support: true, viewer: false } },
];

/** Sprint A10 — RBAC : membres du back-office + matrice de permissions. */
@Component({
  selector: 'app-roles-page',
  imports: [Avatar, LucideAngularModule, RelativeTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './roles-page.html',
})
export class RolesPage {
  protected readonly roles = inject(RolesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly AdminIcon = ShieldUser;
  protected readonly AddIcon = UserPlus;
  protected readonly RevokeIcon = Trash2;
  protected readonly LoaderIcon = LoaderCircle;

  protected readonly allRoles = ROLES;
  protected readonly roleLabel = ROLE_LABEL;
  protected readonly matrix = PERMISSION_MATRIX;
  protected readonly myId = computed(() => this.auth.session()?.user.id);

  protected readonly adminsQuery = this.roles.adminsQuery;

  // Dialogue d'ajout.
  protected readonly addOpen = signal(false);
  protected readonly newEmail = signal('');
  protected readonly newRole = signal<AdminRole>('moderator');
  protected readonly newName = signal('');
  protected readonly revokeTarget = signal<AdminMember | null>(null);
  protected readonly busy = signal(false);

  protected roleBadge(role: AdminRole): string {
    switch (role) {
      case 'super_admin':
        return 'bg-brand-500/15 text-brand-600 dark:bg-brand-400/20 dark:text-brand-300';
      case 'admin':
        return 'bg-lilac/15 text-lilac-dark dark:bg-lilac/20 dark:text-lilac-light';
      case 'moderator':
        return 'bg-success/12 text-success';
      case 'support':
        return 'bg-warning/15 text-warning';
      default:
        return 'bg-ink-faint/15 text-ink-faint dark:bg-white/10 dark:text-cream-bezel2/70';
    }
  }

  protected async grant(): Promise<void> {
    const email = this.newEmail().trim();
    if (!email) {
      this.toast.warning("Saisissez l'e-mail");
      return;
    }
    // On sait si l'e-mail a déjà un compte : si aucun membre listé ne le
    // porte, l'accès sera enregistré en invitation en attente — le message
    // de succès le reflète pour ne pas laisser croire à un échec.
    const known = (this.adminsQuery.data() ?? []).some(
      (m) => m.email?.toLowerCase() === email.toLowerCase(),
    );
    await this.run(async () => {
      await this.roles.grant(email, this.newRole(), this.newName().trim());
      this.addOpen.set(false);
      this.newEmail.set('');
      this.newName.set('');
      this.toast.success(
        known ? 'Accès accordé' : 'Invitation enregistrée — accès actif à la 1re connexion',
      );
    });
  }

  protected async toggleActive(member: AdminMember): Promise<void> {
    if (!member.user_id) {
      return;
    }
    await this.run(async () => {
      await this.roles.setActive(member.user_id!, !member.is_active);
      this.toast.success(member.is_active ? 'Accès suspendu' : 'Accès réactivé');
    });
  }

  protected async confirmRevoke(): Promise<void> {
    const member = this.revokeTarget();
    if (!member) {
      return;
    }
    await this.run(async () => {
      // Invitation en attente → annulation par e-mail ; membre réel →
      // révocation par user_id.
      if (member.pending || !member.user_id) {
        await this.roles.cancelInvite(member.email ?? '');
        this.toast.success('Invitation annulée');
      } else {
        await this.roles.revoke(member.user_id);
        this.toast.success('Accès révoqué');
      }
      this.revokeTarget.set(null);
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
