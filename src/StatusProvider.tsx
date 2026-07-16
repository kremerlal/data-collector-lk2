import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { beginBusy, endBusy, runBusy, subscribeStatus, type StatusState } from './statusBus';

interface StatusContextValue {
  busy: boolean;
  message: string | null;
  run: <T>(message: string, fn: () => Promise<T>) => Promise<T>;
  begin: (message?: string) => void;
  end: () => void;
}

const StatusContext = createContext<StatusContextValue | null>(null);

export function StatusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StatusState>({ busy: false, message: null });

  useEffect(() => subscribeStatus(setState), []);

  useEffect(() => {
    document.body.classList.toggle('app-busy', state.busy);
    return () => document.body.classList.remove('app-busy');
  }, [state.busy]);

  const begin = useCallback((msg?: string) => beginBusy(msg), []);
  const end = useCallback(() => endBusy(), []);
  const run = useCallback(<T,>(msg: string, fn: () => Promise<T>) => runBusy(msg, fn), []);

  const value = useMemo(
    () => ({ busy: state.busy, message: state.message, run, begin, end }),
    [state.busy, state.message, run, begin, end],
  );

  return <StatusContext.Provider value={value}>{children}</StatusContext.Provider>;
}

export function useStatus() {
  const ctx = useContext(StatusContext);
  if (!ctx) {
    throw new Error('useStatus must be used within StatusProvider');
  }
  return ctx;
}
