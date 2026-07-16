type StatusListener = (state: StatusState) => void;

export interface StatusState {
  busy: boolean;
  message: string | null;
}

let busyCount = 0;
let message: string | null = null;
const listeners = new Set<StatusListener>();

function notify() {
  const state = { busy: busyCount > 0, message: busyCount > 0 ? message : null };
  listeners.forEach((listener) => listener(state));
}

export function subscribeStatus(listener: StatusListener): () => void {
  listeners.add(listener);
  listener({ busy: busyCount > 0, message: busyCount > 0 ? message : null });
  return () => listeners.delete(listener);
}

export function beginBusy(statusMessage?: string) {
  busyCount += 1;
  if (statusMessage) {
    message = statusMessage;
  } else if (!message) {
    message = 'Loading…';
  }
  notify();
}

export function endBusy() {
  busyCount = Math.max(0, busyCount - 1);
  if (busyCount === 0) {
    message = null;
  }
  notify();
}

export async function runBusy<T>(statusMessage: string, fn: () => Promise<T>): Promise<T> {
  beginBusy(statusMessage);
  try {
    return await fn();
  } finally {
    endBusy();
  }
}
