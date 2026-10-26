import { Router } from 'express';
import { createHash } from 'node:crypto';
import { COL } from '../datos.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { h } from '../middleware/errores.js';
import {
  conflicto,
  invalido,
  noEncontrado,
  prohibido,
} from '../lib/errores.js';
import { cuerpo, slug, idDocumento } from '../lib/validacion.js';
import { normalizarEstadoRecompensas } from '../lib/recompensas.js';
import {
  RECOMPENSAS,
  CATALOGO_COL,
  leerCatalogoRecompensas,
  buscarRecompensa,
  validarAjusteRecompensa,
} from '../lib/recompensas-catalogo.js';
import { archivoRecompensa } from '../lib/recompensas-archivos.js';

export function rutasRecompensas(ctx) {
  const r = Router(),
    auth = requireAuth(ctx),
    db = ctx.db;
  r.get(
    '/recompensas/:id/archivo',
    auth,
    h(async (req, res) => {
      const id = slug(req.params.id, { campo: 'id' }),
        base = buscarRecompensa(id);
      if (base.tipo !== 'archivo')
        throw noEncontrado('Esta recompensa no tiene un archivo editable.');
      const snap = await db
        .collection(COL.recompensasEstado)
        .doc(req.usuario.uid)
        .get();
      const estado = normalizarEstadoRecompensas(
        snap.exists ? snap.data() : null,
        req.usuario.uid,
      );
      if (!estado.desbloqueos.recompensas.includes(id))
        throw prohibido('Canjea esta recompensa antes de descargarla.');
      const html = archivoRecompensa(id);
      if (!html) throw noEncontrado('El archivo no está disponible.');
      res.set('Content-Disposition', `attachment; filename="${id}.html"`);
      res.type('html').send(html);
    }),
  );
  r.post(
    '/recompensas/personalizacion',
    auth,
    h(async (req, res) => {
      const b = cuerpo(req),
        ranura = b.ranura;
      if (!['marco', 'portada'].includes(ranura))
        throw invalido('Elige marco o portada.');
      const id =
        b.recompensaId === null
          ? null
          : slug(b.recompensaId, { campo: 'recompensaId' });
      const base = id ? buscarRecompensa(id) : null;
      if (base && (base.tipo !== 'personalizacion' || base.ranura !== ranura))
        throw invalido('Este diseño no corresponde al espacio elegido.');
      const eRef = db.collection(COL.recompensasEstado).doc(req.usuario.uid),
        pRef = db.collection(COL.directorioPerfiles).doc(req.usuario.uid);
      const resultado = await db.runTransaction(async (tx) => {
        const [e, p] = await tx.getAll(eRef, pRef);
        if (!p.exists)
          throw conflicto(
            'Crea tu perfil del directorio antes de activar un diseño.',
            'sin_perfil',
          );
        const estado = normalizarEstadoRecompensas(
          e.exists ? e.data() : null,
          req.usuario.uid,
        );
        if (id && !estado.desbloqueos.recompensas.includes(id))
          throw prohibido('Primero canjea este diseño.');
        estado.personalizacion[ranura] = id;
        estado.actualizado = ctx.now().toISOString();
        tx.set(eRef, estado);
        tx.set(
          pRef,
          {
            personalizacion: {
              ...(p.data().personalizacion ?? {}),
              [ranura]: id,
            },
            actualizado: estado.actualizado,
          },
          { merge: true },
        );
        return estado.personalizacion;
      });
      res.json({ personalizacion: resultado });
    }),
  );
  r.use('/admin/recompensas', auth, requireAdmin);
  r.get(
    '/admin/recompensas',
    h(async (req, res) => {
      const [catalogo, canjes] = await Promise.all([
        leerCatalogoRecompensas(db),
        db
          .collection(COL.recompensasCanjes)
          .orderBy('solicitado', 'desc')
          .limit(100)
          .get(),
      ]);
      res.json({
        catalogo,
        canjes: canjes.docs.map((d) => ({ id: d.id, ...d.data() })),
        limiteCanjes: 100,
      });
    }),
  );
  r.post(
    '/admin/recompensas',
    h(async (req, res) => {
      const b = cuerpo(req),
        id = slug(b.id, { campo: 'id' });
      if (RECOMPENSAS.some((x) => x.id === id))
        throw conflicto('Este identificador ya existe.');
      const base = {
        id,
        titulo: 'Nueva recompensa',
        descripcion: 'Recompensa en preparación.',
        categoria: 'Beneficios especiales',
        tipo: 'manual',
        puntos: 100,
        estado: 'proximamente',
        icono: 'gift',
        entrega: 'Solicitud con seguimiento',
        incluye: [],
        nuevo: true,
      };
      const { id: ignorado, ...campos } = b;
      const ajuste = validarAjusteRecompensa(base, {}, campos);
      const ref = db.collection(CATALOGO_COL).doc(id);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists) throw conflicto('Este identificador ya existe.');
        tx.create(ref, {
          ...base,
          ...ajuste,
          actualizado: ctx.now().toISOString(),
          actualizadoPor: req.usuario.uid,
        });
      });
      res.status(201).json({ id });
    }),
  );
  r.patch(
    '/admin/recompensas/:id',
    h(async (req, res) => {
      const id = slug(req.params.id, { campo: 'id' }),
        body = cuerpo(req);
      const base = (await leerCatalogoRecompensas(db)).find((x) => x.id === id);
      if (!base) throw noEncontrado('Recompensa no encontrada.');
      const ref = db.collection(CATALOGO_COL).doc(id);
      const ajuste = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const siguiente = validarAjusteRecompensa(
          base,
          snap.exists ? snap.data() : {},
          body,
        );
        siguiente.actualizado = ctx.now().toISOString();
        siguiente.actualizadoPor = req.usuario.uid;
        tx.set(ref, siguiente);
        return siguiente;
      });
      res.json({ id, ...ajuste });
    }),
  );
  r.post(
    '/admin/recompensas/canjes/:id/resolver',
    h(async (req, res) => {
      const id = idDocumento(req.params.id, 'id'),
        b = cuerpo(req);
      if (!['entregado', 'cancelado'].includes(b.estatus))
        throw invalido('Selecciona entregado o cancelado.');
      if (typeof b.nota !== 'string' || !b.nota.trim() || b.nota.length > 500)
        throw invalido(
          'Añade una nota de seguimiento de hasta 500 caracteres.',
        );
      const ref = db.collection(COL.recompensasCanjes).doc(id);
      const resultado = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw noEncontrado('Canje no encontrado.');
        const c = snap.data();
        if (c.tipo !== 'manual')
          throw conflicto(
            'Las entregas automáticas no se modifican por esta ruta.',
          );
        if (c.estatus === b.estatus)
          return { ok: true, estatus: c.estatus, repetido: true };
        if (c.estatus !== 'pendiente')
          throw conflicto('Este canje ya fue resuelto.');
        const eRef = db.collection(COL.recompensasEstado).doc(c.uid),
          configRef = db.collection(CATALOGO_COL).doc(c.recompensaId);
        const movId = createHash('sha256')
          .update(`${c.uid}:reembolso:${id}`)
          .digest('hex')
          .slice(0, 40);
        const movRef = db.collection(COL.recompensasMovimientos).doc(movId);
        const [eSnap, configSnap, movSnap] = await tx.getAll(
          eRef,
          configRef,
          movRef,
        );
        const estado = normalizarEstadoRecompensas(
            eSnap.exists ? eSnap.data() : null,
            c.uid,
          ),
          ahora = ctx.now().toISOString();
        if (b.estatus === 'cancelado') {
          if (movSnap.exists)
            throw conflicto('El reembolso ya está registrado.');
          estado.saldo += c.puntos;
          estado.gastados = Math.max(0, estado.gastados - c.puntos);
          tx.create(movRef, {
            uid: c.uid,
            clave: `reembolso:${id}`,
            tipo: 'reembolso',
            puntos: c.puntos,
            detalle: `Devolución: ${c.titulo}`,
            fecha: ahora,
          });
          if (c.reservaCupo)
            tx.set(configRef, {
              ...(configSnap.exists ? configSnap.data() : {}),
              cupo: Math.max(0, Number(configSnap.data()?.cupo) || 0) + 1,
              actualizado: ahora,
            });
        }
        estado.actualizado = ahora;
        const notificacion = {
          id: `canje-${id}-${b.estatus}`,
          tipo: 'recompensa',
          titulo:
            b.estatus === 'entregado'
              ? 'Recompensa entregada'
              : 'OdonCoins devueltos',
          texto: b.nota.trim(),
          enlace: '#/recompensas?vista=coleccion',
          fecha: ahora,
          leida: false,
        };
        estado.notificaciones = [...estado.notificaciones, notificacion].slice(
          -30,
        );
        tx.set(eRef, estado);
        tx.update(ref, {
          estatus: b.estatus,
          nota: b.nota.trim(),
          resuelto: ahora,
          resueltoPor: req.usuario.uid,
        });
        return { ok: true, estatus: b.estatus, saldo: estado.saldo };
      });
      res.json(resultado);
    }),
  );
  return r;
}
