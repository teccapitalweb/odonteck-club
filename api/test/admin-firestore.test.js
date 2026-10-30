import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import { initializeApp, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { crearApp } from '../src/app.js';
import { crearEntorno, TOKENS, bearer, AHORA_ISO } from './fakes/app.js';

test('admin Firestore: transacción conserva cambios concurrentes, pagina empates y revierte si falla el registro', { skip: !process.env.FIRESTORE_EMULATOR_HOST }, async () => {
  assert.match(process.env.FIRESTORE_EMULATOR_HOST, /^(127\.0\.0\.1|localhost):\d+$/);
  const fb = initializeApp({ projectId: 'demo-odonteck-juegos' }, 'qa-admin');
  const db = getFirestore(fb);
  try {
    const base = crearEntorno();
    const ctx = { db, auth: base.auth, now: () => new Date(AHORA_ISO), logger: { error() {} } };
    const app = crearApp(ctx);
    const dar = (dias) => request(app).post('/admin/miembros/free1/cortesia').set(bearer(TOKENS.admin)).send({ dias, motivo: `Prueba aislada ${dias}` }).expect(201);
    await Promise.all([dar(7), dar(14)]);
    const eventos = (await db.collection('v2_admin_auditoria').get()).docs.map((d) => d.data());
    assert.equal(eventos.length, 2);
    const primero = eventos.find((e) => !e.antes);
    const segundo = eventos.find((e) => e.antes);
    assert.equal(segundo.antes.hasta, primero.despues.hasta);
    assert.equal((await db.doc('v2_cortesias/free1').get()).data().hasta, segundo.despues.hasta);

    // Forzar un fallo al COMMIT (el audit create colisiona con un documento).
    const colision = db.doc('v2_admin_auditoria/colision');
    await colision.set({ fecha: AHORA_ISO, prueba: true });
    const dbFalla = {
      collection: db.collection.bind(db),
      runTransaction: (fn) => db.runTransaction((tx) => {
        const crear = tx.create.bind(tx);
        tx.create = (ref, datos) => crear(ref.path.startsWith('v2_admin_auditoria/') ? colision : ref, datos);
        return fn(tx);
      }),
    };
    const appFalla = crearApp({ ...ctx, db: dbFalla });
    await request(appFalla).delete('/admin/miembros/free1/cortesia').set(bearer(TOKENS.admin)).send({ motivoAuditoria: 'Prueba de rollback' }).expect(500);
    assert.ok((await db.doc('v2_cortesias/free1').get()).exists, 'la cortesía no se borra cuando no se puede guardar su auditoría');
    assert.deepEqual((await colision.get()).data(), { fecha: AHORA_ISO, prueba: true });

    const batch = db.batch();
    for (let n = 0; n < 55; n++) batch.set(db.doc(`v2_admin_auditoria/pagina-${n}`), { fecha: AHORA_ISO, prueba: true });
    await batch.commit();
    const uno = (await request(app).get('/admin/bitacora').set(bearer(TOKENS.admin)).expect(200)).body;
    const dos = (await request(app).get(`/admin/bitacora?cursor=${uno.siguiente}`).set(bearer(TOKENS.admin)).expect(200)).body;
    assert.equal(new Set([...uno.eventos, ...dos.eventos].map((e) => e.id)).size, 58);
    assert.equal(dos.siguiente, null);
  } finally { await db.terminate(); await deleteApp(fb); }
});
