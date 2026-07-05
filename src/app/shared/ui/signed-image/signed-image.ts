import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { ImageOff, LucideAngularModule } from 'lucide-angular';
import { KycService } from '../../../features/kyc/kyc.service';

/** Image d'un bucket privé, chargée via URL signée (squelette pendant la résolution). */
@Component({
  selector: 'app-signed-image',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (url(); as resolved) {
      <img [src]="resolved" [alt]="alt()" class="size-full object-cover" loading="lazy" />
    } @else if (failed()) {
      <span class="flex size-full items-center justify-center bg-brand-500/8 text-ink-faint dark:bg-white/5 dark:text-cream-bezel2/50">
        <lucide-icon [img]="ImageOffIcon" [size]="20" />
      </span>
    } @else {
      <span class="skeleton block size-full !rounded-none"></span>
    }
  `,
  host: { class: 'block overflow-hidden' },
})
export class SignedImage {
  readonly path = input.required<string>();
  readonly alt = input('Document');

  private readonly kyc = inject(KycService);

  protected readonly ImageOffIcon = ImageOff;
  protected readonly url = signal<string | null>(null);
  protected readonly failed = signal(false);

  constructor() {
    effect(() => {
      const path = this.path();
      this.url.set(null);
      this.failed.set(false);
      void this.kyc.signedUrl(path).then((signed) => {
        if (path === this.path()) {
          this.url.set(signed);
          this.failed.set(signed === null);
        }
      });
    });
  }
}
