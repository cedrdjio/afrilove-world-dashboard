import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BellRing,
  Crown,
  Heart,
  LucideAngularModule,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  UserPlus,
  UserRound,
  Users,
  Wifi,
} from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardStatsService } from '../../core/services/dashboard-stats.service';
import { CompactNumberPipe } from '../../shared/pipes/compact-number.pipe';
import { StatCard } from '../../shared/ui/stat-card/stat-card';
import { RegistrationsChart } from './registrations-chart';

const headerDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** Vue d'ensemble : bento de KPIs temps réel + inscriptions 14 jours. */
@Component({
  selector: 'app-dashboard',
  imports: [CompactNumberPipe, LucideAngularModule, RegistrationsChart, RouterLink, StatCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly statsService = inject(DashboardStatsService);
  private readonly auth = inject(AuthService);

  protected readonly UsersIcon = Users;
  protected readonly WifiIcon = Wifi;
  protected readonly UserPlusIcon = UserPlus;
  protected readonly CrownIcon = Crown;
  protected readonly BanknoteIcon = Banknote;
  protected readonly HeartIcon = Heart;
  protected readonly MessageIcon = MessageCircle;
  protected readonly ShieldAlertIcon = ShieldAlert;
  protected readonly BadgeCheckIcon = BadgeCheck;
  protected readonly RefreshIcon = RefreshCw;
  protected readonly ArrowRightIcon = ArrowRight;
  protected readonly UserRoundIcon = UserRound;
  protected readonly BellRingIcon = BellRing;

  protected readonly query = this.statsService.statsQuery;
  protected readonly stats = computed(() => this.query.data());
  protected readonly firstName = computed(() => this.auth.displayName().split(' ')[0]);
  protected readonly todayLabel = headerDateFormatter.format(new Date());

  protected readonly registrations14dTotal = computed(() =>
    (this.stats()?.registrations_14d ?? []).reduce((sum, point) => sum + point.count, 0),
  );

  protected refresh(): void {
    void this.query.refetch();
  }
}
