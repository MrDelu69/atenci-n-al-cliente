import { useSyncExternalStore } from "react";
import type { SupportCase } from "./cases";
import { seedCases } from "./seed";

const STORAGE_KEY = "bm-atencion-demo-v1";
const ACCESS_KEY = "bm-atencion-acceso";
const LAST_CREATED_KEY = "bm-atencion-ultimo";

export interface DemoState {
  cases: SupportCase[];
}

let state: DemoState | null = null;
const listeners = new Set<() => void>();

function read(): DemoState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (Array.isArray(parsed.cases)) return parsed;
    }
  } catch {
    // ignore corrupted storage
  }
  return { cases: seedCases() };
}

function getSnapshot(): DemoState {
  if (!state) state = read();
  return state;
}

function getServerSnapshot(): DemoState | null {
  return null;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = read();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(next: DemoState) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full or unavailable: keep in memory
  }
  emit();
}

/** Returns null until the browser store is available (SSR / first hydration pass). */
export function useDemoState(): DemoState | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveCase(updated: SupportCase) {
  const current = getSnapshot();
  const exists = current.cases.some((c) => c.code === updated.code);
  write({
    cases: exists
      ? current.cases.map((c) => (c.code === updated.code ? updated : c))
      : [...current.cases, updated],
  });
}

export function getCases(): SupportCase[] {
  return getSnapshot().cases;
}

export function resetDemo() {
  try {
    window.sessionStorage.removeItem(ACCESS_KEY);
    window.sessionStorage.removeItem(LAST_CREATED_KEY);
  } catch {
    // ignore
  }
  write({ cases: seedCases() });
}

// ---- Customer access (simulated, per browser tab session) ----

export function grantAccess(code: string) {
  const list = getGranted();
  if (!list.includes(code)) list.push(code);
  window.sessionStorage.setItem(ACCESS_KEY, JSON.stringify(list));
}

export function getGranted(): string[] {
  try {
    return JSON.parse(window.sessionStorage.getItem(ACCESS_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function setLastCreated(code: string) {
  window.sessionStorage.setItem(LAST_CREATED_KEY, code);
}

export function getLastCreated(): string | null {
  try {
    return window.sessionStorage.getItem(LAST_CREATED_KEY);
  } catch {
    return null;
  }
}
