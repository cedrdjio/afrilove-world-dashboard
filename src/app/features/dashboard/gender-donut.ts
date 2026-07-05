import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsCoreOption } from 'echarts/core';
import { ThemeService } from '../../core/services/theme.service';
import type { GenderStat } from '../../models/dashboard.model';

const GENDER_LABEL: Record<string, string> = {
  homme: 'Hommes',
  femme: 'Femmes',
};

// Couleurs stables par entité, validées CVD/contraste sur chaque surface
// (voir skill dataviz) : Hommes = violet, Femmes = lilas, inconnu = gris neutre.
const LIGHT_COLORS: Record<string, string> = {
  Hommes: '#5b3e9e',
  Femmes: '#9b7ede',
  'Non renseigné': '#8a7fa0',
};
const DARK_COLORS: Record<string, string> = {
  Hommes: '#6a4fc0',
  Femmes: '#9b7ede',
  'Non renseigné': '#5e5473',
};

/** Répartition par genre — donut à segments espacés + étiquettes directes. */
@Component({
  selector: 'app-gender-donut',
  imports: [NgxEchartsDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="glass-card flex h-full flex-col p-5">
      <h2 class="font-display text-sm font-bold text-ink dark:text-cream">Genres</h2>
      <p class="text-xs text-ink-muted dark:text-cream-bezel2">Répartition des membres</p>
      <div
        echarts
        [options]="chartOptions()"
        class="min-h-0 w-full flex-1"
        style="height: 220px"
        role="img"
        aria-label="Répartition des membres par genre"
      ></div>
    </article>
  `,
})
export class GenderDonut {
  readonly genders = input.required<GenderStat[]>();

  private readonly theme = inject(ThemeService);

  protected readonly chartOptions = computed<EChartsCoreOption>(() => {
    const dark = this.theme.theme() === 'dark';
    const colors = dark ? DARK_COLORS : LIGHT_COLORS;
    const surface = dark ? '#221937' : '#ffffff';
    const text = dark ? '#d9c9f1' : '#5e5473';

    const data = this.genders()
      .map((stat) => {
        const name = stat.gender ? (GENDER_LABEL[stat.gender] ?? stat.gender) : 'Non renseigné';
        return { name, value: stat.count, itemStyle: { color: colors[name] ?? colors['Non renseigné'] } };
      })
      .sort((a, b) => b.value - a.value);

    return {
      animationDuration: 500,
      tooltip: {
        trigger: 'item',
        backgroundColor: dark ? 'rgba(34, 25, 55, 0.94)' : 'rgba(255, 255, 255, 0.96)',
        borderColor: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(106, 79, 192, 0.2)',
        textStyle: { color: dark ? '#faf8fd' : '#2e2440', fontFamily: 'Nunito Variable' },
        formatter: '{b} : {c} ({d} %)',
      },
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 9,
        itemHeight: 9,
        textStyle: { color: text, fontFamily: 'Nunito Variable', fontSize: 11 },
      },
      series: [
        {
          name: 'Genres',
          type: 'pie',
          radius: ['52%', '78%'],
          center: ['50%', '44%'],
          // Espace de 2 px entre segments (anneau couleur surface).
          itemStyle: { borderColor: surface, borderWidth: 2, borderRadius: 4 },
          label: {
            show: true,
            formatter: '{d} %',
            color: text,
            fontFamily: 'Nunito Variable',
            fontSize: 10,
          },
          labelLine: { length: 8, length2: 6 },
          data,
        },
      ],
    };
  });
}
