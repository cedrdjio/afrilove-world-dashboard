import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  Activity,
  BadgeCheck,
  Crown,
  Download,
  LucideAngularModule,
  RefreshCw,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-angular';
import { AnalyticsService } from './analytics.service';
import { CHART_PERIODS, type ChartPeriod } from '../../models/dashboard.model';
import type { HeatCell, TopEntry } from '../../models/analytics.model';
import { formatEuros } from '../../models/premium.model';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { CompactNumberPipe } from '../../shared/pipes/compact-number.pipe';
import { downloadCsv } from '../../shared/utils/csv';

const DOW_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

/** Sprint A8 — tableau analytique (DAU/MAU, rétention, tops, heatmap, export). */
@Component({
  selector: 'app-analytics-page',
  imports: [Avatar, CompactNumberPipe, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './analytics-page.html',
})
export class AnalyticsPage {
  protected readonly analytics = inject(AnalyticsService);

  protected readonly DauIcon = Activity;
  protected readonly UsersIcon = Users;
  protected readonly TrendingIcon = TrendingUp;
  protected readonly CrownIcon = Crown;
  protected readonly VerifiedIcon = BadgeCheck;
  protected readonly UserIcon = UserRound;
  protected readonly ExportIcon = Download;
  protected readonly RefreshIcon = RefreshCw;

  protected readonly formatEuros = formatEuros;
  protected readonly periods = CHART_PERIODS;
  protected readonly dowLabels = DOW_LABELS;

  protected readonly query = this.analytics.analyticsQuery;
  protected readonly data = computed(() => this.query.data());

  // Heatmap : matrice 7 (jours) × 24 (heures), normalisée pour l'opacité.
  protected readonly heatGrid = computed(() => {
    const cells = this.data()?.heatmap ?? [];
    const max = Math.max(1, ...cells.map((c) => c.count));
    const lookup = new Map<string, number>();
    for (const cell of cells) {
      lookup.set(`${cell.dow}-${cell.hour}`, cell.count);
    }
    return { max, lookup };
  });

  protected setPeriod(period: ChartPeriod): void {
    this.analytics.setPeriod(period);
  }

  protected heatValue(dow: number, hour: number): number {
    return this.heatGrid().lookup.get(`${dow}-${hour}`) ?? 0;
  }

  protected heatOpacity(dow: number, hour: number): number {
    const value = this.heatValue(dow, hour);
    return value === 0 ? 0.04 : 0.15 + 0.85 * (value / this.heatGrid().max);
  }

  protected readonly hours = Array.from({ length: 24 }, (_, i) => i);
  protected readonly days = [1, 2, 3, 4, 5, 6, 0]; // Lun→Dim

  protected exportTops(): void {
    const d = this.data();
    if (!d) {
      return;
    }
    const rows = [
      ...d.top_countries.map((r: TopEntry) => ({ type: 'pays', ...r })),
      ...d.top_cities.map((r: TopEntry) => ({ type: 'ville', ...r })),
      ...d.top_interests.map((r: TopEntry) => ({ type: 'intérêt', ...r })),
    ];
    downloadCsv(`afrilove-analytics-${this.analytics.period()}j.csv`, rows);
  }

  protected exportActive(): void {
    const rows = (this.data()?.most_active_users ?? []).map((u) => ({
      id: u.id,
      nom: u.name,
      activite: u.activity,
    }));
    downloadCsv('afrilove-membres-actifs.csv', rows);
  }
}
