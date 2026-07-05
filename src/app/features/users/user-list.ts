import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  LucideAngularModule,
  RefreshCw,
  Search,
  UserRoundX,
} from 'lucide-angular';
import {
  ACCOUNT_STATUS_LABEL,
  GENDER_LABEL,
  KYC_STATUS_LABEL,
  type AccountStatus,
  type KycStatus,
  type UserListItem,
} from '../../models/users.model';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { CompactNumberPipe } from '../../shared/pipes/compact-number.pipe';
import { USERS_PAGE_SIZE, UsersService } from './users.service';

const DEBOUNCE_MS = 300;

/** Annuaire des membres : recherche, filtres persistants, pagination. */
@Component({
  selector: 'app-user-list',
  imports: [Avatar, CompactNumberPipe, LucideAngularModule, RelativeTimePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-list.html',
})
export class UserList {
  protected readonly users = inject(UsersService);

  protected readonly SearchIcon = Search;
  protected readonly VerifiedIcon = BadgeCheck;
  protected readonly CrownIcon = Crown;
  protected readonly EmptyIcon = UserRoundX;
  protected readonly PrevIcon = ChevronLeft;
  protected readonly NextIcon = ChevronRight;
  protected readonly RefreshIcon = RefreshCw;

  protected readonly pageSize = USERS_PAGE_SIZE;
  protected readonly listQuery = this.users.listQuery;
  protected readonly result = computed(() => this.listQuery.data());
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil((this.result()?.total ?? 0) / USERS_PAGE_SIZE)),
  );
  protected readonly rangeLabel = computed(() => {
    const total = this.result()?.total ?? 0;
    if (total === 0) {
      return '0 membre';
    }
    const start = this.users.page() * USERS_PAGE_SIZE + 1;
    const end = Math.min(total, start + (this.result()?.users.length ?? 0) - 1);
    return `${start}–${end} sur ${total}`;
  });

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  protected onSearch(value: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.users.query.set(value);
      this.users.page.set(0);
    }, DEBOUNCE_MS);
  }

  protected onStatus(value: string): void {
    this.users.status.set(value as AccountStatus | '');
    this.users.page.set(0);
  }

  protected onGender(value: string): void {
    this.users.gender.set(value as '' | 'homme' | 'femme');
    this.users.page.set(0);
  }

  protected onVerified(value: string): void {
    this.users.verified.set(value as '' | 'yes' | 'no');
    this.users.page.set(0);
  }

  protected fullName(user: UserListItem): string {
    return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Sans nom';
  }

  protected statusLabel(status: AccountStatus): string {
    return ACCOUNT_STATUS_LABEL[status] ?? status;
  }

  protected statusClasses(status: AccountStatus): string {
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

  protected kycLabel(status: KycStatus | null): string {
    return status ? KYC_STATUS_LABEL[status] : '—';
  }

  protected kycClasses(status: KycStatus | null): string {
    switch (status) {
      case 'pending':
        return 'bg-warning/15 text-warning';
      case 'approved':
        return 'bg-success/12 text-success';
      case 'rejected':
        return 'bg-danger/12 text-danger';
      default:
        return 'text-ink-faint dark:text-cream-bezel2/50';
    }
  }

  protected genderLabel(gender: string | null): string {
    return gender ? (GENDER_LABEL[gender] ?? gender) : '—';
  }

  protected locationOf(user: UserListItem): string {
    return [user.city, user.country].filter(Boolean).join(' · ') || '—';
  }
}
