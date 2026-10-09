// Dobles de Firebase Auth, Cloud Storage y Stripe para los tests de rutas.
import Stripe from 'stripe';

/**
 * Auth falso. `tokens` mapea el ID token (cadena) al token decodificado.
 * Un token que no está en el mapa se rechaza como lo haría verifyIdToken.
 */
export function crearAuthFalso({ tokens = {}, usuarios = {} } = {}) {
  const llamadas = [];
  return {
    llamadas,
    async verifyIdToken(token, checkRevoked) {
      llamadas.push({ token, checkRevoked });
      const decodificado = tokens[token];
      if (!decodificado) {
        const e = new Error('Firebase ID token has invalid signature.');
        e.code = 'auth/argument-error';
        throw e;
      }
      if (decodificado.revocado) {
        const e = new Error('The Firebase ID token has been revoked.');
        e.code = 'auth/id-token-revoked';
        throw e;
      }
      return decodificado;
    },
    async getUser(uid) {
      const u = usuarios[uid];
      if (!u) {
        const e = new Error('There is no user record corresponding to the provided identifier.');
        e.code = 'auth/user-not-found';
        throw e;
      }
      return { uid, ...u };
    },
  };
}

export function crearStorageFalso() {
  const firmadas = [];
  const borrados = [];
  return {
    firmadas,
    borrados,
    bucket(nombre) {
      const bucketName = nombre ?? 'bucket-de-prueba';
      return {
        name: bucketName,
        file(path) {
          return {
            name: path,
            async getSignedUrl(opciones) {
              firmadas.push({ path, ...opciones });
              return [`https://storage.example.test/${bucketName}/${path}?accion=${opciones.action}&firma=falsa`];
            },
            async delete() {
              borrados.push(path);
            },
          };
        },
      };
    },
  };
}

export function crearMaterialesFalsos(ids = []) {
  const disponibles = new Set(ids);
  return {
    ids: () => new Set(disponibles),
    tiene: (id) => disponibles.has(id),
    urlFirmada(id, origen, expira) {
      if (!disponibles.has(id)) return null;
      return `${origen}/materiales/${id}/archivo?exp=${expira}&token=firma-falsa`;
    },
    validar(id, expira, token) {
      return disponibles.has(id) && Number.isFinite(Number(expira)) && token === 'firma-falsa';
    },
    enviar(id, res) {
      if (!disponibles.has(id)) return false;
      res.set('Content-Type', 'application/pdf');
      res.send(Buffer.from('%PDF-1.4\nmaterial de prueba'));
      return true;
    },
  };
}

/**
 * Stripe falso para checkout/portal/retrieve. Para el webhook se usa la verificación
 * de firma REAL de la librería de Stripe (no hace red), así el test de firma es auténtico.
 */
export function crearStripeFalso({ suscripciones = {} } = {}) {
  const real = new Stripe('sk_test_solo_para_firmas_locales');
  const creadas = { checkout: [], portal: [] };
  return {
    creadas,
    webhooks: real.webhooks,
    checkout: {
      sessions: {
        async create(params) {
          creadas.checkout.push(params);
          return { id: `cs_test_${creadas.checkout.length}`, url: `https://checkout.stripe.test/pay/cs_test_${creadas.checkout.length}` };
        },
      },
    },
    billingPortal: {
      sessions: {
        async create(params) {
          creadas.portal.push(params);
          return { id: 'bps_test_1', url: 'https://billing.stripe.test/p/session/bps_test_1' };
        },
      },
    },
    subscriptions: {
      async retrieve(id) {
        const s = suscripciones[id];
        if (!s) throw new Error(`No such subscription: ${id}`);
        return structuredClone(s);
      },
    },
  };
}
