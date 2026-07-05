import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsCoreOption } from 'echarts/core';
import { ThemeService } from '../../core/services/theme.service';

export interface TrendPoint {
  day: string; // 'YYYY-MM-DD'
  value: number;
}

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const numberFormatter = new Intl.NumberFormat('fr-FR');
const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/**
 * Carte de tendance générique (série unique, teinte marque) : aire lissée
 * pour les stocks/cumuls, barres arrondies pour les flux journaliers.
 */
@Component({
  selector: 'app-trend-chart',
  imports: [NgxEchartsDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="glass-card flex h-full flex-col p-5">
      <div class="mb-1 flex items-start justify-between gap-2">
        <div>
          <h2 class="font-display text-sm font-bold text-ink dark:text-cream">{{ title() }}</h2>
          @if (subtitle()) {
            <p class="text-xs text-ink-muted dark:text-cream-bezel2">{{ subtitle() }}</p>
          }
        </div>
        <p class="font-display text-xl font-extrabold text-ink tabular-nums dark:text-cream">
          {{ headline() }}
        </p>
      </div>
      <div
        echarts
        [options]="chartOptions()"
        class="min-h-0 w-full flex-1"
        [style.height.px]="height()"
        role="img"
        [attr.aria-label]="title()"
      ></div>
    </article>
  `,
})
export class TrendChart {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly points = input.required<TrendPoint[]>();
  readonly kind = input<'area' | 'bar'>('bar');
  readonly format = input<'number' | 'currency'>('number');
  /** 'sum' pour les flux (revenus, matchs…), 'last' pour les cumuls (croissance). */
  readonly aggregate = input<'sum' | 'last'>('sum');
  readonly height = input(176);

  private readonly theme = inject(ThemeService);

  protected readonly headline = computed(() => {
    const points = this.points();
    const raw =
      this.aggregate() === 'last'
        ? (points.at(-1)?.value ?? 0)
        : points.reduce((sum, point) => sum + point.value, 0);
    return this.format() === 'currency'
      ? currencyFormatter.format(raw / 100)
      : numberFormatter.format(raw);
  });

  protected readonly chartOptions = computed<EChartsCoreOption>(() => {
    const dark = this.theme.theme() === 'dark';
    const points = this.points();
    const line = dark ? '#8b69d6' : '#6a4fc0';
    const text = dark ? '#d9c9f1' : '#5e5473';
    const grid = dark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(46, 36, 64, 0.08)';
    const isCurrency = this.format() === 'currency';
    const formatValue = (value: number) =>
      isCurrency ? currencyFormatter.format(value / 100) : numberFormatter.format(value);
    // Étiquettes espacées pour rester lisibles jusqu'à 90 jours et sur cartes étroites.
    const labelInterval = Math.max(1, Math.ceil(points.length / 5)) - 1;

    const base = {
      animationDuration: 500,
      grid: { left: 4, right: 8, top: 12, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: dark ? 'rgba(34, 25, 55, 0.94)' : 'rgba(255, 255, 255, 0.96)',
        borderColor: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(106, 79, 192, 0.2)',
        textStyle: { color: dark ? '#faf8fd' : '#2e2440', fontFamily: 'Nunito Variable' },
        valueFormatter: (value: unknown) => formatValue(Number(value ?? 0)),
      },
      xAxis: {
        type: 'category',
        boundaryGap: this.kind() === 'bar',
        data: points.map((point) => dayFormatter.format(new Date(point.day))),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: text,
          fontFamily: 'Nunito Variable',
          fontSize: 10,
          interval: labelInterval,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: isCurrency ? undefined : 1,
        splitLine: { lineStyle: { color: grid } },
        splitNumber: 3,
        axisLabel: {
          color: text,
          fontFamily: 'Nunito Variable',
          fontSize: 10,
          formatter: (value: number) => (isCurrency ? `${Math.round(value / 100)} €` : value),
        },
      },
    };

    if (this.kind() === 'area') {
      return {
        ...base,
        series: [
          {
            name: this.title(),
            type: 'line',
            smooth: 0.35,
            symbol: 'circle',
            symbolSize: 7,
            showSymbol: false,
            data: points.map((point) => point.value),
            lineStyle: { width: 2, color: line },
            itemStyle: { color: line, borderColor: dark ? '#221937' : '#ffffff', borderWidth: 2 },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: dark ? 'rgba(139, 105, 214, 0.35)' : 'rgba(106, 79, 192, 0.28)' },
                  { offset: 1, color: 'rgba(106, 79, 192, 0)' },
                ],
              },
            },
          },
        ],
      };
    }

    return {
      ...base,
      series: [
        {
          name: this.title(),
          type: 'bar',
          data: points.map((point) => point.value),
          barMaxWidth: 16,
          itemStyle: { color: line, borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  });
}
