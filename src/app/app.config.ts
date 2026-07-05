import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { QueryClient, provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { provideEchartsCore } from 'ngx-echarts';
import { AppTitleStrategy } from './core/app-title.strategy';
import { AuthService } from './core/auth/auth.service';
import { GlobalErrorHandler } from './core/error/global-error-handler';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withViewTransitions(),
    ),
    // Restaure la session Supabase avant le premier passage des guards.
    provideAppInitializer(() => inject(AuthService).init()),
    provideTanStackQuery(
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 15_000, refetchOnWindowFocus: true },
        },
      }),
    ),
    // ECharts en build minimal, chargé uniquement avec les pages à graphiques.
    provideEchartsCore({
      echarts: () => import('./shared/charts/echarts-core').then((m) => m.default),
    }),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ],
};
