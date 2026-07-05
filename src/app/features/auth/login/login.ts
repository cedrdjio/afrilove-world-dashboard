import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CircleAlert,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  LucideAngularModule,
  Mail,
} from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Logo } from '../../../shared/ui/logo/logo';

/** Connexion au back-office — accès réservé aux comptes présents dans admin_users. */
@Component({
  selector: 'app-login',
  imports: [Logo, LucideAngularModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected readonly MailIcon = Mail;
  protected readonly LockIcon = Lock;
  protected readonly EyeIcon = Eye;
  protected readonly EyeOffIcon = EyeOff;
  protected readonly LoaderIcon = LoaderCircle;
  protected readonly AlertIcon = CircleAlert;

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly showPassword = signal(false);

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const { email, password } = this.form.getRawValue();
      const admin = await this.auth.signIn(email, password);
      this.toast.success('Bon retour !', `Connecté en tant que ${admin.role}.`);
      const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/';
      await this.router.navigateByUrl(redirect);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Connexion impossible.');
    } finally {
      this.loading.set(false);
    }
  }
}
