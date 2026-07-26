/**
 * Chargement résilient des modules « lazy » (routes, graphiques…).
 *
 * Deux pannes classiques d'une SPA sont neutralisées ici :
 *  1. Réseau lent/instable : un chunk peut échouer ponctuellement -> on réessaie.
 *  2. Coquille périmée après un déploiement : l'onglet ouvert exécute l'ancien
 *     code et demande un chunk dont le hash a changé (404) -> on recharge la
 *     page UNE fois pour récupérer le shell + les chunks à jour.
 *
 * Résultat : après une mise en ligne, l'admin n'est jamais bloqué sur un
 * « Failed to fetch dynamically imported module » — l'app se répare seule.
 */

const RELOAD_FLAG = 'afrilove:chunk-reload';

/** Détecte les erreurs de chargement d'un module dynamique (tous navigateurs). */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /dynamically imported module|error loading dynamically|loading chunk|importing a module script|failed to fetch|networkerror|load failed/i.test(
    message,
  );
}

/** Recharge la page une seule fois (garde anti-boucle) pour récupérer un shell frais. */
export function scheduleShellReload(): void {
  if (typeof window === 'undefined') return;
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return; // déjà tenté : on n'insiste pas
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  } catch {
    // sessionStorage indisponible : on recharge quand même une fois.
  }
  window.location.reload();
}

/** À appeler après un chargement réussi : réarme la possibilité d'une future recharge. */
function clearReloadGuard(): void {
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    /* no-op */
  }
}

/**
 * Enveloppe un `import()` de route avec reprise réseau puis auto-recharge.
 * Usage : `loadComponent: lazy(() => import('./x').then((m) => m.X))`.
 */
export function lazy<T>(loader: () => Promise<T>, retries = 2, backoffMs = 700): () => Promise<T> {
  return async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        const mod = await loader();
        clearReloadGuard();
        return mod;
      } catch (error) {
        // Encore des essais disponibles + panne de chargement -> on retente.
        if (attempt < retries && isChunkLoadError(error)) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
          continue;
        }
        // À bout d'essais : si c'est bien un chunk introuvable (déploiement),
        // on recharge une fois. La promesse ne se résout pas : la page part.
        if (isChunkLoadError(error)) {
          scheduleShellReload();
          return new Promise<T>(() => {});
        }
        throw error;
      }
    }
  };
}
