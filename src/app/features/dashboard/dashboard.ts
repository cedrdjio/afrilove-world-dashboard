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
import { DashboardChartsService } from '../../core/services/dashboard-charts.service';
import { DashboardStatsService } from '../../core/services/dashboard-stats.service';
import { CHART_PERIODS, type ChartDayPoint, type ChartPeriod } from '../../models/dashboard.model';
import { CompactNumberPipe } from '../../shared/pipes/compact-number.pipe';
import { StatCard } from '../../shared/ui/stat-card/stat-card';
import { ActivityFeed } from './activity-feed';
import { CountryList } from './country-list';
import { GenderDonut } from './gender-donut';
import { TrendChart, type TrendPoint } from './trend-chart';

const headerDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** Vue d'ensemble : KPIs temps réel + analytique (Sprint A1). */
@Component({
  selector: 'app-dashboard',
  imports: [
    ActivityFeed,
    CompactNumberPipe,
    CountryList,
    GenderDonut,
    LucideAngularModule,
    RouterLink,
    StatCard,
    TrendChart,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly statsService = inject(DashboardStatsService);
  private readonly chartsService = inject(DashboardChartsService);
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
  protected readonly chartsQuery = this.chartsService.chartsQuery;
  protected readonly activityQuery = this.chartsService.activityQuery;

  protected readonly stats = computed(() => this.query.data());
  protected readonly charts = computed(() => this.chartsQuery.data());
  protected readonly activity = computed(() => this.activityQuery.data() ?? []);

  protected readonly periods = CHART_PERIODS;
  protected readonly period = this.chartsService.period;

  protected readonly firstName = computed(() => this.auth.displayName().split(' ')[0]);
  protected readonly todayLabel = headerDateFormatter.format(new Date());

  protected readonly growthPoints = this.seriesOf('total_users');
  protected readonly newUserPoints = this.seriesOf('new_users');
  protected readonly activePoints = this.seriesOf('active_users');
  protected readonly revenuePoints = this.seriesOf('revenue_cents');
  protected readonly matchPoints = this.seriesOf('matches');
  protected readonly messagePoints = this.seriesOf('messages');
  protected readonly subscriptionPoints = this.seriesOf('subscriptions');

  protected setPeriod(period: ChartPeriod): void {
    this.chartsService.setPeriod(period);
  }

  protected refresh(): void {
    void this.query.refetch();
    void this.chartsQuery.refetch();
    void this.activityQuery.refetch();
  }

  private seriesOf(metric: keyof Omit<ChartDayPoint, 'day'>) {
    return computed<TrendPoint[]>(() =>
      (this.charts()?.series ?? []).map((point) => ({ day: point.day, value: point[metric] })),
    );
  }
}
