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
    // Hors-ligne : inutile d'attendre un timeout, on le dit tout de suite.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new Error(
        'Vous semblez hors ligne. Vérifiez votre connexion Internet puis réessayez.',
      );
    }

    // Timeout explicite : sur réseau très lent, on échoue en ~20 s avec un
    // message clair plutôt que de laisser l'utilisateur attendre sans fin.
    let result: Awaited<ReturnType<typeof this.supabase.auth.signInWithPassword>>;
    try {
      result = await this.withTimeout(
        this.supabase.auth.signInWithPassword({ email, password }),
        20_000,
      );
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'TimeoutError') {
        throw new Error(
          'Le serveur met trop de temps à répondre (réseau lent ou service momentanément indisponible). Réessayez dans un instant.',
        );
      }
      throw new Error(
        "Impossible de joindre le serveur d'authentification. Réseau instable ou service indisponible.",
      );
    }

    const { data, error } = result;
    if (error) {
      throw new Error(this.translateAuthError(error));
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

  /** Course la promesse contre un timeout ; rejette avec un DOMException 'TimeoutError'. */
  private async withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new DOMException('timeout', 'TimeoutError')), ms);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * Traduit une erreur d'authentification Supabase en message précis.
   * Règle d'or : ne JAMAIS présenter une erreur serveur (5xx) comme un problème
   * réseau — sinon un vrai bug back-office passe pour une panne de connexion.
   */
  private translateAuthError(error: { status?: number; code?: string; message?: string }): string {
    const status = error.status ?? 0;
    const msg = error.message ?? '';
    const code = error.code ?? '';

    // Échec réseau remonté par supabase-js (fetch KO) : status 0.
    if (status === 0 || /failed to fetch|network|fetch failed|load failed/i.test(msg)) {
      return "Impossible de joindre le serveur d'authentification. Réseau instable ou service indisponible — réessayez dans un instant.";
    }
    // Identifiants incorrects.
    if (code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) {
      return 'E-mail ou mot de passe incorrect.';
    }
    if (code === 'email_not_confirmed' || /email not confirmed/i.test(msg)) {
      return 'Adresse e-mail non confirmée.';
    }
    if (status === 429 || /rate limit/i.test(msg)) {
      return 'Trop de tentatives. Patientez un instant avant de réessayer.';
    }
    // 5xx : anomalie côté serveur / base — c'est un incident technique, PAS la
    // connexion de l'utilisateur. On le nomme clairement pour qu'il soit traité.
    if (status >= 500) {
      return `Erreur côté serveur (${status}) : le service d'authentification a renvoyé une anomalie — ce n'est pas votre connexion. Signalez-le à l'équipe technique.`;
    }
    // Dernier recours : message explicite (statut + raison) plutôt que générique.
    return `Connexion refusée${status ? ` (code ${status})` : ''}. ${msg || 'Raison inconnue.'}`;
  }
}
