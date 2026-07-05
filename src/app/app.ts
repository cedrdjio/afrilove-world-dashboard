import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ToastContainer } from './shared/ui/toast/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    <app-toast-container />
  `,
})
export class App {
  // Instancié dès la racine pour synchroniser la classe .dark et la persistance.
  private readonly theme = inject(ThemeService);
}
