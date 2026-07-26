import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Logo AfriLove World — femme afro & homme européen dans un cœur lavande
 * (charte officielle). Rendu via l'image transparente : net sur fond clair
 * comme sur les panneaux sombres, sans dépendre du thème.
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img
      src="logo-afrilove.png"
      alt=""
      aria-hidden="true"
      draggable="false"
      [style.width.px]="size()"
      [style.height.px]="size()"
      style="object-fit: contain; user-select: none;"
    />
  `,
})
export class Logo {
  readonly size = input(36);
}
