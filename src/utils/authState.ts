// utils/authState.ts
import { supabase } from "./supabaseClient";
import type { Session } from "@supabase/supabase-js";

type AuthListener = (isAuthed: boolean) => void;
type ReadyListener = (ready: boolean) => void;

const authListeners = new Set<AuthListener>();
const readyListeners = new Set<ReadyListener>();

let sessionCache: Session | null = null;
let profileCache: any = null; // 프로필 캐시 추가
let ready = false;
let initialized = false;
let authSubscription: { unsubscribe: () => void } | null = null;

export async function initAuthListener() {
  if (initialized) {
    console.log('🔍 이미 초기화됨');
    return;
  }
  initialized = true;
  console.log('🔍 initAuthListener 시작');

  const { data: { session } } = await supabase.auth.getSession();
  sessionCache = session;
  console.log('🔍 초기 세션:', session);

  if (!ready) {
    ready = true;
    console.log('🔍 ready 상태로 변경, 리스너들에게 알림:', readyListeners.size);
    readyListeners.forEach((fn) => fn(true));
  }
  authListeners.forEach((fn) => fn(!!sessionCache));

  const { data: subscription } = supabase.auth.onAuthStateChange((event, sess) => {
    console.log('🔍 auth 상태 변경:', event, sess);
    sessionCache = sess;

    if (event === 'SIGNED_OUT' || !sess) {
      profileCache = null;
    }

    authListeners.forEach((fn) => fn(!!sess));
    if (!ready) {
      ready = true;
      readyListeners.forEach((fn) => fn(true));
    }
  });
  authSubscription = subscription.subscription;
}

export function onAuthReady(fn: ReadyListener): () => void {
  readyListeners.add(fn);
  if (ready) fn(true);
  return () => { readyListeners.delete(fn); };
}

export function onAuthChange(fn: AuthListener, immediate = false): () => void {
  authListeners.add(fn);

  if (immediate && ready) {
    fn(!!sessionCache);
  }

  return () => { authListeners.delete(fn); };
}

export function getCachedSession() {
  return sessionCache;
}

// 프로필 캐시 관련 함수들
export function getCachedProfile() {
  return profileCache;
}

export function setCachedProfile(profile: any) {
  profileCache = profile;
}

export function clearProfileCache() {
  profileCache = null;
}

export async function waitForAccessToken(timeoutMs = 1000): Promise<Session | null> {
  if (sessionCache?.access_token) return sessionCache;
  return new Promise((resolve) => {
    const stop = supabase.auth.onAuthStateChange((_e, sess) => {
      if (sess?.access_token) {
        stop.data.subscription.unsubscribe();
        resolve(sess);
      }
    });
    setTimeout(() => {
      stop.data.subscription.unsubscribe();
      resolve(sessionCache);
    }, timeoutMs);
  });
}

export function cleanupAuthListener() {
  authSubscription?.unsubscribe();
  authListeners.clear();
  readyListeners.clear();
  sessionCache = null;
  profileCache = null; // 프로필 캐시도 클리어
  ready = false;
  initialized = false;
  authSubscription = null;
}

export function getAuthState() {
  return {
    ready,
    initialized,
    hasSession: !!sessionCache,
    hasProfile: !!profileCache,
    listenersCount: {
      auth: authListeners.size,
      ready: readyListeners.size,
    }
  };
}