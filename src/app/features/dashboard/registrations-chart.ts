import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsCoreOption } from 'echarts/core';
import { ThemeService } from '../../core/services/theme.service';
import type { RegistrationPoint } from '../../models/dashboard.model';

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** Aire lissée des inscriptions (série unique, teinte marque, thème réactif). */
@Component({
  selector: 'app-registrations-chart',
  imports: [NgxEchartsDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      echarts
      [options]="chartOptions()"
      class="h-64 w-full sm:h-72"
      role="img"
      aria-label="Courbe des inscriptions des 14 derniers jours"
    ></div>
  `,
})
export class RegistrationsChart {
  readonly points = input.required<RegistrationPoint[]>();

  private readonly theme = inject(ThemeService);

  protected readonly chartOptions = computed<EChartsCoreOption>(() => {
    const dark = this.theme.theme() === 'dark';
    const points = this.points();
    const line = dark ? '#8b69d6' : '#6a4fc0';
    const text = dark ? '#d9c9f1' : '#5e5473';
    const grid = dark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(46, 36, 64, 0.08)';

    return {
      animationDuration: 600,
      grid: { left: 8, right: 12, top: 18, bottom: 8, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line', lineStyle: { color: line, opacity: 0.35 } },
        backgroundColor: dark ? 'rgba(34, 25, 55, 0.94)' : 'rgba(255, 255, 255, 0.96)',
        borderColor: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(106, 79, 192, 0.2)',
        textStyle: { color: dark ? '#faf8fd' : '#2e2440', fontFamily: 'Nunito Variable' },
        valueFormatter: (value: unknown) => `${value} inscription(s)`,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: points.map((point) => dayFormatter.format(new Date(point.day))),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: text, fontFamily: 'Nunito Variable', fontSize: 11, interval: 1 },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: grid } },
        axisLabel: { color: text, fontFamily: 'Nunito Variable', fontSize: 11 },
      },
      series: [
        {
          name: 'Inscriptions',
          type: 'line',
          smooth: 0.35,
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: false,
          data: points.map((point) => point.count),
          lineStyle: { width: 2, color: line },
          itemStyle: { color: line, borderColor: dark ? '#221937' : '#ffffff', borderWidth: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: dark ? 'rgba(139, 105, 214, 0.35)' : 'rgba(106, 79, 192, 0.28)' },
                { offset: 1, color: 'rgba(106, 79, 192, 0)' },
              ],
            },
          },
        },
      ],
    };
  });
}
