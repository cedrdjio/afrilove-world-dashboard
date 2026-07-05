import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Session } from '@supabase/supabase-js';
import { ROLE_LABEL, type AdminRole, type AdminUser } from '../../models/admin.model';
import { SupabaseClientService } from '../services/supabase-client.service';

/**
 * Contrôleur d'authentification (signals) : session Supabase + rôle back-office.
 * Un utilisateur n'est considéré connecté que s'il possède une ligne active
 * dans `admin_users` — un compte de l'app mobile sans rôle est refusé.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly router = inject(Router);

  private readonly _session = signal<Session | null>(null);
  private readonly _admin = signal<AdminUser | null>(null);

  readonly session = this._session.asReadonly();
  readonly admin = this._admin.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null && this._admin() !== null);
  readonly role = computed<AdminRole | null>(() => this._admin()?.role ?? null);
  readonly roleLabel = computed(() => {
    const role = this.role();
    return role ? ROLE_LABEL[role] : '';
  });
  readonly email = computed(() => this._session()?.user.email ?? '');
  readonly displayName = computed(
    () => this._admin()?.display_name || this.email().split('@')[0] || 'Admin',
  );
  readonly initials = computed(() =>
    this.displayName()
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join(''),
  );

  /** Restaure la session au démarrage (bloque le bootstrap via provideAppInitializer). */
  async init(): Promise<void> {
    try {
      const { data } = await this.supabase.auth.getSession();
      this._session.set(data.session);
      if (data.session) {
        this._admin.set(await this.fetchAdmin(data.session.user.id));
      }
    } catch {
      // Hors-ligne ou stockage corrompu : on démarre déconnecté.
      this._session.set(null);
      this._admin.set(null);
    }

    this.supabase.auth.onAuthStateChange((event, session) => {
      this._session.set(session);
      if (event === 'SIGNED_OUT') {
        this._admin.set(null);
        void this.router.navigate(['/login']);
      }
    });
  }

  async signIn(email: string, password: string): Promise<AdminUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(this.translateAuthError(error.message));
    }

    const admin = await this.fetchAdmin(data.user.id);
    if (!admin) {
      await this.supabase.auth.signOut();
      throw new Error("Ce compte n'a pas accès à la console d'administration.");
    }

    this._session.set(data.session);
    this._admin.set(admin);
    return admin;
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  private async fetchAdmin(userId: string): Promise<AdminUser | null> {
    const { data, error } = await this.supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      throw new Error('Impossible de vérifier vos accès. Réessayez.');
    }
    return data?.is_active ? data : null;
  }

  private translateAuthError(message: string): string {
    if (/invalid login credentials/i.test(message)) {
      return 'E-mail ou mot de passe incorrect.';
    }
    if (/email not confirmed/i.test(message)) {
      return 'Adresse e-mail non confirmée.';
    }
    if (/rate limit/i.test(message)) {
      return 'Trop de tentatives. Patientez un instant.';
    }
    return 'Connexion impossible. Vérifiez votre réseau et réessayez.';
  }
}
