import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Logo AfriLove — deux cœurs entrelacés, repris de l'app mobile. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="alw-heart" x1="4" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stop-color="#8B69D6" />
          <stop offset="1" stop-color="#5B3E9E" />
        </linearGradient>
      </defs>
      <path
        d="M20 40.5C11 33 4 27.5 4 19.6 4 13.7 8.6 9 14.4 9c3.3 0 6.4 1.6 8.3 4.1C24.6 10.6 27.7 9 31 9c5.8 0 10.4 4.7 10.4 10.6 0 7.9-7 13.4-16 20.9l-2.7 2.2-2.7-2.2Z"
        fill="url(#alw-heart)"
      />
      <path
        d="M33.5 25.4c-4.6-3.8-8.1-6.6-8.1-10.6 0-3 2.3-5.3 5.2-5.3 1.6 0 3.2.8 4.2 2 1-1.2 2.5-2 4.2-2 2.9 0 5.2 2.4 5.2 5.3 0 4-3.5 6.8-8 10.6l-1.4 1.1-1.3-1.1Z"
        fill="#C3B1E1"
        opacity="0.92"
      />
    </svg>
  `,
})
export class Logo {
  readonly size = input(36);
}
