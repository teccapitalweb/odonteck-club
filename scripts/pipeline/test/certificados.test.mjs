import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aIso, asignarFolios, planMigracion, resolverCurso } from '../lib/certificados.mjs';
import { fixtureJson } from './helpers.mjs';

const catalogo = fixtureJson('catalogo-mini.json');
// Forma real de un doc viejo según emitirCertificadoFirestore() en vip-panel.html.
const viejo = (extra = {}) => ({
  folio: 'OdonTeck-2026-ABC123', uid: 'u1', nombre: 'Dra. Ana Pérez', cursoId: 'AutoIdFirestore1',
  curso: 'Diagnóstico en Ortodoncia', area: 'Odontología General', horas: 5, sesiones: 2,
  instructor: 'Equipo OdonTeck', emitido: '2026-03-10T15:00:00.000Z', year: 2026, createdAt: { _seconds: 1773154800, _nanoseconds: 0 },
  ...extra,
});

test('resolverCurso: por id, título y cursos viejos (título o videoIds)', () => {
  assert.equal(resolverCurso({ cursoId: 'periodoncia-basica' }, catalogo).via, 'cursoId');
  assert.equal(resolverCurso({ cursoId: 'x', curso: 'DIAGNÓSTICO en ortodoncia' }, catalogo).curso.id, 'diagnostico-en-ortodoncia');
  const cursosViejos = new Map([
    ['A', { titulo: 'Periodoncia básica' }],
    ['B', { titulo: 'Otro nombre', sesiones: [{ videoId: 'v-2' }, { videoId: 'zzz' }] }],
    ['C', { titulo: 'Nada', sesiones: [{ videoId: 'zzz' }] }],
  ]);
  assert.equal(resolverCurso({ cursoId: 'A', curso: 'renombrado' }, catalogo, cursosViejos).via, 'cursos-viejos.titulo');
  const porVideo = resolverCurso({ cursoId: 'B' }, catalogo, cursosViejos);
  assert.deepEqual([porVideo.curso.id, porVideo.via], ['diagnostico-en-ortodoncia', 'cursos-viejos.videoId']);
  assert.equal(resolverCurso({ cursoId: 'C' }, catalogo, cursosViejos).curso, null);
});

test('planMigracion mapea campos al contrato v2 y conserva folioAnterior', () => {
  const plan = planMigracion({ viejos: [{ id: 'OdonTeck-2026-ABC123', data: viejo() }], catalogo });
  assert.equal(plan.migrar.length, 1);
  assert.deepEqual(plan.migrar[0].doc, {
    folio: 'ODT-2026-00001', uid: 'u1', nombre: 'Dra. Ana Pérez', cursoId: 'diagnostico-en-ortodoncia',
    cursoTitulo: 'Diagnóstico en Ortodoncia', area: 'Ortodoncia', clases: 2, emitido: '2026-03-10T15:00:00.000Z',
    folioAnterior: 'OdonTeck-2026-ABC123',
  });
  assert.equal(plan.migrar[0].via, 'titulo');
  assert.equal(plan.migrar[0].cursoIdAnterior, 'AutoIdFirestore1');
});

test('planMigracion: duplicados, ya migrados, sin curso e inválidos', () => {
  const viejos = [
    { id: 'F-TARDE', data: viejo({ folio: 'OdonTeck-2027-ZZZ999', emitido: '2027-01-05T00:00:00Z' }) },
    { id: 'F-TEMPRANO', data: viejo() },
    { id: 'F-MIGRADO', data: viejo({ folio: 'F-MIGRADO', uid: 'u2' }) },
    { id: 'F-SINCURSO', data: viejo({ folio: 'F-SINCURSO', uid: 'u3', curso: 'Curso borrado', cursoId: 'nope' }) },
    { id: 'F-SINFECHA', data: viejo({ folio: 'F-SINFECHA', uid: 'u4', emitido: 'no-fecha', createdAt: null }) },
    { id: 'F-CREATED', data: viejo({ folio: undefined, uid: 'u5', emitido: undefined, sesiones: 0, area: 'Ortodoncia avanzada' }) },
  ];
  const v2Existentes = [
    { id: 'ODT-2026-00007', data: { folioAnterior: 'F-MIGRADO', uid: 'u2', cursoId: 'diagnostico-en-ortodoncia' } },
  ];
  const plan = planMigracion({ viejos, catalogo, v2Existentes });
  assert.deepEqual(plan.yaMigrados, [{ folioAnterior: 'F-MIGRADO', folio: 'ODT-2026-00007' }]);
  assert.deepEqual(plan.sinResolver.map((s) => s.folioAnterior), ['F-SINCURSO']);
  assert.deepEqual(plan.invalidos, [{ folioAnterior: 'F-SINFECHA', motivo: 'sin fecha de emisión válida' }]);
  assert.deepEqual(plan.duplicados.map((d) => d.folioAnterior), ['OdonTeck-2027-ZZZ999']);
  // Se conserva el más antiguo; folios continúan tras el mayor existente del año.
  const porAnterior = Object.fromEntries(plan.migrar.map((m) => [m.doc.folioAnterior, m.doc]));
  assert.equal(porAnterior['OdonTeck-2026-ABC123'].folio, 'ODT-2026-00009', 'misma fecha: desempata por folio anterior');
  const created = porAnterior['F-CREATED'];
  assert.equal(created.folio, 'ODT-2026-00008');
  assert.equal(created.emitido, '2026-03-10T15:00:00.000Z', 'usa createdAt si no hay emitido');
  assert.equal(created.clases, 2, 'sesiones 0 → número de clases del catálogo');
  assert.equal(created.area, 'Ortodoncia avanzada', 'conserva un área explícita');
});

test('asignarFolios por año y aIso con distintos formatos', () => {
  const docs = asignarFolios([{ emitido: '2025-12-31T23:00:00Z' }, { emitido: '2026-01-01T00:00:00Z' }, { emitido: '2025-06-01T00:00:00Z' }], ['ODT-2025-00041', 'basura']);
  assert.deepEqual(docs.map((d) => d.folio), ['ODT-2025-00042', 'ODT-2026-00001', 'ODT-2025-00043']);
  assert.equal(aIso({ toDate: () => new Date('2026-01-02T00:00:00Z') }), '2026-01-02T00:00:00.000Z');
  assert.equal(aIso({ seconds: 0 }), '1970-01-01T00:00:00.000Z');
  assert.equal(aIso('nope'), null);
  assert.equal(aIso(undefined), null);
});
