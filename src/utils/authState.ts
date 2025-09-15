// utils/authState.ts
import { supabase } from "./supabaseClient";
type Listener = (isAuthed: boolean) => void;
const listeners = new Set<Listener>();

export function initAuthListener() {
  supabase.auth.onAuthStateChange((_e, session) => {
    const authed = !!session;
    listeners.forEach(l => l(authed));
  });
}

export function onAuthChange(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
