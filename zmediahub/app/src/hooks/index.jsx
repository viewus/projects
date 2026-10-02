import { createContext, useContext, useEffect, useState, useCallback, useSyncExternalStore, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applySEO } from '../services/seo.js';

export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

/** Optional features can be switched off in data/site.json -> features. */
export const featureOn = (config, name) => !name || config.site?.features?.[name] !== false;
export const useFeature = (name) => featureOn(useApp().config, name);

/** Run an async DataService call; re-runs when deps change. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const run = useRef(0);
  useEffect(() => {
    const id = ++run.current;
    setState((s) => ({ data: s.data, loading: true, error: null }));
    Promise.resolve().then(fn).then(
      (data) => run.current === id && setState({ data, loading: false, error: null }),
      (error) => { console.error(error); run.current === id && setState({ data: null, loading: false, error }); },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

/** URL query params as an object + a setter that resets "page" when filters change. */
export function useQuery() {
  const [sp, setSp] = useSearchParams();
  const params = Object.fromEntries(sp.entries());
  const set = useCallback((changes, { keepPage = false } = {}) => {
    setSp((prev) => {
      const q = new URLSearchParams(prev);
      Object.entries(changes).forEach(([k, v]) => (v === '' || v == null ? q.delete(k) : q.set(k, v)));
      if (!keepPage && !('page' in changes)) q.delete('page');
      return q;
    });
  }, [setSp]);
  return [params, set];
}

/** Subscribe to a persisted Set store (bookmarks, follows). */
export function useStoreHas(store, id) {
  const subscribe = useCallback((cb) => store.subscribe(cb), [store]);
  return useSyncExternalStore(subscribe, () => store.has(id), () => false);
}

/** true while the media query matches (e.g. useMedia('(max-width: 768px)')) */
export function useMedia(query) {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query); const h = () => setOn(m.matches);
    h(); m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, [query]);
  return on;
}

export function usePageSEO(opts, deps) {
  useEffect(() => { if (opts) applySEO(opts); }, deps ?? [JSON.stringify(opts)]); // eslint-disable-line react-hooks/exhaustive-deps
}
