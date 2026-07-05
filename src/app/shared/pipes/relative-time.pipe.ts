import { Pipe, type PipeTransform } from '@angular/core';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** '2026-07-05T10:00:00Z' → « il y a 5 min » / « hier » / « 3 juil. ». */
@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);

    if (seconds < 60) {
      return "à l'instant";
    }
    if (seconds < 3600) {
      return `il y a ${Math.floor(seconds / 60)} min`;
    }
    if (seconds < 86_400) {
      return `il y a ${Math.floor(seconds / 3600)} h`;
    }
    if (seconds < 172_800) {
      return 'hier';
    }
    if (seconds < 7 * 86_400) {
      return `il y a ${Math.floor(seconds / 86_400)} j`;
    }
    return dateFormatter.format(date);
  }
}
