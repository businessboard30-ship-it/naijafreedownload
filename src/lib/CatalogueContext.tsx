import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Release } from '../types';
import { sanitise } from './catalogue';
import { CATALOGUE_URL } from '../config/site';

type State = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; releases: Release[] };
interface Ctx { state: State; reload: () => void }
const CatalogueCtx = createContext<Ctx | null>(null);

export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    fetch(CATALOGUE_URL, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
      .then((r) => { if (!r.ok) throw new Error(`The catalogue request failed (HTTP ${r.status}).`); return r.json(); })
      .then((d) => setState({ status: 'ready', releases: sanitise(d) }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setState({ status: 'error', message: e instanceof SyntaxError ? 'The catalogue file is not valid JSON.' : e instanceof Error ? e.message : 'The catalogue could not be loaded.' });
      });
    return () => ctrl.abort();
  }, [attempt]);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const value = useMemo(() => ({ state, reload }), [state, reload]);
  return <CatalogueCtx.Provider value={value}>{children}</CatalogueCtx.Provider>;
}
export function useCatalogue(): Ctx {
  const c = useContext(CatalogueCtx);
  if (!c) throw new Error('useCatalogue must be used inside CatalogueProvider');
  return c;
}
