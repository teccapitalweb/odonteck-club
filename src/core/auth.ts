// Autenticación. Modo api: Firebase Auth real (proyecto club-odonteck) + token para el backend.
// Modo demo: sesión simulada en el navegador para poder recorrer la app y el admin sin credenciales.
import { Datos } from './datos';
import { Perfil, type Perfil as PerfilDatos } from './perfil';

export interface Usuario { uid: string; email: string; nombre: string; foto: string; esAdmin: boolean; esVip: boolean }

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyA3xYpORcvvcXrhNaXOBBBPm19mxdIcNsU',
  authDomain: 'club-odonteck.firebaseapp.com',
  projectId: 'club-odonteck',
  storageBucket: 'club-odonteck.firebasestorage.app',
  messagingSenderId: '306331582203',
  appId: '1:306331582203:web:7d70e51f0180528ddffa5e',
};
const API = import.meta.env.VITE_API_URL as string | undefined;
const DEMO_KEY = 'odonteck-club:demo-sesion';

let fb: typeof import('firebase/auth') | null = null;
let authInst: import('firebase/auth').Auth | null = null;
let usuario: Usuario | null = null;
let listo: Promise<void> | null = null;
let perfilListo: Promise<void> | null = null;
let perfilResuelto = true;
let firebaseListo: Promise<void> | null = null;
let quitarObservador: (() => void) | null = null;
let generacionAuth = 0;

if (API) {
  try {
    const origen = new URL(API).origin;
    if (!document.querySelector(`link[rel="preconnect"][href="${origen}"]`)) {
      document.head.append(Object.assign(document.createElement('link'), { rel: 'preconnect', href: origen, crossOrigin: 'anonymous' }));
    }
  } catch { /* URL relativa: no hay otro origen que precalentar */ }
}

async function cargarFirebase() {
  if (!firebaseListo) firebaseListo = (async () => {
    const [{ initializeApp }, modAuth] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
    fb = modAuth;
    // Firebase migra una sesión previa de localStorage y utiliza el almacén disponible.
    authInst = fb.initializeAuth(initializeApp(FIREBASE_CONFIG), {
      persistence: [fb.indexedDBLocalPersistence, fb.browserLocalPersistence],
      popupRedirectResolver: fb.browserPopupRedirectResolver,
    });
  })().catch((e) => { firebaseListo = null; throw e; });
  return firebaseListo;
}

export const Auth = {
  modo: Datos.modo,
  get usuario() { return usuario; },

  iniciar(): Promise<void> {
    if (listo) return listo;
    listo = (async () => {
      if (Datos.modo === 'demo') {
        usuario = localStorage.getItem(DEMO_KEY) ? { uid: 'demo', email: 'demo@odonteck.club', nombre: 'Modo demo', foto: '', esAdmin: true, esVip: !!localStorage.getItem('odonteck-club:vip-sim') } : null;
        return;
      }
      try { localStorage.removeItem(DEMO_KEY); } catch {}
      await cargarFirebase();
      quitarObservador?.();
      await new Promise<void>((ok, fail) => {
        quitarObservador = fb!.onAuthStateChanged(authInst!, async (u) => {
          const gen = ++generacionAuth;
          const anterior = usuario?.uid ?? null;
          const cambioCuenta = anterior !== null && anterior !== (u?.uid ?? null);
          Perfil.seleccionarCuenta(u?.uid ?? null);
          if (!u) { usuario = null; perfilListo = null; perfilResuelto = true; ok(); if (cambioCuenta) window.dispatchEvent(new Event('auth:cuenta-cambio')); return; }
          try {
            const tok = await u.getIdTokenResult();
            if (gen !== generacionAuth) { ok(); return; }
            usuario = { uid: u.uid, email: u.email || '', nombre: u.displayName || u.email?.split('@')[0] || '', foto: u.photoURL || '', esAdmin: tok.claims.admin === true, esVip: false };
            // esVip solo llega con /me: lo que decida paywalls o acceso admin debe esperar Auth.perfil().
            perfilResuelto = false;
            perfilListo = api<{ esVip: boolean; esAdmin?: boolean; plan?: string | null; vence?: string | null; perfil?: Partial<PerfilDatos> }>('/me').then((me) => {
              const actual = usuario;
              if (!actual || actual.uid !== u.uid || gen !== generacionAuth) return;
              usuario = { ...actual, esVip: me.esVip, esAdmin: me.esAdmin === true || actual.esAdmin, nombre: me.perfil?.nombre || actual.nombre };
              if (me.perfil) Perfil.hidratar(me.perfil, me.plan, me.vence);
              perfilResuelto = true;
            }).catch(() => { /* No convertir un fallo de red en perfil gratis confirmado. */ });
            ok();
            if (cambioCuenta) window.dispatchEvent(new Event('auth:cuenta-cambio'));
          } catch (error) { perfilResuelto = false; listo = null; fail(error); }
        });
      });
    })().catch((error) => { listo = null; throw error; });
    return listo;
  },
  async perfil(): Promise<void> {
    await perfilListo;
    if (Datos.modo === 'api' && usuario && !perfilResuelto) await this.refrescarPerfil();
  },
  async refrescarPerfil(): Promise<void> {
    if (Datos.modo !== 'api' || !usuario) return;
    const uid = usuario.uid;
    const gen = generacionAuth;
    const me = await api<{ esVip: boolean; esAdmin?: boolean; plan?: string | null; vence?: string | null; perfil?: Partial<PerfilDatos> }>('/me');
    if (!usuario || usuario.uid !== uid || gen !== generacionAuth) return;
    usuario = { ...usuario, esVip: me.esVip, esAdmin: me.esAdmin === true || usuario.esAdmin, nombre: me.perfil?.nombre || usuario.nombre };
    if (me.perfil) Perfil.hidratar(me.perfil, me.plan, me.vence);
    perfilResuelto = true;
  },
  /** false mientras /me no responde: el cascarón no debe pintarse con esVip o perfil provisionales. */
  perfilResuelto(): boolean { return perfilResuelto; },

  async entrarDemo() { localStorage.setItem(DEMO_KEY, '1'); listo = null; await this.iniciar(); },

  async entrarCorreo(email: string, pass: string) {
    if (!fb) await cargarFirebase();
    await fb!.signInWithEmailAndPassword(authInst!, email, pass); listo = null; await this.iniciar();
  },
  async registrar(nombre: string, email: string, pass: string) {
    if (!fb) await cargarFirebase();
    const cred = await fb!.createUserWithEmailAndPassword(authInst!, email, pass);
    await fb!.updateProfile(cred.user, { displayName: nombre }); listo = null; await this.iniciar();
  },
  async entrarGoogle() {
    if (!fb) await cargarFirebase();
    await fb!.signInWithPopup(authInst!, new fb!.GoogleAuthProvider()); listo = null; await this.iniciar();
  },
  async recuperar(email: string) {
    if (!fb) await cargarFirebase();
    await fb!.sendPasswordResetEmail(authInst!, email);
  },
  async salir() {
    generacionAuth++;
    if (Datos.modo === 'demo') localStorage.removeItem(DEMO_KEY);
    else if (authInst) await fb!.signOut(authInst);
    usuario = null; listo = null; perfilListo = null; perfilResuelto = true;
    Perfil.seleccionarCuenta(null);
  },
  async token() { return authInst?.currentUser ? authInst.currentUser.getIdToken() : null; },
};

// Cliente del backend (docs/contrato.md)
export async function api<T>(ruta: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  if (!API) throw new Error('Sin VITE_API_URL: la app está en modo demo');
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  const t = await Auth.token(); if (t) headers.Authorization = `Bearer ${t}`;
  if (init.json !== undefined) { headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(init.json); }
  const r = await fetch(API.replace(/\/$/, '') + ruta, { ...init, headers });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(data.mensaje || `Error ${r.status}`), { status: r.status, codigo: data.error });
  return data as T;
}

export const mensajeError = (e: any) => ({
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'No encontramos una cuenta con ese correo.',
  'auth/email-already-in-use': 'Ese correo ya tiene cuenta. Inicia sesión.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-email': 'El correo no es válido.',
  'auth/popup-closed-by-user': 'Se cerró la ventana de Google antes de terminar.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
} as Record<string, string>)[e?.code] || e?.message || 'Algo salió mal. Intenta de nuevo.';
